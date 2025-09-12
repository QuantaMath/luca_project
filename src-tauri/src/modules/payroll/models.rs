use crate::schema::payroll_profiles;
use diesel::prelude::*;
use serde::{Deserialize, Serialize};

/// Represent a payroll record fatch from the database.
/// It is serializable to be sent to the frontend.
#[derive(Queryable, Selectable, Serialize, Clone, Debug)]
#[diesel(table_name = crate::schema::payroll_profiles)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct PayrollProfile {
    pub id: i32,
    pub employee_id: i32,
    pub salary: f64,
    pub bank_info: Option<String>,
}

/// Represents a new employee to be inserted into the database.
/// It is desrializable to receive data from frontend.
#[derive(Insertable, Deserialize)]
#[diesel(table_name = payroll_profiles)]
pub struct NewPayrollProfile {
    pub employee_id: i32,
    pub salary: f64,
    pub bank_info: Option<String>
}

#[derive(AsChangeset, Deserialize)]
#[diesel(table_name = payroll_profiles)]
pub struct UpdatePayrollProfile {
    pub salary: Option<f64>,
    pub bank_info: Option<String>
}