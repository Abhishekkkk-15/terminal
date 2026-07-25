use std::{collections::HashMap, sync::mpsc::Sender};

use crate::pty_std::manager::{TerminalEvent, TerminalManager};

pub struct TerminalSession {
    pub sessions: HashMap<String, TerminalManager>,
}

impl TerminalSession {
    pub fn new(shell: &str, tx: Sender<TerminalEvent>) -> Result<Self, anyhow::Error> {
        let mut sessions = HashMap::new();
        sessions.insert(
            "1".to_string(),
            TerminalManager::new(shell.to_string(), tx)?,
        );

        Ok(Self { sessions: sessions })
    }
}
