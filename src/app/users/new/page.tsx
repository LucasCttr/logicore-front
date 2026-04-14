import React from 'react';
import UserForm from '../../../components/UserForm';
import AuthGuard from '../../../components/AuthGuard';

export default function NewUserPage() {
  return (
    <AuthGuard>
      <UserForm />
    </AuthGuard>
  );
}
