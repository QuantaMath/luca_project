// --- File: src-tauri/src/api.rs (Corrected) ---
use tauri::{generate_handler, ipc::Invoke, Runtime};
use crate::modules::{employee, payroll};
// This function generates a closure that contains all Tauri command handlers.
pub fn get_handlers<R: Runtime>() -> impl Fn(Invoke<R>) -> bool + Send + Sync + 'static {    generate_handler![
        employee::commands::add_employee,
        employee::commands::list_employees,
        employee::commands::update_employee,
        employee::commands::delete_employee,
       
        // Payroll Module Commands
        payroll::commands::get_payroll_profile,
        payroll::commands::update_payroll_profile,

    ]
}