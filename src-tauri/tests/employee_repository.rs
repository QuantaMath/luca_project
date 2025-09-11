// --- File: src-tauri/tests/employee_repository.rs (Refactored for Isolation) ---

// Import the setup guard from our new test_utils module.
use luca_project::test_utils::TestDbGuard;

// Import the necessary parts from your main application crate.
use luca_project::{
    modules::employee::{
        models::{NewEmployee, UpdateEmployee},
        repository::EmployeeRepository,
    },
};

#[test]
fn test_create_employee() {
    // This guard creates a unique DB for this test and cleans it up afterward.
    let guard = TestDbGuard::new();
    let repo = EmployeeRepository;
    let new_employee = NewEmployee {
        name: "John Doe".to_string(),
        email: "john.doe@example.com".to_string(),
        position: "Developer".to_string(),
    };

    let employee = repo.create_employee(&guard.pool, new_employee).unwrap();

    assert_eq!(employee.name, "John Doe");
    assert_eq!(employee.email, "john.doe@example.com");
}

#[test]
fn test_get_all_employees() {
    let guard = TestDbGuard::new();
    let repo = EmployeeRepository;
    repo.create_employee(&guard.pool, NewEmployee { name: "Alice".to_string(), email: "alice@test.com".to_string(), position: "Manager".to_string() }).unwrap();
    repo.create_employee(&guard.pool, NewEmployee { name: "Bob".to_string(), email: "bob@test.com".to_string(), position: "Engineer".to_string() }).unwrap();

    let employees = repo.get_all_employees(&guard.pool).unwrap();
    assert_eq!(employees.len(), 2);
}

#[test]
fn test_update_and_get_by_id() {
    let guard = TestDbGuard::new();
    let repo = EmployeeRepository;
    let created_employee = repo.create_employee(&guard.pool, NewEmployee { name: "Carol".to_string(), email: "carol@test.com".to_string(), position: "Analyst".to_string() }).unwrap();

    let update_data = UpdateEmployee {
        name: Some("Carol Smith".to_string()),
        email: None,
        position: Some("Senior Analyst".to_string()),
    };

    let updated_employee = repo.update_employee(&guard.pool, created_employee.id, update_data).unwrap();
    assert_eq!(updated_employee.name, "Carol Smith");
    assert_eq!(updated_employee.position, "Senior Analyst");

    let fetched_employee = repo.get_employee_by_id(&guard.pool, created_employee.id).unwrap();
    assert_eq!(fetched_employee.name, "Carol Smith");
}

#[test]
fn test_delete_employee() {
    let guard = TestDbGuard::new();
    let repo = EmployeeRepository;
    let employee_to_delete = repo.create_employee(&guard.pool, NewEmployee { name: "David".to_string(), email: "david@test.com".to_string(), position: "Intern".to_string() }).unwrap();

    let all_employees_before = repo.get_all_employees(&guard.pool).unwrap();
    assert_eq!(all_employees_before.len(), 1);

    let num_deleted = repo.delete_employee(&guard.pool, employee_to_delete.id).unwrap();
    assert_eq!(num_deleted, 1);

    let all_employees_after = repo.get_all_employees(&guard.pool).unwrap();
    assert_eq!(all_employees_after.len(), 0);
}