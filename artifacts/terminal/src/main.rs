use portable_pty::{CommandBuilder, NativePtySystem, PtySize, PtySystem};
use std::sync::mpsc;
mod pty_std;
use pty_std::session::{TerminalEvent, TerminalManager};

use std::{
    io::{BufRead, BufReader, Write},
    sync::{Arc, Mutex},
    thread,
    time::Duration,
};

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let (tx, rx) = mpsc::channel::<TerminalEvent>();

    let mut terminal = TerminalManager::new("/bin/bash", tx)?;
    while let Ok(event) = rx.recv() {
            if let TerminalEvent::Output(ref text) = event {
            std::io::stdout().flush().unwrap();
            if text.contains('$') || text.contains('%') || text.contains('#') || text.contains('>')
            {
                break;
            }
    }
    };
    terminal.write(b"claude\n")?;

    while let Ok(event) = rx.recv() {
        match event {
            TerminalEvent::Output(text) => {
                println!("{text}")
            }
            TerminalEvent::Closed => {
                println!("Session closed")
            }
        }
    }

    terminal.kill()?;

    Ok(())
}
