"use client";

import React, { useState } from 'react';
import { DriverDetailsWithUser } from '../types/driverDetails';
import { X } from 'lucide-react';
import { useVehicles } from '../hooks/useVehicles';
import AssignVehicleModal from './AssignVehicleModal';

interface DriverDetailsModalProps {
  isOpen: boolean;
  driver: DriverDetailsWithUser | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DriverDetailsModal({
  isOpen,
  driver,
  onClose,
  onSuccess,
}: DriverDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<DriverDetailsWithUser> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAssignVehicleModal, setShowAssignVehicleModal] = useState(false);
  const [localDriver, setLocalDriver] = useState<DriverDetailsWithUser | null>(driver);
  const { data: vehiclesData } = useVehicles();

  // Initialize form data when driver changes or modal opens
  React.useEffect(() => {
    if (isOpen && driver) {
      setFormData({ ...driver });
      setLocalDriver(driver);
      setIsEditing(false);
      setError(null);
    }
  }, [isOpen, driver]);

  if (!isOpen || !driver || !formData) return null;

  // Use localDriver for display to show updated vehicle assignment
  const displayDriver = localDriver || driver;

  const fullName = `${displayDriver.firstName} ${displayDriver.lastName}`.trim();
  const initials = fullName
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => prev ? { ...prev, [name]: value } : null);
  };

  const handleAssignSuccess = () => {
    // Refetch driver data after successful assignment
    onSuccess();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // TODO: Implement API call to update driver details
      // const response = await updateDriverDetailsAPI(driver.id, formData);
      
      // For now, just simulate success
      console.log('Updating driver details:', formData);
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      setIsEditing(false);
      onSuccess();
    } catch (err: any) {
      setError(err?.message || 'Error updating driver details');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold">
              {initials}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">{fullName}</h2>
              <p className="text-sm text-gray-500">{displayDriver.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {!isEditing ? (
            // View Mode
            <div className="space-y-6">
              {/* User Info */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">User Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-600 uppercase tracking-wide">First Name</label>
                    <p className="text-gray-800 font-medium mt-1">{displayDriver.firstName}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 uppercase tracking-wide">Last Name</label>
                    <p className="text-gray-800 font-medium mt-1">{displayDriver.lastName}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 uppercase tracking-wide">Email</label>
                    <p className="text-gray-800 font-medium mt-1">{displayDriver.email}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 uppercase tracking-wide">Status</label>
                    <p className="mt-1">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          displayDriver.isUserActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {displayDriver.isUserActive ? 'Active' : 'Inactive'}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* License Details */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">License Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-600 uppercase tracking-wide">License Number</label>
                    <p className="text-gray-800 font-medium mt-1">{displayDriver.licenseNumber}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 uppercase tracking-wide">License Type</label>
                    <p className="text-gray-800 font-medium mt-1">{displayDriver.licenseType}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 uppercase tracking-wide">License Expiry</label>
                    <p className={`font-medium mt-1 ${new Date(displayDriver.licenseExpiry) < new Date() ? 'text-red-600' : 'text-gray-800'}`}>
                      {new Date(displayDriver.licenseExpiry).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      {new Date(displayDriver.licenseExpiry) < new Date() && (
                        <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Expired</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 uppercase tracking-wide">Insurance Expiry</label>
                    <p className={`font-medium mt-1 ${new Date(displayDriver.insuranceExpiry) < new Date() ? 'text-red-600' : 'text-gray-800'}`}>
                      {new Date(displayDriver.insuranceExpiry).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      {new Date(displayDriver.insuranceExpiry) < new Date() && (
                        <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Expired</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Vehicle Assignment */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Vehicle Assignment</h3>
                {displayDriver.assignedVehicleId ? (
                  <div className="space-y-4">
                    {(() => {
                      const assignedVehicle = vehiclesData?.items?.find(
                        v => v.id === displayDriver.assignedVehicleId
                      );
                      
                      return assignedVehicle ? (
                        <div className="bg-green-50 border border-green-200 rounded p-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-xs text-gray-600 uppercase tracking-wide">Make</label>
                              <p className="text-gray-800 font-medium mt-1">{assignedVehicle.make || 'N/A'}</p>
                            </div>
                            <div>
                              <label className="text-xs text-gray-600 uppercase tracking-wide">Model</label>
                              <p className="text-gray-800 font-medium mt-1">{assignedVehicle.model || 'N/A'}</p>
                            </div>
                            <div>
                              <label className="text-xs text-gray-600 uppercase tracking-wide">License Plate</label>
                              <p className="text-gray-800 font-medium mt-1">{assignedVehicle.licensePlate || 'N/A'}</p>
                            </div>
                            <div>
                              <label className="text-xs text-gray-600 uppercase tracking-wide">Status</label>
                              <p className="mt-1">
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                                  assignedVehicle.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                }`}>
                                  {assignedVehicle.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                          <p className="text-sm text-yellow-800">
                            Vehicle loading... <span className="text-xs text-yellow-700">({displayDriver.assignedVehicleId})</span>
                          </p>
                        </div>
                      );
                    })()}
                    <button
                      type="button"
                      onClick={() => setShowAssignVehicleModal(true)}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm font-medium"
                    >
                      Change Vehicle
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 italic">No vehicle assigned</span>
                    <button
                      type="button"
                      onClick={() => setShowAssignVehicleModal(true)}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition text-sm font-medium whitespace-nowrap ml-4"
                    >
                      Assign Vehicle
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // Edit Mode
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* License Details */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">License Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                    <input
                      type="text"
                      name="licenseNumber"
                      value={formData.licenseNumber || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">License Type</label>
                    <select
                      name="licenseType"
                      value={formData.licenseType || ''}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Type</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                      <option value="E">E</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">License Expiry</label>
                    <input
                      type="date"
                      name="licenseExpiry"
                      value={formatDate(formData.licenseExpiry?.toString() || '')}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Expiry</label>
                    <input
                      type="date"
                      name="insuranceExpiry"
                      value={formatDate(formData.insuranceExpiry?.toString() || '')}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 justify-end p-6 border-t bg-gray-50">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400 hover:bg-blue-700 transition"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50 transition"
              >
                Close
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Edit Information
              </button>
            </>
          )}
        </div>
      </div>

      {/* Assign Vehicle Modal */}
      <AssignVehicleModal
        isOpen={showAssignVehicleModal}
        driverId={displayDriver.driverId || displayDriver.id}
        driverName={fullName}
        onClose={() => setShowAssignVehicleModal(false)}
        onSuccess={handleAssignSuccess}
      />
    </div>
  );
}
