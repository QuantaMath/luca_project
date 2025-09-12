// This component is responsible for displaying the list of employees in a table.
// It receives the list of employees and a loading state as props from its parent.

"use client"; // This marks the component as a Client Component in Next.js.

import { Employee } from "@/lib/api";

// Define the props that this component accepts.
interface EmployeeListProps {
  employees: Employee[];
  isLoading: boolean;
  onEdit: (employee: Employee) => void; // Function to handle editing an employee
  onDelete: (employeeId: number) => void; // Function to handle deleting an employee
}

export function EmployeeList({
  employees,
  isLoading,
  onEdit,
  onDelete,
}: EmployeeListProps) {
  // 1. Loading State: Display a simple message while data is being fetched.
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <p className="text-gray-500">Loading employees...</p>
      </div>
    );
  }

  // 2. Empty State: Display a helpful message if no employees are in the database.
  if (employees.length === 0) {
    return (
      <div className="flex justify-center items-center h-40">
        <p className="text-gray-500">
          No employees found. Add one to get started!
        </p>
      </div>
    );
  }

  // 3. Data State: Display the table with the employee data.
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg shadow overflow-hidden">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Position
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {employees.map((employee) => (
            <tr key={employee.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {employee.name}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-700">{employee.email}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-700">{employee.position}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onEdit(employee)}
                  className="text-indigo-600 hover:text-indigo-900 transition-colors duration-200"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(employee.id)}
                  className="text-red-600 hover:text-red-900 ml-4 transition-colors duration-200"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
