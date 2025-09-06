use crate::core::db::DbPool;
use crate::core::errors::AppResult;
use crate::modules::employee::{
    models::{Employee, NewEmployee, UpdateEmployee},
    repository,
};
use tauri::State;

#[tauri::command]
pub async fn list_employees(pool: State<'_, DbPool>) -> AppResult<Vec<Employee>> {
    let employees = repository::get_all_employees(&pool)?;
    Ok(employees)
}

#[tauri::command]
pub async fn add_employee(
    pool: State<'_, DbPool>,
    new_employee: NewEmployee,
) -> AppResult<Employee> {
    // The command's logic is simple: call the repository.
    // In a real app, you might add more validation or business logic here
    let new_employee = repository::create_employee(&pool, new_employee)?;

    // TODO: In the next step, we'll publish an `EmployeeCreateEvent` here.
    Ok(new_employee)
}

#[tauri::command]
pub async fn update_employee(
    pool: State<'_, DbPool>,
    employee_id: i32,
    employee_data: UpdateEmployee,
) -> AppResult<Employee> {
    let updated_employee = repository::update_employee(&pool, employee_id, employee_data)?;
    Ok(updated_employee)
}

#[tauri::command]
pub async fn delete_employee(pool: State<'_, DbPool>, employee_id: i32) -> AppResult<usize> {
    let num_deleted = repository::delete_employee(&pool, employee_id)?;
    Ok(num_deleted)
}

