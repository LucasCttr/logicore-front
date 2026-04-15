"use client";

import React, { useEffect, useState } from 'react';
import AuthGuard from '../../../components/AuthGuard';
import { useRouter } from 'next/navigation';
import api from '../../../api/axiosClient';

interface DriverProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  licenseNumber: string;
  licenseType: string;
  licenseExpiry: string;
  insuranceExpiry: string;
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
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await api.get('/api/drivers/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data?.isSuccess) {
          setProfile(response.data.value);
        } else {
          setError(response.data?.error || 'Failed to load profile');
        }
      } catch (err: any) {
        setError(err?.response?.data?.error || 'Error loading profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const formatDate = (date: string) => {
    try {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return date;
    }
  };

  const isLicenseExpired = profile?.licenseExpiry ? new Date(profile.licenseExpiry) < new Date() : false;
  const isInsuranceExpired = profile?.insuranceExpiry ? new Date(profile.insuranceExpiry) < new Date() : false;

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
                  <label className="text-sm font-medium text-gray-600">First Name</label>
                  <p className="text-lg text-gray-900 mt-1">{profile.firstName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Last Name</label>
                  <p className="text-lg text-gray-900 mt-1">{profile.lastName}</p>
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
                <div>
                  <label className="text-sm font-medium text-gray-600">License Type</label>
                  <p className="text-lg text-gray-900 mt-1">{profile.licenseType}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">License Expiry</label>
                  <div className="mt-1">
                    <p className={`text-lg ${isLicenseExpired ? 'text-red-600 font-semibold' : 'text-gray-900'}`}>
                      {formatDate(profile.licenseExpiry)}
                    </p>
                    {isLicenseExpired && (
                      <p className="text-sm text-red-600 mt-1">⚠️ License has expired</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Insurance Expiry</label>
                  <div className="mt-1">
                    <p className={`text-lg ${isInsuranceExpired ? 'text-red-600 font-semibold' : 'text-gray-900'}`}>
                      {formatDate(profile.insuranceExpiry)}
                    </p>
                    {isInsuranceExpired && (
                      <p className="text-sm text-red-600 mt-1">⚠️ Insurance has expired</p>
                    )}
                  </div>
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
