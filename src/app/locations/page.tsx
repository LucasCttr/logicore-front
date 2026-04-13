"use client";

import React, { useState } from 'react';
import LocationList from '../../components/LocationList';
import LocationForm from '../../components/LocationForm';
import AuthGuard from '../../components/AuthGuard';

export default function LocationsPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <AuthGuard>
      {showForm && (
        <div className="mb-6 px-6">
          <LocationForm onSuccess={() => setShowForm(false)} />
        </div>
      )}

      <LocationList onAddClick={() => setShowForm(!showForm)} isFormOpen={showForm} />
    </AuthGuard>
  );
}
