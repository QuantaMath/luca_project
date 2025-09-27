// This is the main component that orchestrates the entire application.
// It manages the state for the employee list, loading status, and modals.
// It also handles data fetching, user actions, and listens for backend events.

'use client'; // This is a Client Component, as it uses state and effects.

import { useState, useEffect } from 'react';
import { listen } from '@tauri-apps/api/event';
import { 
  Employee, 
  PayrollProfile, 
  UpdatePayrollProfile,
  listEmployees, 
  deleteEmployee, 
  getPayrollProfile, 
  updatePayrollProfile 
} from '@/lib/api';
import { EmployeeList } from '@/components/EmployeeList';
import { AddEmployeeForm } from '@/components/AddEmployeeForm';
import { PayrollDetails } from '@/components/PayrollDetails';
import { Toaster, toast } from 'react-hot-toast';

export default function HomePage() {
  // --- Employee State Management ---
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);

  // --- Payroll State Management ---
  const [payrollProfiles, setPayrollProfiles] = useState<Map<number, PayrollProfile>>(new Map());
  const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<PayrollProfile | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  // --- Data Fetching ---
  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      // Step 1: Fetch all employees
      const employeeList = await listEmployees();
      setEmployees(employeeList);

      // Step 2: Fetch payroll profiles for all employees in parallel
      const profilePromises = employeeList.map(async (employee) => {
        try {
          const profile = await getPayrollProfile(employee.id);
          return { employeeId: employee.id, profile };
        } catch (error) {
          console.warn(`Failed to fetch payroll profile for employee ${employee.id}:`, error);
          return { employeeId: employee.id, profile: null };
        }
      });

      // Wait for all payroll profiles to be fetched
      const profileResults = await Promise.all(profilePromises);
      
      // Store profiles in a Map for easy lookup
      const profileMap = new Map<number, PayrollProfile>();
      profileResults.forEach(({ employeeId, profile }) => {
        if (profile) {
          profileMap.set(employeeId, profile);
        }
      });
      
      setPayrollProfiles(profileMap);
      
      // Show success message if we loaded some profiles
      const loadedCount = profileMap.size;
      if (loadedCount > 0) {
        toast.success(`Loaded ${loadedCount} payroll profile${loadedCount !== 1 ? 's' : ''}`);
      }
      
    } catch (error) {
      toast.error(`Failed to fetch employees: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Legacy method for compatibility (used by other functions)
  const fetchEmployees = async () => {
    await fetchInitialData();
  };

  // --- Effects ---
  // 1. Fetch initial data when the component mounts.
  useEffect(() => {
    fetchInitialData();
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

  // --- Employee Event Handlers ---
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

  // --- Payroll Event Handlers ---
  const handleSalaryClick = async (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsLoadingProfile(true);
    setIsPayrollModalOpen(true);

    // First, check if we already have the profile in our cache
    const cachedProfile = payrollProfiles.get(employee.id);
    if (cachedProfile) {
      setSelectedProfile(cachedProfile);
      setIsLoadingProfile(false);
      return;
    }

    // If not cached, fetch from the backend
    try {
      const profile = await getPayrollProfile(employee.id);
      setSelectedProfile(profile);
      
      // Update our cache
      setPayrollProfiles(prev => new Map(prev).set(employee.id, profile));
      
      toast.success('Payroll profile loaded successfully.');
    } catch (error) {
      toast.error(`Failed to load payroll profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
      // Don't close the modal - show the error state instead
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleSavePayroll = async (data: UpdatePayrollProfile) => {
    if (!selectedEmployee) {
      toast.error('No employee selected for payroll update.');
      return;
    }

    try {
      const updatedProfile = await updatePayrollProfile(selectedEmployee.id, data);
      setSelectedProfile(updatedProfile);
      
      // Update our cached profiles
      setPayrollProfiles(prev => new Map(prev).set(selectedEmployee.id, updatedProfile));
      
      setIsPayrollModalOpen(false);
      toast.success(`Payroll updated for ${selectedEmployee.name}`);
      
      // Optionally refresh the employee list to show updated salary
      fetchEmployees();
    } catch (error) {
      // Re-throw the error so the PayrollDetails component can handle it
      throw error;
    }
  };

  const handleCancelPayroll = () => {
    setIsPayrollModalOpen(false);
    setSelectedEmployee(null);
    setSelectedProfile(null);
  };

  // --- Rendering ---
  return (
    <>
      {/* For displaying success/error toast notifications */}
      <Toaster position="bottom-center" />

      <div className="p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Employee Roster
            </h1>
            <p className="text-gray-600 mt-1">
              Manage employees and their payroll information
            </p>
          </div>
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
            payrollProfiles={payrollProfiles}
            isLoading={isLoading}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
            onSalaryClick={handleSalaryClick}
          />
        </main>
      </div>

      {/* Employee Form Modal */}
      {isModalOpen && (
        <AddEmployeeForm
          employeeToEdit={employeeToEdit}
          onFormSubmit={handleFormSubmit}
          onCancel={handleCancelForm}
        />
      )}

      {/* Payroll Details Modal (NEW) */}
      {isPayrollModalOpen && selectedEmployee && (
        <PayrollDetails
          employee={selectedEmployee}
          profile={selectedProfile}
          onSave={handleSavePayroll}
          onCancel={handleCancelPayroll}
          isLoading={isLoadingProfile}
        />
      )}
    </>
  );
}