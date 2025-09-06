// --- File: src-tauri/src/api.rs (Corrected) ---
use tauri::{generate_handler, ipc::Invoke, Runtime};

// This function generates a closure that contains all Tauri command handlers.
pub fn get_handlers<R: Runtime>() -> impl Fn(Invoke<R>) -> bool + Send + Sync + 'static {    generate_handler![
        crate::modules::employee::commands::add_employee,
        crate::modules::employee::commands::list_employees,
        crate::modules::employee::commands::update_employee,
        crate::modules::employee::commands::delete_employee,
    ]
}