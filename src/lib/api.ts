import { invoke } from "@tauri-apps/api/core";

// --- TypeScript Interfaces ---

// --- TypeScript Interfaces ---
// These interfaces must match the Rust structs defined in `src-tauro/src/modules/employee/models.rs`.
// This is ensure type safety across the frontend-backend boundary.


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

// --- Generic Invoke Helper ---
// A helper function to reduce boilerplate and handle errors consistently.

/**
* Invokes a Tauri command and the Result<T, E> pattern from Rust.
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
        // The `error` will be the straingfied version of out AppError from Rust.
        console.error(`Error invoking ${cmd}:`, error);
        // We re-throw it as a standard Javascript Error.
        throw new Error(error as string);
    }
}

// --- API Funvtions ---
//These  are the functions our React components will use to interact with the backend.

/** 
 * Fetch the list of all employees from the database.
 * Corresponds to the `list_employees`` command in Rust.
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