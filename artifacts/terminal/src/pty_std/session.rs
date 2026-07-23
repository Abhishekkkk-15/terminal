use anyhow::{Ok, Result};
use portable_pty::{Child, CommandBuilder, MasterPty, PtyPair, PtySize, native_pty_system};
use std::io::{BufRead, BufReader, Read, Write};

pub struct TerminalSession {
    pub id: String,
    writer: Box<dyn Write + Send>,
    reader: Box<dyn Read + Send>,
}

impl TerminalSession {
    pub fn new(id: String) -> Result<Self> {
        let pty_system = native_pty_system();
        let pair = pty_system.openpty(PtySize {
            rows: 24,
            cols: 80,
            pixel_width: 0,
            pixel_height: 0,
        })?;
        #[cfg(target_os = "windows")]
        let shell = "bash";

        #[cfg(not(target_os = "windows"))]
        let shell = "bash";

        let cmd = CommandBuilder::new(shell);
        pair.slave.spawn_command(cmd)?;
        let writer = pair.master.take_writer()?;
        let reader = pair.master.try_clone_reader()?;
        Ok(Self { id, reader, writer })
    }

    pub fn split(self) -> (PtyReader, PtyWriter) {
        (
            PtyReader {
                reader: self.reader,
            },
            PtyWriter {
                writer: self.writer,
            },
        )
    }
}

pub struct PtyReader {
    reader: Box<dyn Read + Send>,
}

impl PtyReader {
    pub fn read(&mut self) -> Result<String> {
        let mut buffer = [0u8; 4096];
        let bytes_read = self.reader.read(&mut buffer)?;
        if bytes_read == 0 {
            anyhow::bail!("EOF reached");
        }
        Ok(String::from_utf8_lossy(&buffer[..bytes_read]).to_string())
    }
    pub fn read_chunk(&mut self) -> Result<Vec<u8>> {
        let mut buffer = [0u8; 4096];
        let bytes_read = self.reader.read(&mut buffer)?;
        if bytes_read == 0 {
            anyhow::bail!("EOF reached");
        }
        Ok(buffer[..bytes_read].to_vec())
    }
}

pub struct PtyWriter {
    writer: Box<dyn Write + Send>,
}

impl PtyWriter {
    pub fn write(&mut self, input: &str) -> Result<()> {
        self.writer.write_all(input.as_bytes())?;
        self.writer.flush()?;
        Ok(())
    }
}

struct TerminalManager {
    master: Box<dyn MasterPty + Send>,
    writer: Box<dyn Write + Send>,
    reader: Box<dyn Read + Send>,
    child: Box<dyn Child + Send>,
}

impl TerminalManager {
    pub fn new(shell: &str) -> Result<Self> {
        let pty_system = native_pty_system();

        let pair = pty_system.openpty(PtySize {
            rows: 24,
            cols: 80,
            pixel_width: 0,
            pixel_height: 0,
        })?;

        let cmd = CommandBuilder::new(shell);
        let child = pair.slave.spawn_command(cmd)?;

        let reader = pair.master.try_clone_reader()?;
        let writer = pair.master.take_writer()?;

        Ok(Self {
            master: pair.master,
            reader,
            writer,
            child,
        })
    }

    pub fn wirte(&mut self, bytes: &[u8]) -> Result<()> {
        self.writer.write_all(&bytes)?;
        self.writer.flush()?;
        Ok(())
    }

    pub fn read(&mut self, buffer: &mut [u8]) -> Result<usize> {
        Ok(self.reader.read(buffer)?)
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
