use crate::core::db::DbPool;
use crate::core::error::{AppError, AppResult};
use crate::modules::employee::models::{Employee, NewEmployee, UpdateEmployee};
use crate::schema::employees::dsl::*;
use diesel::prelude::*;

/// Create a new employee in the database
pub fn create_employee(pool: &DbPool, new_employee: NewEmployee) -> AppResult<Employee> {
    // Get a connection from the pool
    let mut conn = pool.get()?;

    // Basic validation
    if new_employee.name.trim().is_empty() {
        return Err(AppError::Validation("Employee name cannot be empty.".to_string()));
    }
    if new_employee.email.trim().is_empty() || !new_employee.email.contains('@') {
        return Err(AppError::Validation("A valid email is required.".to_string()));
    }

    // Insert the employee into the 'employees' table and return the created record.
    let employee = diesel::insert_into(employee)
        .values(&new_employee)
        .get_result(&mut conn)?;
    Ok(employee)
}

/// Fetches all employees from the database.
pub fn get_all_employees(pool: &DbPool) -> AppResult<Vec<Employee>> {
    let mut conn = pool.get()?;
    let results = employees.select(Employee::as_select()).load(&mut conn)?;
    Ok(results)
}

/// Fetches a single employee by their ID.
pub fn get_employee_by_id(pool: &DbPool, employee_id: i32) -> AppResult<Employee> {
    let mut conn = pool.get()?;
    let results = employees.select(Employee::as_select()).load(&mut conn)?;
    Ok(results)
}

// Updates an existing employee's data in the database.
pub fn update_employee(pool: &DbPool, employee_id: i32, update_data: UpdateEmployee) -> AppResult<Employee> {
    let mut conn = pool.get()?;
    let employee = diesel::update(employees.find(employee_id))
        .set(&update_data)
        .get_result(&mut conn)?;
    Ok(employee)
}

// Deletes an employee from the database.
pub fn delete_employee(pool: &DbPool, employee_id: i32) -> AppResult<usize> {
    let mut conn = pool.get()?;
    let num_deleted = diesel::delete(employees.find(employee_id)).execute(&mut conn)?;
    Ok(num_deleted)
}