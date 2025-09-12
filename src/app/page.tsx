// This is the main component that orchestrates the entire application.
// It manages the state for the employee list, loading status, and modals.
// It also handles data fetching, user actions, and listens for backend events.

'use client'; // This is a Client Component, as it uses state and effects.

import { useState, useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';
import { Employee, listEmployees, deleteEmployee } from '@/lib/api';
import { EmployeeList } from '@/components/EmployeeList';
import { AddEmployeeForm } from '@/components/AddEmployeeForm';
import { Toaster, toast } from 'react-hot-toast';

export default function HomePage() {
  // --- State Management ---
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);

  // --- Data Fetching ---
  const fetchEmployees = async () => {
    setIsLoading(true);
    try {
      const employeeList = await listEmployees();
      setEmployees(employeeList);
    } catch (error) {
      toast.error(`Failed to fetch employees: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Effects ---
  // 1. Fetch initial data when the component mounts.
  useEffect(() => {
    fetchEmployees();
  }, []);

  // 2. Listen for backend events to enable real-time updates.
  useEffect(() => {
    // This listens for the "employee_created" event emitted from the Rust backend.
    const unlisten = listen('employee_created', (event) => {
      console.log('Received employee_created event:', event);
      toast.success('New employee added! List updated.');
      fetchEmployees(); // Re-fetch the list to show the new data.
    });

    // CRITICAL: Return a cleanup function to unsubscribe from the event
    // when the component unmounts. This prevents memory leaks.
    return () => {
      unlisten.then(f => f());
    };
  }, []);


  // --- Event Handlers ---
  const handleAddClick = () => {
    setEmployeeToEdit(null); // Ensure we're in "add" mode
    setIsModalOpen(true);
  };

  const handleEditClick = (employee: Employee) => {
    setEmployeeToEdit(employee); // Set the employee to edit
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (employeeId: number) => {
    // A simple confirmation dialog. In a real app, use a custom modal.
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await deleteEmployee(employeeId);
        toast.success('Employee deleted successfully.');
        fetchEmployees(); // Refresh the list
      } catch (error) {
        toast.error(`Failed to delete employee: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  const handleFormSubmit = () => {
    setIsModalOpen(false); // Close the modal
    fetchEmployees(); // Refresh the list
  };

  const handleCancelForm = () => {
    setIsModalOpen(false); // Just close the modal
  };

  // --- Rendering ---
  return (
    <>
      {/* For displaying success/error toast notifications */}
      <Toaster position="bottom-center" />

      <div className="p-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Employee Roster
          </h1>
          <button
            onClick={handleAddClick}
            className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75 transition-colors duration-200"
          >
            + Add Employee
          </button>
        </header>

        <main className="bg-white p-6 rounded-xl shadow-lg">
          <EmployeeList
            employees={employees}
            isLoading={isLoading}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
          />
        </main>
      </div>

      {/* Conditionally render the modal form */}
      {isModalOpen && (
        <AddEmployeeForm
          employeeToEdit={employeeToEdit}
          onFormSubmit={handleFormSubmit}
          onCancel={handleCancelForm}
        />
      )}
    </>
  );
}

