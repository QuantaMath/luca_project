use luca_project::schema::payroll_profiles::{employee_id, salary};
// Import the setup guard from our test_utils module in lib.rs.
use luca_project::test_utils::TestDbGuard;

// Import the necessary part from your main application crate.
use luca_project::{
    modules::{
        employee::{
            models::NewEmployee,
            repository::EmployeeRepository,
        },
        payroll::{
            models::{NewPayrollProfile, UpdatePayrollProfile},
            repository::PayrollRepository,
        },
    },
};

#[test]
fn test_create_and_get_payroll_profile() {
    // This guard creates a unique, isolated database just for this test.
    let guard = TestDbGuard::new();
    let employee_repo = EmployeeRepository;
    let payroll_repo = PayrollRepository;

    // 1. Arrange: We must first create an employee to associate the profile with.
    let new_employee = employee_repo.create_employee(
        &guard.pool, NewEmployee { 
            name: "Jane Doe".to_string(), 
            email: "jane.doe@example.com".to_string(), 
            position: "Accountant".to_string() 
        }).unwrap();
    
    let new_profile_data = NewPayrollProfile{
        employee_id: new_employee.id,
        salary: 75000.0,
        bank_info: Some("Main Street Bank 12345".to_string()),
    };

    // 2. Act: Create the payroll profile.
    let created_profile = payroll_repo.create_profile(&guard.pool, new_profile_data).unwrap();

    // 3. Assert: Check if the created profile is correct.
    assert_eq!(created_profile.employee_id, new_employee.id);
    assert_eq!(created_profile.salary, 75000.0);

    // 4. Act & Assert: Fetch the profile and verify it's the same.
    let fetched_profile = payroll_repo.get_profile_for_employee(&guard.pool, new_employee.id).unwrap();
    assert_eq!(fetched_profile.id, created_profile.id);
    assert_eq!(fetched_profile.salary, 75000.0);

}


#[test]
fn test_update_payroll_profile() {
    let guard = TestDbGuard::new();
    let employee_repo = EmployeeRepository;
    let payroll_repo = PayrollRepository;

    // 1. Arrange: Create an employee and an initial payroll profile.
    let new_employee = employee_repo.create_employee(&guard.pool, NewEmployee {
        name: "John Smith".to_string(),
        email: "john.smith@example.com".to_string(),
        position: "Auditor".to_string(),
    }).unwrap();

    let initial_profile = NewPayrollProfile {
        employee_id: new_employee.id,
        salary: 80000.0,
        bank_info: None,
    };
    payroll_repo.create_profile(&guard.pool, initial_profile).unwrap();

    let update_data = UpdatePayrollProfile {
        salary: Some(85000.0),
        bank_info: Some("Federal Bank 67890".to_string()),
    };

    // 2. Act: Update the profile.
    let updated_profile = payroll_repo.update_profile(&guard.pool, new_employee.id, update_data).unwrap();

    // 3. Assert: Check that the returned profile has the new data.
    assert_eq!(updated_profile.salary, 85000.0);
    assert_eq!(updated_profile.bank_info, Some("Federal Bank 67890".to_string()));
}
