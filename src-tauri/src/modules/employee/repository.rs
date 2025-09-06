// The repository pattern encapsulates all database logic for a given model.
// All functions here interact directly with the database.
use crate::core::db::DbPool;
use crate::core::errors::{AppError, AppResult};
use crate::modules::employee::models::{Employee, NewEmployee, UpdateEmployee};
use crate::schema::employees::dsl::*;
use diesel::prelude::*;

/// Creates a new employee in the database.

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

    // Start a transaction to ensure atomicity
    conn.transaction(|conn| {
        // Insert the new employee into the 'employees' table
        diesel::insert_into(employees)
            .values(&new_employee)
            .execute(conn)?;

        // Fetch the last inserted employee (assuming `id` is auto-incremented)
        let employee = employees
            .order(id.desc())
            .first::<Employee>(conn)?;
        
        Ok(employee)
    })
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
    let employee = employees.find(employee_id).first(&mut conn)?;
    Ok(employee)
}

/// Updates an existing employee's data in the database.
pub fn update_employee(pool: &DbPool, employee_id: i32, updated_data: UpdateEmployee) -> AppResult<Employee> {
    let mut conn = pool.get()?;

    // Start a transaction to ensure atomicity
    conn.transaction(|conn| {
        // Update the employee in the 'employees' table
        diesel::update(employees.find(employee_id))
            .set(&updated_data)
            .execute(conn)?;

        // Fetch the updated employee
        let employee = employees
            .find(employee_id)
            .first::<Employee>(conn)?;
        
        Ok(employee)
    })
}

/// Deletes an employee from the database by their ID.
pub fn delete_employee(pool: &DbPool, employee_id: i32) -> AppResult<usize> {
    let mut conn = pool.get()?;
    // `diesel::delete` returns the number of rows deleted.
    let num_deleted = diesel::delete(employees.find(employee_id)).execute(&mut conn)?;
    Ok(num_deleted)
}

