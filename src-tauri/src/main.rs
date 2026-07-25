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
fn main() {
    terminal_ui_lib::run()
}

// fn main() -> Result<(), anyhow::Error> {
//     let (tx, rx) = mpsc::channel::<TerminalEvent>();

//     let mut sessions = TerminalSession::new("/bin/bash", tx)?;
//     let mut terminal = sessions.sessions.remove("1").unwrap();
//     terminal.write(b"ls -al\n")?;

//     while let Ok(event) = rx.recv() {
//         match event {
//             TerminalEvent::Output(text) => {
//                 println!("{text}")
//             }
//             TerminalEvent::Closed => {
//                 println!("Session closed")
//             }
//         }
//     }

//     terminal.kill()?;

//     Ok(())
// }
