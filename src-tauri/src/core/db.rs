// src-tauri/src/core/db.rs

use diesel::r2d2::{self, ConnectionManager};
use diesel::sqlite::SqliteConnection;
use std::env;

// Type alias for the connection pool for easier use elsewhere.
pub type DbPool = r2d2::Pool<ConnectionManager<SqliteConnection>>;

/// Establishes a connection pool to the SQLite database.
/// This function is called once at startup.
pub fn establish_connection() -> DbPool {
    // For a desktop app, the database file will typically be in a known location.
    // We default to "sqlite.db" in the same directory as the executable.
    // You could also use a library like `tauri-plugin-sql` to manage this path.
    let database_url = env::var("DATABASE_URL")
        .unwrap_or_else(|_| "sqlite.db".to_string());

    let manager = ConnectionManager::<SqliteConnection>::new(database_url);
    r2d2::Pool::builder()
        .build(manager)
        .expect("Failed to create database pool.")
}