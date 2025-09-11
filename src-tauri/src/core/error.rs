// src-tauri/src/core/error.rs

use serde::{Serialize, Serializer};
use thiserror::Error;

// The main error enum for the entire application.
// The `#[from]` attribute automatically converts errors from other libraries
// (like Diesel or r2d2) into our AppError variants.
#[derive(Debug, Error)]
pub enum AppError {
    #[error("Database Error: {0}")]
    Database(#[from] diesel::result::Error),

    #[error("Database Pool Error: {0}")]
    DbPool(#[from] r2d2::Error),

    #[error("Validation Error: {0}")]
    Validation(String),
    
    #[error("IO Error: {0}")]
    Io(#[from] std::io::Error),
}

// We need to implement Serialize manually to send a clean, simple error
// string to the frontend. Without this, Tauri would try to send a complex
// JSON object representing the enum, which is harder to handle in TypeScript.
impl Serialize for AppError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}

// A type alias for `Result` that uses our `AppError` type.
// This simplifies function signatures throughout the application.
// For example, instead of `Result<Vec<Employee>, diesel::result::Error>`,
// you can just write `AppResult<Vec<Employee>>`.
pub type AppResult<T> = Result<T, AppError>;