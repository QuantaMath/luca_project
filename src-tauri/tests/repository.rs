extern crate luca_project;

use luca_project::core::db::DbPool;
use luca_project::modules::employee::{
    models::{NewEmployee, UpdateEmployee},
    repository::*,
};

use diesel::r2d2::{self, ConnectionManager};
use diesel::sqlite::SqliteConnection;
use diesel_migrations::{embed_migrations, EmbeddedMigrations, MigrationHarness};

pub const MIGRATIONS: EmbeddedMigrations = embed_migrations!("./migrations");

fn setup() -> DbPool {
    let manager = ConnectionManager::<SqliteConnection>::new(":memory:");
    let pool = r2d2::Pool::builder()
        .build(manager)
        .expect("Failed to create an in-memory database pool.");

    let mut conn = pool.get().unwrap();
    conn.run_pending_migrations(MIGRATIONS).expect("Failed to run migrations.");

    pool
}

#[test]
fn test_create_employee() {
    let pool = setup();
    let new_employee = NewEmployee {
        name: "John Doe".to_string(),
        email: "john.doe@example.com".to_string(),
        position: "Developer".to_string(),
    };

    let employee = create_employee(&pool, new_employee).unwrap();

    assert_eq!(employee.name, "John Doe");
    assert_eq!(employee.email, "john.doe@example.com");
}

#[test]
fn test_get_all_employees() {
    let pool = setup();
    
    create_employee(&pool, NewEmployee { name: "Alice".to_string(), email: "alice@test.com".to_string(), position: "Manager".to_string() }).unwrap();
    create_employee(&pool, NewEmployee { name: "Bob".to_string(), email: "bob@test.com".to_string(), position: "Engineer".to_string() }).unwrap();

    let employees = get_all_employees(&pool).unwrap();
    
    assert_eq!(employees.len(), 2);
}

#[test]
fn test_update_and_get_by_id() {
    let pool = setup();
    let created_employee = create_employee(&pool, NewEmployee { name: "Carol".to_string(), email: "carol@test.com".to_string(), position: "Analyst".to_string() }).unwrap();

    let update_data = UpdateEmployee {
        name: Some("Carol Smith".to_string()),
        email: None,
        position: Some("Senior Analyst".to_string()),
    };

    let updated_employee = update_employee(&pool, created_employee.id, update_data).unwrap();
    assert_eq!(updated_employee.name, "Carol Smith");
    assert_eq!(updated_employee.position, "Senior Analyst");

    let fetched_employee = get_employee_by_id(&pool, created_employee.id).unwrap();
    assert_eq!(fetched_employee.name, "Carol Smith");
}

#[test]
fn test_delete_employee() {
    let pool = setup();
    let employee_to_delete = create_employee(&pool, NewEmployee { name: "David".to_string(), email: "david@test.com".to_string(), position: "Intern".to_string() }).unwrap();
    
    let all_employees_before = get_all_employees(&pool).unwrap();
    assert_eq!(all_employees_before.len(), 1);

    let num_deleted = delete_employee(&pool, employee_to_delete.id).unwrap();
    assert_eq!(num_deleted, 1);

    let all_employees_after = get_all_employees(&pool).unwrap();
    assert_eq!(all_employees_after.len(), 0);
}