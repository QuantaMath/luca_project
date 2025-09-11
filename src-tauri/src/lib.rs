pub mod core;
pub mod modules;
pub mod schema;
pub mod api;

use crate::core::event_bus::EventBus;
use crate::modules::employee::repository::EmployeeRepository;
use tauri::Manager;

// This function contains the application setup logic.
pub fn run() {
    let db_pool = core::db::establish_connection();

    tauri::Builder::default()
        .manage(db_pool)
        .setup(|app| {
            // Manage concrete types
            app.manage(EventBus::new(app.handle().clone()));
            app.manage(EmployeeRepository);
            Ok(())
        })
        .invoke_handler(api::get_handlers())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}