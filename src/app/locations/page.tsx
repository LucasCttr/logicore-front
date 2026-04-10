"use client";

import React, { useState } from 'react';
import LocationList from '../../components/LocationList';
import LocationForm from '../../components/LocationForm';
import AuthGuard from '../../components/AuthGuard';

export default function LocationsPage() {
  const [showForm, setShowForm] = useState(false);

  return (
    <AuthGuard>
      <main className="container mx-auto p-6">
        {showForm && (
          <div className="mb-6">
            <LocationForm onSuccess={() => setShowForm(false)} />
          </div>
        )}

        <LocationList onAddClick={() => setShowForm(!showForm)} isFormOpen={showForm} />
      </main>
    </AuthGuard>
  );
}
