// This file contains background listeners for events from other modules.
// This is the key to our decoupled, modular architecture.

use crate::core::db::DbPool;
use crate::modules::employee::events::EmployeeCreatedEvent;
use crate::modules::payroll::models::NewPayrollProfile;
use crate::modules::payroll::repository::PayrollRepository;
use tauri::{AppHandle, Listener, Manager};

/// Sets up a listener that runs in the background for the lifetime of the application.
pub fn setup_payroll_listeners(app_handle: &AppHandle) {
    // Clone the handles needed for the background task.
    // AppHandle and DbPool are thread-safe (wrapped in Arc internally).
    let handle = app_handle.clone();
    let pool = app_handle.state::<DbPool>().inner().clone();

    // Spawn a background task.
    tauri::async_runtime::spawn(async move {
        // Listen for the "employee_created" event.
        // The event payload will be of type EmployeeCreatedEvent.
        handle.listen("employee_created", move |event| {
            println!("Payroll module received an 'employee_created' event!");

            // FIX: The payload is a &str, not an Option<&str>.
            // We get it directly and then attempt to deserialize.
            let payload = event.payload();
            match serde_json::from_str::<EmployeeCreatedEvent>(payload) {
                Ok(employee_event) => {
                    let repo = PayrollRepository;
                    let new_employee_id = employee_event.employee.id;

                    // Create a default payroll profile for the new employee.
                    let default_profile = NewPayrollProfile {
                        employee_id: new_employee_id,
                        salary: 0.0, // Default salary is $0
                        bank_info: None,
                    };

                    // Use the repository to save the new profile to the database.
                    match repo.create_profile(&pool, default_profile) {
                        Ok(profile) => {
                            println!(
                                "Successfully created default payroll profile for employee ID: {}",
                                profile.employee_id
                            );
                        }
                        Err(e) => {
                            eprintln!(
                                "Failed to create default payroll profile for employee ID: {}. Error: {}",
                                new_employee_id, e
                            );
                        }
                    }
                }
                Err(e) => {
                    eprintln!("Failed to deserialize EmployeeCreatedEvent payload: {}. Payload was: {}", e, payload);
                }
            }
        });
    });
}

