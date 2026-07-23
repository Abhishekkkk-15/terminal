use portable_pty::{CommandBuilder, NativePtySystem, PtySize, PtySystem};
use std::sync::mpsc;
use std::{
    io::{BufRead, BufReader, Write},
    sync::{Arc, Mutex},
    thread,
    time::Duration,
};
enum TerminalEvent {
    Output(String),
    Closed,
}
mod pty_std;
use pty_std::session::TerminalSession;
fn main() -> Result<(), Box<dyn std::error::Error>> {
    let session = TerminalSession::new("xyz1".to_string())?;
    let (mut pty_reader, mut pty_writer) = session.split();
    let (tx, rx) = mpsc::channel::<TerminalEvent>();
    thread::spawn(move || {
        loop {
            match pty_reader.read_chunk() {
                Ok(n) => {
                    let text = String::from_utf8_lossy(&n).to_string();
                    if tx.send(TerminalEvent::Output(text)).is_err() {
                        break;
                    }
                }
                Err(_) => {
                    let _ = tx.send(TerminalEvent::Closed);
                    break;
                }
            }
        }
    });
    let my_command = "ls -al\n";
    while let Ok(event) = rx.recv() {
        if let TerminalEvent::Output(ref text) = event {
            std::io::stdout().flush().unwrap();
            if text.contains('$') || text.contains('%') || text.contains('#') || text.contains('>')
            {
                break;
            }
        }
    }

    pty_writer.write(&my_command);
    while let Ok(event) = rx.recv() {
        match event {
            TerminalEvent::Output(text) => {
                println!("{text}");
                std::io::stdout().flush().unwrap();
            }
            TerminalEvent::Closed => {
                println!("\n--- Terminal Session Ended ---");
                break;
            }
        }
    }
    Ok(())
}
