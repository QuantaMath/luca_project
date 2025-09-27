// This component is responsible for displaying the list of employees in a table.
// It receives the list of employees and a loading state as props from its parent.

"use client"; // This marks the component as a Client Component in Next.js.

import { Employee, PayrollProfile } from "@/lib/api";

// Define the props that this component accepts.
interface EmployeeListProps {
  employees: Employee[];
  payrollProfiles: Map<number, PayrollProfile>; // NEW: Payroll data for all employees
  isLoading: boolean;
  onEdit: (employee: Employee) => void; // Function to handle editing an employee
  onDelete: (employeeId: number) => void; // Function to handle deleting an employee
  onSalaryClick: (employee: Employee) => void; // Function to handle salary clicks
}

export function EmployeeList({
  employees,
  payrollProfiles,
  isLoading,
  onEdit,
  onDelete,
  onSalaryClick,
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

  // Helper function to format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Helper function to format employee creation date
  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'Unknown';
    }
  };

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
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Salary
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Hired
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
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-indigo-700">
                        {employee.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {employee.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      ID: {employee.id}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-700">{employee.email}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  {employee.position}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {(() => {
                  const profile = payrollProfiles.get(employee.id);
                  if (profile) {
                    return (
                      <button
                        onClick={() => onSalaryClick(employee)}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-md hover:bg-green-100 hover:text-green-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                        title={`Current salary: ${formatCurrency(profile.salary)} - Click to edit`}
                      >
                        <svg 
                          className="w-4 h-4 mr-1" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" 
                          />
                        </svg>
                        {formatCurrency(profile.salary)}
                      </button>
                    );
                  } else {
                    return (
                      <button
                        onClick={() => onSalaryClick(employee)}
                        className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100 hover:text-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                        title="Payroll profile not found - Click to view details"
                      >
                        <svg 
                          className="w-4 h-4 mr-1" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                          />
                        </svg>
                        No Profile
                      </button>
                    );
                  }
                })()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-700">
                  {formatDate(employee.created_at)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onEdit(employee)}
                  className="text-indigo-600 hover:text-indigo-900 transition-colors duration-200 mr-4"
                  title="Edit employee details"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(employee.id)}
                  className="text-red-600 hover:text-red-900 transition-colors duration-200"
                  title="Delete employee"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Table Footer with Summary */}
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
        <div className="flex justify-between items-center text-sm text-gray-500">
          <div>
            Showing {employees.length} employee{employees.length !== 1 ? 's' : ''}
          </div>
          <div>
            {payrollProfiles.size} payroll profile{payrollProfiles.size !== 1 ? 's' : ''} loaded
          </div>
        </div>
      </div>
    </div>
  );
}