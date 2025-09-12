// src-tauri/src/main.rs

// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;
use crate::modules::payroll::listeners::setup_payroll_listeners;

mod core;
mod modules;
mod schema;
mod api; // <-- 1. Declare the new api module

fn main() {
    let db_pool = core::db::establish_connection();

    tauri::Builder::default()
        .manage(db_pool)
        .setup(|app| {
            let event_bus = core::event_bus::EventBus::new(app.handle().clone());
            app.manage(event_bus);

            // Start the payroll event listener in the background (Newly Added)
            setup_payroll_listeners(app.handle());

            Ok(())
        })
        .invoke_handler(api::get_handlers())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
