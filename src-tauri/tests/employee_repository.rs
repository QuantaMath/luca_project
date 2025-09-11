// We need to tell this test file how to find the code in our main application.
// `app` is the name of your package from Cargo.toml.
use luca_project::{
    core::db::DbPool,
    modules::employee::{
        models::{NewEmployee, UpdateEmployee},
        repository::EmployeeRepository,
    }
};

use diesel::r2d2::{self, ConnectionManager};
use diesel::sqlite::SqliteConnection;
use diesel_migrations::{embed_migrations, EmbeddedMigrations, MigrationHarness};


// This macro finds the migrations files relative to the crate root (src-tauri).
// It's the key to setting up the test database correctly.
pub const MIGRATIONS: EmbeddedMigrations = embed_migrations!("./migrations");


/// Helper function to set up a clean, in-memory database for each test.
fn setup() -> (DbPool, EmployeeRepository) {
    let manager = ConnectionManager::<SqliteConnection>::new(":memory:");
    let pool = r2d2::Pool::builder()
        .build(manager)
        .expect("Failed to create an in-memory database pool");

    // Run all pending migrations on the in-memory database.
    let mut conn = pool.get().unwrap();
    conn.run_pending_migrations(MIGRATIONS)
        .expect("Failed to run migrations");

    let repo = EmployeeRepository;
    (pool, repo)
}


#[test]
fn test_create_employee() {
    let(pool, repo) = setup();
    let new_employee = NewEmployee {
        name: "John Doe".to_string(),
        email: "john.doe@example.com".to_string(),
        position: "Developer".to_string(),
    };

    let employee = repo.create_employee(&pool, new_employee).unwrap();

    assert_eq!(employee.name, "John Doe");
    assert_eq!(employee.email, "john.doe@example.com");
    assert_eq!(employee.position, "Developer");
}

#[test]
fn test_get_all_employees() {
    let (pool, repo) = setup();

    // Create two employees
    repo.create_employee(&pool, NewEmployee { name: "Alice".to_string(), email: "alice@test.com".to_string(), position: "Manager".to_string() }).unwrap();
    repo.create_employee(&pool, NewEmployee { name: "Bob".to_string(), email: "bob@test.com".to_string(), position: "Engineer".to_string() }).unwrap();

    let employees = repo.get_all_employees(&pool).unwrap();

    assert_eq!(employees.len(), 2);
}

#[test]
fn test_update_and_get_by_id() {
    let (pool, repo) = setup();
    let created_employee = repo.create_employee(&pool, NewEmployee { name: "Carol".to_string(), email: "carol@test.com".to_string(), position: "Analyst".to_string() }).unwrap();

    let update_data = UpdateEmployee {
        name: Some("Carol Smith".to_string()),
        email: None,
        position: Some("Senior Analyst".to_string()),
    };

    let updated_employee = repo.update_employee(&pool, created_employee.id, update_data).unwrap();
    assert_eq!(updated_employee.name, "Carol Smith");
    assert_eq!(updated_employee.position, "Senior Analyst");

    // Verify with get_by_id
    let fetched_employee = repo.get_employee_by_id(&pool, created_employee.id).unwrap();
    assert_eq!(fetched_employee.name, "Carol Smith");
}

#[test]
fn test_delete_employee() {
    let (pool, repo) = setup();
    let employee_to_delete = repo.create_employee(&pool, NewEmployee { name: "David".to_string(), email: "david@test.com".to_string(), position: "Intern".to_string() }).unwrap();

    let all_employees_before = repo.get_all_employees(&pool).unwrap();
    assert_eq!(all_employees_before.len(), 1);

    let num_deleted = repo.delete_employee(&pool, employee_to_delete.id).unwrap();
    assert_eq!(num_deleted, 1);

    let all_employees_after = repo.get_all_employees(&pool).unwrap();
    assert_eq!(all_employees_after.len(), 0);
}