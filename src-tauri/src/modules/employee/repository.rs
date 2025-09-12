use crate::core::db::DbPool;
use crate::core::error::AppResult;
use crate::modules::employee::models::{Employee, NewEmployee, UpdateEmployee};
use crate::schema::employees::dsl::*;
use diesel::prelude::*;

#[derive(Clone, Copy)]
pub struct EmployeeRepository;

impl EmployeeRepository {
    pub fn create_employee(&self, pool: &DbPool, new_employee: NewEmployee) -> AppResult<Employee> {
        let mut conn = pool.get()?;
        diesel::insert_into(employees)
            .values(&new_employee)
            .execute(&mut conn)?;

        let created_employee = employees
            .order(id.desc())
            .select(Employee::as_select())
            .first(&mut conn)?;

        Ok(created_employee)
    }

    pub fn get_all_employees(&self, pool: &DbPool) -> AppResult<Vec<Employee>> {
        let mut conn = pool.get()?;
        let results = employees.select(Employee::as_select()).load(&mut conn)?;
        Ok(results)
    }

    pub fn get_employee_by_id(&self, pool: &DbPool, employee_id: i32) -> AppResult<Employee> {
        let mut conn = pool.get()?;
        let employee = employees
            .find(employee_id)
            .select(Employee::as_select())
            .first(&mut conn)?;
        Ok(employee)
    }

    pub fn update_employee(&self, pool: &DbPool, employee_id: i32, updated_data: UpdateEmployee) -> AppResult<Employee> {
        let mut conn = pool.get()?;
        diesel::update(employees.find(employee_id))
            .set(&updated_data)
            .execute(&mut conn)?;

        self.get_employee_by_id(pool, employee_id)
    }

    pub fn delete_employee(&self, pool: &DbPool, employee_id: i32) -> AppResult<usize> {
        let mut conn = pool.get()?;
        let num_deleted = diesel::delete(employees.find(employee_id)).execute(&mut conn)?;
        Ok(num_deleted)
    }
}
