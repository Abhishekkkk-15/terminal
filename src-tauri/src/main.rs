// Prevents an additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use std::sync::mpsc;
mod pty_std;
use pty_std::manager::TerminalEvent;
use pty_std::session::TerminalSession;
use std::io::Write;

fn main() -> Result<(), anyhow::Error> {
    let (tx, rx) = mpsc::channel::<TerminalEvent>();

    let shell = if cfg!(target_os = "windows") {
        "cmd.exe"
    } else {
        "bash"
    };
    let initial_cmd: &[u8] = if cfg!(target_os = "windows") {
        b"dir\r\n"
    } else {
        b"ls -al\n"
    };

    let mut sessions = TerminalSession::new(shell, tx)?;
    let mut terminal = sessions.sessions.remove("1").unwrap();

    while let Ok(event) = rx.recv() {
        if let TerminalEvent::Output(ref text) = event {
            if text.contains('$') || text.contains('%') || text.contains('#') || text.contains('>')
            {
                break;
            }
        }
    }
    terminal.write(initial_cmd)?;

    for event in rx {
        match event {
            TerminalEvent::Output(text) => {
                print!("{text}");
                let _ = std::io::stdout().flush();
            }
            TerminalEvent::Closed => {
                println!("\nSession closed");
                break;
            }
        }
    }

    terminal.kill()?;
    // terminal_ui_lib::run();

    Ok(())
}
