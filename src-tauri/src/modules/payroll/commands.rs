use crate::core::db::DbPool;
use crate::core::error::AppResult;
// use crate::core::event_bus::EventBus;
use crate::modules::payroll::{
    // events::,
    models::{
        PayrollProfile, 
       // NewPayrollProfile, 
        UpdatePayrollProfile
    },
    repository::PayrollRepository,
};

use tauri::State;

#[tauri::command]
pub fn get_payroll_profile(
    pool: State<'_, DbPool>,
    employee_id: i32,

) -> AppResult<PayrollProfile>
{
    let repo = PayrollRepository;
    repo.get_profile_for_employee(&pool, employee_id)
}

#[tauri::command]
pub fn update_payroll_profile(
    pool: State<'_, DbPool>,
    empolyee_id: i32,
    profile_update_data: UpdatePayrollProfile,
) -> AppResult<PayrollProfile>
{
    let repo = PayrollRepository;
    
    repo.update_profile(&pool, empolyee_id, profile_update_data)
}

