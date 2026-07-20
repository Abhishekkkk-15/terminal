use portable_pty::{CommandBuilder, NativePtySystem, PtySize, PtySystem};
use std::{
    io::{BufRead, BufReader, Write},
    thread,
    time::Duration,
};
mod pty_std;
use pty_std::session::TerminalSession;
fn main() -> Result<(), Box<dyn std::error::Error>> {
    let mut terminal = TerminalSession::new("xyz1".to_string())?;
    thread::sleep(Duration::from_millis(100));
    let _startup_prompt = terminal.read()?; // clear out the initial zsh prompt text
    let my_command = "pwd\n";
    terminal.write(my_command)?;
    thread::sleep(Duration::from_millis(200));
    let output = terminal.read()?;
    println!("--- PTY Output Start ---");
    println!("{output}");
    println!("--- PTY Output End ---");
    Ok(())
}
