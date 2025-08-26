use crate::schema::employees;
use diesel::prelude::*;
use serde::{Deserialize, Serialize};

/// Represents and employee record fetched from the database.
/// It is serializable to be sent to the frontend.
#[derive(Queryable, Selectable, Serialize, Clone, Debug)]
#[diesel(table_name = employees)]
#[diesel(check_for_backend(diesel::sqlite::Sqlite))]
pub struct Employee {
    pub id: i32,
    pub name: String,
    pub email: String,
    pub position: String,
    // Note SQLite doesn't have anative datetime type, so Diesel maps
    // TIMESTAMP to String by default.
    pub created_at: String,
}

/// Reperesents a new employee to be inserted into the database.
/// It is deserializable to receive data from the frontend.
#[derive(Inserable, Deserialize)]
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
    pub name: String,
    pub email: String,
    pub position: String,
}

