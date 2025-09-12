use crate::modules::employee::models::Employee;
// Import both Serialize and Deserialize
use serde::{Deserialize, Serialize};

/// This event is published whenever a new employee is successfully created.
/// The payload contains the full Employee object.
// FIX: Add `Deserialize` to the derive macro.
#[derive(Clone, Serialize, Deserialize)]
pub struct EmployeeCreatedEvent {
    pub employee: Employee,
}
