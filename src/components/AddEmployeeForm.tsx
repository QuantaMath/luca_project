// This component provides a modal form for both creating and editing an employee.
// It manages its own state for the form fields and calls the appropriate API function.

"use client"; // This marks the component as a Client Component in Next.js.

import { useState, useEffect } from "react";
import { Employee, NewEmployee, UpdateEmployee } from "@/lib/api";

// Define the props that this component accepts.
interface AddEmployeeFormProps {
  employeeToEdit: Employee | null; // If an employee is passed, the form is in "edit" mode.
  onFormSubmit: () => void; // A function to call after a successful submission to trigger a refresh.
  onCancel: () => void; // A function to call to close the modal.
}

export function AddEmployeeForm({
  employeeToEdit,
  onFormSubmit,
  onCancel,
}: AddEmployeeFormProps) {
  // State for the form input fields.
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [position, setPosition] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determine the mode based on whether an employee object was passed.
  const isEditMode = employeeToEdit !== null;

  // Use an effect to populate the form fields when in edit mode.
  // This runs whenever the `employeeToEdit` prop changes.
  useEffect(() => {
    if (isEditMode) {
      setName(employeeToEdit.name);
      setEmail(employeeToEdit.email);
      setPosition(employeeToEdit.position);
    }
  }, [employeeToEdit, isEditMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Clear previous errors

    // Basic validation
    if (!name || !email || !position) {
      setError("Please fill in all fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditMode) {
        // --- EDIT MODE ---
        const employeeData: UpdateEmployee = { name, email, position };
        // We need to import the `updateEmployee` function from our API wrappers.
        const { updateEmployee } = await import("@/lib/api");
        await updateEmployee(employeeToEdit.id, employeeData);
      } else {
        // --- CREATE MODE ---
        const employeeData: NewEmployee = { name, email, position };
        // We need to import the `addEmployee` function from our API wrappers.
        const { addEmployee } = await import("@/lib/api");
        await addEmployee(employeeData);
      }
      onFormSubmit(); // Notify parent to refresh the employee list and close the modal.
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // Modal Overlay
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      {/* Modal Content */}
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          {isEditMode ? "Edit Employee" : "Add New Employee"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="john.doe@example.com"
            />
          </div>
          <div>
            <label
              htmlFor="position"
              className="block text-sm font-medium text-gray-700"
            >
              Position
            </label>
            <input
              id="position"
              type="text"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Software Engineer"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors duration-200"
            >
              {isSubmitting
                ? "Saving..."
                : isEditMode
                ? "Save Changes"
                : "Add Employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
