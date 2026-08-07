// Prevents an additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use std::env;
use std::sync::{mpsc, Arc, Mutex};
mod pty_std;
use pty_std::manager::TerminalEvent;
use pty_std::session::TerminalSession;
use std::io::Write;
use tauri::{AppHandle, Emitter, State};

struct AppTerminalState {
    terminal: Arc<Mutex<Option<TerminalSession>>>,
}

fn get_default_shell() -> String {
    if cfg!(target_os = "windows") {
        env::var("COMSPEC").unwrap_or_else(|_| "cmd.exe".to_string())
    } else {
        env::var("SHELL").unwrap_or_else(|_| "/bin/bash".to_string())
    }
}

#[tauri::command]
async fn start_pty(
    app_handle: AppHandle,
    state: State<'_, AppTerminalState>,
) -> Result<(), String> {
    let mut guard = state.terminal.lock().map_err(|e| e.to_string())?;

    // If session is already initialized, return early to avoid killing active PTY
    if guard.is_some() {
        return Ok(());
    }

    let shell = get_default_shell();
    let (tx, rx) = mpsc::channel::<TerminalEvent>();

    // Initialize the session
    let sessions = TerminalSession::new(&shell, tx).map_err(|e| e.to_string())?;

    *guard = Some(sessions);
    drop(guard);

    std::thread::spawn(move || {
        while let Ok(event) = rx.recv() {
            match event {
                TerminalEvent::Output(text) => {
                    let _ = app_handle.emit("pty-output", text);
                }
                TerminalEvent::Closed => {
                    let _ = app_handle.emit("pty-closed", "Session closed");
                    break;
                }
            }
        }
    });

    Ok(())
}

#[tauri::command]
async fn write_pty(command: String, state: State<'_, AppTerminalState>) -> Result<(), String> {
    let mut guard = state.terminal.lock().map_err(|e| e.to_string())?;

    if let Some(ref mut sessions) = *guard {
        let terminal = sessions
            .sessions
            .get_mut("1")
            .ok_or_else(|| "Terminal session '1' not found".to_string())?;
        
        let formatted_cmd = if command.ends_with('\n') || command.ends_with('\r') {
            command
        } else if cfg!(target_os = "windows") {
            format!("{}\r\n", command)
        } else {
            format!("{}\n", command)
        };

        terminal
            .write(formatted_cmd.as_bytes())
            .map_err(|e| e.to_string())?;
        Ok(())
    } else {
        Err("PTY session is not initialized. Call start_pty first.".into())
    }
}

// fn main() -> Result<(), anyhow::Error> {
//     let (tx, rx) = mpsc::channel::<TerminalEvent>();

//     let shell = if cfg!(target_os = "windows") {
//         "cmd.exe"
//     } else {
//         "bash"
//     };
//     let initial_cmd: &[u8] = if cfg!(target_os = "windows") {
//         b"dir\r\n"
//     } else {
//         b"ls -al\n"
//     };

//     let mut sessions = TerminalSession::new(shell, tx)?;
//     let mut terminal = sessions.sessions.remove("1").unwrap();

//     while let Ok(event) = rx.recv() {
//         if let TerminalEvent::Output(ref text) = event {
//             if text.contains('$') || text.contains('%') || text.contains('#') || text.contains('>')
//             {
//                 break;
//             }
//         }
//     }
//     terminal.write(initial_cmd)?;

//     for event in rx {
//         match event {
//             TerminalEvent::Output(text) => {
//                 print!("{text}");
//                 let _ = std::io::stdout().flush();
//             }
//             TerminalEvent::Closed => {
//                 println!("\nSession closed");
//                 break;
//             }
//         }
//     }

//     terminal.kill()?;
//     // terminal_ui_lib::run();

//     Ok(())
// }

fn main() {
    tauri::Builder::default()
        .manage(AppTerminalState {
            terminal: Arc::new(Mutex::new(None)),
        })
        .invoke_handler(tauri::generate_handler![start_pty, write_pty])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
