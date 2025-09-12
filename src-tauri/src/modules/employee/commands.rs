use crate::core::db::DbPool;
use crate::core::error::AppResult;
use crate::core::event_bus::EventBus;
use crate::modules::employee::{
    events::EmployeeCreatedEvent,
    models::{Employee, NewEmployee, UpdateEmployee},
    repository::EmployeeRepository,
};
use tauri::State;

#[tauri::command]
pub async fn list_employees(pool: State<'_, DbPool>) -> AppResult<Vec<Employee>> {
    // FIX: Instantiate the repository directly instead of getting it from state.
    let repo = EmployeeRepository;
    repo.get_all_employees(&pool)
}

#[tauri::command]
pub async fn add_employee(
    pool: State<'_, DbPool>,
    event_bus: State<'_, EventBus>,
    employee_data: NewEmployee,
) -> AppResult<Employee> {
    // FIX: Instantiate the repository directly.
    let repo = EmployeeRepository;
    let new_employee = repo.create_employee(&pool, employee_data)?;

    event_bus.publish(
        "employee_created",
        EmployeeCreatedEvent {
            employee: new_employee.clone(),
        },
    );

    Ok(new_employee)
}

#[tauri::command]
pub async fn update_employee(
    pool: State<'_, DbPool>,
    employee_id: i32,
    employee_data: UpdateEmployee,
) -> AppResult<Employee> {
    // FIX: Instantiate the repository directly.
    let repo = EmployeeRepository;
    repo.update_employee(&pool, employee_id, employee_data)
}

#[tauri::command]
pub async fn delete_employee(pool: State<'_, DbPool>, employee_id: i32) -> AppResult<usize> {
    // FIX: Instantiate the repository directly.
    let repo = EmployeeRepository;
    repo.delete_employee(&pool, employee_id)
}
