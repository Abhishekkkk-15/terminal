use anyhow::{Ok, Result};
use portable_pty::{CommandBuilder, PtyPair, PtySize, native_pty_system};
use std::io::{BufRead, BufReader, Read, Write};

pub struct TerminalSession {
    pub id: String,
    pty: PtyPair,
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
        Ok(Self { id, pty: pair })
    }

    pub fn write(&mut self, input: &str) -> Result<()> {
        let mut writer = self.pty.master.take_writer()?;
        writer.write_all(input.as_bytes())?;
        writer.flush()?;
        Ok(())
    }

    pub fn read(&mut self) -> Result<String> {
        let mut reader = self.pty.master.try_clone_reader()?;
        let mut buffer = [0u8; 4096];
        let bytes_read = reader.read(&mut buffer)?;
        let output = String::from_utf8_lossy(&buffer[..bytes_read]).into_owned();
        Ok(output)
    }
}
