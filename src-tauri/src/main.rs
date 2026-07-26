// Prevents an additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use portable_pty::{CommandBuilder, NativePtySystem, PtySize, PtySystem};
use std::sync::mpsc;
mod pty_std;
use pty_std::manager::TerminalEvent;
use pty_std::session::TerminalSession;
use std::{
    io::{BufRead, BufReader, Write},
    sync::{Arc, Mutex},
};
fn main() -> Result<(), anyhow::Error> {
    print!("Hey");
    let (tx, rx) = mpsc::channel::<TerminalEvent>();

    let shell = if cfg!(target_os = "windows") {
        "powershell.exe"
    } else {
        "bash"
    };
    let initial_cmd: &[u8] = if cfg!(target_os = "windows") {
        b"dir\n"
    } else {
        b"ls -al\n"
    };

    let mut sessions = TerminalSession::new(shell, tx)?;
    let mut terminal = sessions.sessions.remove("1").unwrap();
    terminal.write(initial_cmd)?;

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
    terminal_ui_lib::run();

    Ok(())
}
