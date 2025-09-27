// This component provides a modal form for viewing and editing payroll information.
// It manages its own state for the form fields and handles validation.

"use client"; // This marks the component as a Client Component in Next.js.

import { useState, useEffect } from "react";
import { Employee, PayrollProfile, UpdatePayrollProfile } from "@/lib/api";

// Define the props that this component accepts.
interface PayrollDetailsProps {
  employee: Employee; // The employee whose payroll we're viewing/editing
  profile: PayrollProfile | null; // The current payroll profile (null if not loaded yet)
  onSave: (data: UpdatePayrollProfile) => void; // Function to call when saving changes
  onCancel: () => void; // Function to call to close the modal
  isLoading?: boolean; // Optional loading state for the save operation
}

export function PayrollDetails({
  employee,
  profile,
  onSave,
  onCancel,
  isLoading = false,
}: PayrollDetailsProps) {
  // State for the form input fields
  const [salary, setSalary] = useState<string>("");
  const [bankInfo, setBankInfo] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use an effect to populate the form fields when the profile loads
  useEffect(() => {
    if (profile) {
      setSalary(profile.salary.toString());
      setBankInfo(profile.bank_info || "");
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Clear previous errors

    // Basic validation
    const salaryNum = parseFloat(salary);
    if (isNaN(salaryNum) || salaryNum < 0) {
      setError("Please enter a valid salary amount (must be 0 or greater).");
      return;
    }

    setIsSubmitting(true);

    try {
      const updateData: UpdatePayrollProfile = {
        salary: salaryNum,
        bank_info: bankInfo.trim() || null, // Convert empty string to null
      };
      
      await onSave(updateData);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred while saving.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format currency for display
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    // Modal Overlay
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
      {/* Modal Content */}
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Payroll Details
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Managing payroll for <span className="font-medium">{employee.name}</span>
          </p>
          {profile && (
            <p className="text-xs text-gray-500 mt-1">
              Employee ID: {employee.id} • Profile ID: {profile.id}
            </p>
          )}
        </div>

        {/* Loading State */}
        {isLoading && !profile && (
          <div className="flex justify-center items-center h-32">
            <div className="text-gray-500">Loading payroll data...</div>
          </div>
        )}

        {/* Profile Not Found State */}
        {!isLoading && !profile && (
          <div className="flex justify-center items-center h-32">
            <div className="text-center">
              <p className="text-gray-500 mb-4">No payroll profile found for this employee.</p>
              <p className="text-sm text-gray-400">
                A profile should be created automatically when an employee is added.
              </p>
            </div>
          </div>
        )}

        {/* Form */}
        {profile && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Salary Display */}
            <div className="bg-gray-50 p-4 rounded-md">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Salary
              </label>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(profile.salary)}
              </div>
              <p className="text-xs text-gray-500 mt-1">Annual salary</p>
            </div>

            {/* Salary Input */}
            <div>
              <label
                htmlFor="salary"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                New Salary Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  id="salary"
                  type="number"
                  min="0"
                  step="0.01"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  className="pl-8 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="50000"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Enter the annual salary amount
              </p>
            </div>

            {/* Bank Info Input */}
            <div>
              <label
                htmlFor="bankInfo"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Bank Information
              </label>
              <textarea
                id="bankInfo"
                rows={3}
                value={bankInfo}
                onChange={(e) => setBankInfo(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Bank name, routing number, account details, etc."
              />
              <p className="text-xs text-gray-500 mt-1">
                Optional: Banking details for payroll processing
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:opacity-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors duration-200"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}

        {/* Close button for no profile state */}
        {!isLoading && !profile && (
          <div className="flex justify-end pt-4">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors duration-200"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}