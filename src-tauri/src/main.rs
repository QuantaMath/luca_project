// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod core;
fn main() {
  // Initialize the database connection pool from our new db module.
  let db_pool = core::db::establish_connection();
  

  tauri::Builder::default()
    // Use `.manage()` to add the database pool to Tauri's state.
    // Thi makes it accessible in all of your commands.
    .manage(db_pool)
    .invoke_handler(tauri::generate_handler![])
    .run(tauri::generate_context!())
    .expect("error while running tauri application"); 
  
  //  app_lib::run();
}
