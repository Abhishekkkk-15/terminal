use anyhow::Result;
use portable_pty::{Child, CommandBuilder, MasterPty, PtyPair, PtySize, native_pty_system};
use std::collections::HashMap;
use std::{
    io::{BufRead, BufReader, Read, Write},
    sync::mpsc::Sender,
    thread,
};

use crate::pty_std::session::TerminalSession;
pub enum TerminalEvent {
    Output(String),
    Closed,
}
pub struct TerminalManager {
    master: Box<dyn MasterPty + Send>,
    writer: Box<dyn Write + Send>,
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
        let writer = pair.master.take_writer()?;
        thread::spawn(move || {
            let mut buffer = [0u8; 1024];

            loop {
                match reader.read(&mut buffer) {
                    Ok(n) => {
                        // Continuous stream chunk received!
                        let output = String::from_utf8_lossy(&buffer[..n]);
                        tx.send(TerminalEvent::Output(output.into_owned())).unwrap();
                    }
                    Err(err) => {
                        eprintln!("Read error: {}", err);
                        tx.send(TerminalEvent::Closed).unwrap();
                        break;
                    }
                }
            }
        });
        Ok(Self {
            master: pair.master,
            writer,
            child,
        })
    }

    pub fn write(&mut self, bytes: &[u8]) -> Result<()> {
        self.writer.write_all(&bytes)?;
        self.writer.flush()?;
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
