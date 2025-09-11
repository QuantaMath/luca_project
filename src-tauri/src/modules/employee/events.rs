use crate::modules::employee::models::Employee;
use serde::Serialize;

#[derive(Clone, Serialize)]
pub struct EmployeeCreatedEvent {
    pub employee: Employee,
}