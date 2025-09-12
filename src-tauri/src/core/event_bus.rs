use serde::Serialize;
use tauri::{AppHandle, Emitter};

pub struct EventBus {
    app_handle: AppHandle,
}

impl EventBus {
    pub fn new(app_handle: AppHandle) -> Self {
        Self { app_handle }
    }

    pub fn publish<T: Clone + Serialize + Send + 'static>(&self, topic: &str, payload: T) {
        println!("🚀 Publishing event '{}'", topic);
        self.app_handle.emit(topic, payload).unwrap();
    }
}
