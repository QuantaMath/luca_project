import { invoke } from "@tauri-apps/api/core";

// --- TypeScript Interfaces ---

// Employee-related interfaces (existing)
export interface Employee {
    id: number;
    name: string;
    email: string;
    position: string;
    created_at: string;
}

export interface NewEmployee {
    name: string;
    email: string;
    position: string;
}

export interface UpdateEmployee {
    name?: string;
    email?: string;
    position?: string;
}

// Payroll-related interfaces (new)
export interface PayrollProfile {
    id: number;
    employee_id: number;
    salary: number;
    bank_info: string | null;
}

export interface UpdatePayrollProfile {
    salary?: number;
    bank_info?: string | null;
}

// --- Generic Invoke Helper ---
// A helper function to reduce boilerplate and handle errors consistently.

/**
 * Invokes a Tauri command and handles the Result<T, E> pattern from Rust.
 * @param cmd The command to invoke.
 * @param args The arguments for the command.
 * @returns A promise that resolves with the data if the Rust command returns Ok(T),
 * or rejects with an error message if the Rust command returns Err(E)
 */
async function invokeWrapper<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
    try {
        const result = await invoke<T>(cmd, args);
        return result;
    } catch (error) {
        // The `error` will be the stringified version of our AppError from Rust.
        console.error(`Error invoking ${cmd}:`, error);
        // We re-throw it as a standard JavaScript Error.
        throw new Error(error as string);
    }
}

// --- Employee API Functions ---
// These are the functions our React components will use to interact with the backend.

/** 
 * Fetch the list of all employees from the database.
 * Corresponds to the `list_employees` command in Rust.
 */
export const listEmployees = (): Promise<Employee[]> => {
    return invokeWrapper("list_employees");
}

/**
 * Creates a new employee in the database.
 * Corresponds to the `add_employee` command in Rust.
 * @param employeeData The data for the new employee.
 */
export const addEmployee = (employeeData: NewEmployee): Promise<Employee> => {
    return invokeWrapper("add_employee", { employeeData });
};

/**
 * Updates an existing employee's details.
 * Corresponds to the `update_employee` command in Rust.
 * @param employeeId The ID of the employee to update.
 * @param employeeData The new data for the employee.
 */
export const updateEmployee = (employeeId: number, employeeData: UpdateEmployee): Promise<Employee> => {
    return invokeWrapper("update_employee", { employeeId, employeeData });
};

/**
 * Deletes an employee from the database.
 * Corresponds to the `delete_employee` command in Rust.
 * @param employeeId The ID of the employee to delete.
 * @returns The number of rows deleted (should be 1).
 */
export const deleteEmployee = (employeeId: number): Promise<number> => {
    return invokeWrapper("delete_employee", { employeeId });
};

// --- Payroll API Functions (NEW) ---

/**
 * Fetches the payroll profile for a specific employee.
 * Corresponds to the `get_payroll_profile` command in Rust.
 * @param employeeId The ID of the employee whose payroll profile to fetch.
 * @returns A promise that resolves to the employee's payroll profile.
 */
export const getPayrollProfile = (employeeId: number): Promise<PayrollProfile> => {
    return invokeWrapper("get_payroll_profile", { employeeId });
};

/**
 * Updates the payroll profile for a specific employee.
 * Corresponds to the `update_payroll_profile` command in Rust.
 * @param employeeId The ID of the employee whose payroll profile to update.
 * @param data The updated payroll data (salary and/or bank_info).
 * @returns A promise that resolves to the updated payroll profile.
 */
export const updatePayrollProfile = (employeeId: number, data: UpdatePayrollProfile): Promise<PayrollProfile> => {
    return invokeWrapper("update_payroll_profile", { 
        empolyeeId: employeeId, // Matching the typo: empolyee_id → empolyeeId
        profileUpdateData: data  // Matching: profile_update_data → profileUpdateData
    });
};