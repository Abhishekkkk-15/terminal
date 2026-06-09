// ─── Tauri application entry point ───────────────────────────────────────────
//
// This is where Rust backend commands will be registered once the PTY
// integration is built. The frontend already has service abstractions in
// src/services/tauri/ ready to be wired up.
//
// Future commands to add here:
//   .invoke_handler(tauri::generate_handler![
//       write_terminal,
//       resize_terminal,
//       get_workspace,
//       execute_workflow,
//       send_agent_message,
//   ])
//
// Future events to emit from Rust:
//   terminal-output, command-started, command-finished,
//   workspace-updated, agent-message, backend-status

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_os::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
