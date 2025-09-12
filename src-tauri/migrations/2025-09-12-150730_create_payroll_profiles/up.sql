-- This migration creates the `payroll_profiles` table.
CREATE TABLE payroll_profiles (
    id INTEGER PRIMARY KEY NOT NULL,
    employee_id INTEGER NOT NULL UNIQUE,
    salary DOUBLE NOT NULL DEFAULT 0.0,
    bank_info TEXT,

    -- This establishes a link to the `employees` table.
    -- If an employee is deleted, their payroll profile is also deleted.
    FOREIGN KEY (employee_id) REFERENCES employees (id) ON DELETE CASCADE
);