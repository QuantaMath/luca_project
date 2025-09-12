// This file defines the data structures for our 'employees' table.
use crate::schema::employees;
use diesel::prelude::*;
use serde::{Deserialize, Serialize};

/// Represents an employee record fetched from the database.
/// It is serializable to be sent to the frontend.
#[derive(Queryable, Selectable, Serialize, Deserialize, Clone, Debug)]
#[diesel(table_name = employees)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct Employee {
    pub id: i32,
    pub name: String,
    pub email: String,
    pub position: String,
    // Note: SQLite doesn't have a native datetime type, so Diesel maps
    // TIMESTAMP to String by default.
    pub created_at: String,
}

/// Represents a new employee to be inserted into the database.
/// It is deserializable to receive data from the frontend.
#[derive(Insertable, Deserialize)]
#[diesel(table_name = employees)]
pub struct NewEmployee {
    pub name: String,
    pub email: String,
    pub position: String,
}

/// Represents the data needed to update an existing employee.
/// It is deserializable to receive data from the frontend.
#[derive(AsChangeset, Deserialize)]
#[diesel(table_name = employees)]
pub struct UpdateEmployee {
    pub name: Option<String>,
    pub email: Option<String>,
    pub position: Option<String>,
}