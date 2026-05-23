"use client";

import React, { useEffect, useState } from 'react';
import AuthGuard from '../../../components/AuthGuard';
import { useRouter } from 'next/navigation';
import { getMyDriverProfile } from '../../../api/drivers';

interface DriverProfile {
  id: string;
  name: string;
  email: string;
  licenseNumber: string;
  phone?: string;
  assignedVehicle?: {
    id: string;
    licensePlate: string;
    model: string;
  };
}

export default function DriverProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<DriverProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const profileData = await getMyDriverProfile();
        setProfile({
          id: profileData.id,
          name: profileData.name,
          email: profileData.email ?? '',
          licenseNumber: profileData.licenseNumber ?? '',
          phone: profileData.phone ?? undefined,
          assignedVehicle: profileData.assignedVehicle
            ? {
                id: profileData.assignedVehicle.id,
                licensePlate: profileData.assignedVehicle.licensePlate ?? '',
                model: profileData.assignedVehicle.model ?? '',
              }
            : undefined,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  return (
    <AuthGuard requireRoles="Driver">
      <div className="p-6 max-w-4xl mx-auto">

        {loading && (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-6">
            {error}
          </div>
        )}

        {!loading && profile && (
          <div className="space-y-6">
            {/* Personal Information Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-600">Name</label>
                  <p className="text-lg text-gray-900 mt-1">{profile.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-lg text-gray-900 mt-1">{profile.email}</p>
                </div>
                {profile.phone && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Phone</label>
                    <p className="text-lg text-gray-900 mt-1">{profile.phone}</p>
                  </div>
                )}
              </div>
            </div>

            {/* License Information Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">License Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-600">License Number</label>
                  <p className="text-lg font-mono text-gray-900 mt-1">{profile.licenseNumber}</p>
                </div>
              </div>
            </div>

            {/* Assigned Vehicle Card */}
            {profile.assignedVehicle && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Assigned Vehicle</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-600">License Plate</label>
                    <p className="text-lg font-mono text-gray-900 mt-1">{profile.assignedVehicle.licensePlate}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Model</label>
                    <p className="text-lg text-gray-900 mt-1">{profile.assignedVehicle.model}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
