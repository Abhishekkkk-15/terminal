use std::collections::HashMap;

use anyhow::Ok;

use crate::pty_std::session::TerminalSession;

pub struct SessionManager {
    session: HashMap<String, TerminalSession>,
}

impl SessionManager {
    pub fn new() -> Self {
        Self {
            session: HashMap::new(),
        }
    }
    pub fn create_session(&mut self, id: String) -> Result<(), anyhow::Error> {
        let session = TerminalSession::new(id.clone())?;
        self.session.insert(id, session);
        Ok(())
    }

    pub fn get_session_mut(&mut self, id: &str) -> Option<&mut TerminalSession> {
        self.session.get_mut(id)
    }

    pub fn remove_session(&mut self, id: &str) {
        self.session.remove(id);
    }
}
