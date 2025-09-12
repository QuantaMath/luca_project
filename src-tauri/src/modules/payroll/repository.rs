use crate::core::db::DbPool;
use crate::core::error::AppResult;
use crate::modules::payroll::models::{
    PayrollProfile,
    NewPayrollProfile,
    UpdatePayrollProfile,
};
use crate::schema::payroll_profiles::dsl::*;
use diesel::prelude::*;

#[derive(Clone, Copy)]
pub struct PayrollRepository;


impl PayrollRepository {
    pub fn create_profile(&self, pool: &DbPool, new_payroll_profile: NewPayrollProfile) -> AppResult<PayrollProfile> {
        let mut conn = pool.get()?;
        diesel::insert_into(payroll_profiles)
        .values(&new_payroll_profile)
        .execute(&mut conn)?;


        self.get_profile_for_employee(pool, new_payroll_profile.employee_id)
    }

    pub fn get_profile_for_employee(&self, pool: &DbPool, emp_id: i32) -> AppResult<PayrollProfile> {
        let mut conn = pool.get()?;
        let profile = payroll_profiles
            .filter(employee_id.eq(emp_id))
            .select(PayrollProfile::as_select())
            .first(&mut conn)?;
        
        Ok(profile)

    }

    pub fn update_profile(&self, pool: &DbPool, emp_id: i32, updated_data: UpdatePayrollProfile) -> AppResult<PayrollProfile> {
        let mut conn = pool.get()?;
        diesel::update(payroll_profiles.filter(employee_id.eq(emp_id)))
            .set(&updated_data)
            .execute(&mut conn)?;

        self.get_profile_for_employee(pool, emp_id)
    }

    pub fn delete_profile(&self, pool: &DbPool, emp_id: i32) -> AppResult<usize> {
        let mut conn = pool.get()?;
        let num_deleted = diesel::delete(payroll_profiles.filter(employee_id.eq(emp_id))).execute(&mut conn)?;
        Ok(num_deleted)
    }
}



