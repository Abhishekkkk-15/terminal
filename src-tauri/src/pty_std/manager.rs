use anyhow::Result;
use portable_pty::{
    native_pty_system, Child, CommandBuilder, MasterPty, PtyPair, PtySize, SlavePty,
};
use std::collections::HashMap;
use std::{
    io::{BufRead, BufReader, Read, Write},
    sync::mpsc::Sender,
    thread,
};

use crate::pty_std::session::TerminalSession;
use std::sync::{Arc, Mutex};
pub enum TerminalEvent {
    Output(String),
    Closed,
}
pub struct TerminalManager {
    master: Box<dyn MasterPty + Send>,
    slave: Box<dyn SlavePty + Send>,
    writer: Arc<Mutex<Box<dyn Write + Send>>>,
    child: Box<dyn Child + Send>,
}

impl TerminalManager {
    pub fn new(shell: String, tx: Sender<TerminalEvent>) -> Result<Self> {
        let pty_system = native_pty_system();

        let pair = pty_system.openpty(PtySize {
            rows: 24,
            cols: 80,
            pixel_width: 0,
            pixel_height: 0,
        })?;

        let cmd = CommandBuilder::new(shell);
        let child = pair.slave.spawn_command(cmd)?;

        let mut reader = pair.master.try_clone_reader()?;
        let writer = Arc::new(Mutex::new(pair.master.take_writer()?));
        let writer_clone = Arc::clone(&writer);
        thread::spawn(move || {
            let mut buffer = [0u8; 1024];

            loop {
                match reader.read(&mut buffer) {
                    Ok(0) => {
                        let _ = tx.send(TerminalEvent::Closed);
                        break;
                    }
                    Ok(n) => {
                        // Continuous stream chunk received!
                        let output = String::from_utf8_lossy(&buffer[..n]);
                        if output.contains("\u{1b}[6n") {
                            if let Ok(mut w) = writer_clone.lock() {
                                let _ = w.write_all(b"\x1b[1;1R");
                                let _ = w.flush();
                            }
                        }
                        if tx.send(TerminalEvent::Output(output.into_owned())).is_err() {
                            break;
                        }
                    }
                    Err(err) => {
                        eprintln!("Read error: {}", err);
                        let _ = tx.send(TerminalEvent::Closed);
                        break;
                    }
                }
            }
        });
        Ok(Self {
            master: pair.master,
            slave: pair.slave,
            writer,
            child,
        })
    }

    pub fn write(&mut self, bytes: &[u8]) -> Result<()> {
        if let Ok(mut w) = self.writer.lock() {
            w.write_all(&bytes)?;
            w.flush()?;
        }
        Ok(())
    }

    pub fn resize(&self, rows: u16, cols: u16) -> Result<()> {
        self.master.resize(PtySize {
            rows,
            cols,
            pixel_width: 0,
            pixel_height: 0,
        });
        Ok(())
    }

    pub fn kill(&mut self) -> Result<()> {
        self.child.kill()?;
        Ok(())
    }

    pub fn wait(&mut self) -> Result<()> {
        self.child.wait()?;
        Ok(())
    }
}
