import React from 'react';
import UserList from '../../components/UserList';
import AuthGuard from '../../components/AuthGuard';

export default function UsersPage() {
  return (
    <AuthGuard>
      <UserList />
    </AuthGuard>
  );
}
