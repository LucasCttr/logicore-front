"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '../../../src/api/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await login({ email, password });
      if (res && (res as any).token) {
        localStorage.setItem('token', (res as any).token);
        localStorage.setItem('user', JSON.stringify((res as any).user ?? {}));
        router.replace('/');
      } else if ((res as any).value && (res as any).value.token) {
        // In case API returns a Result<T> wrapper with value
        localStorage.setItem('token', (res as any).value.token);
        localStorage.setItem('user', JSON.stringify((res as any).value.user ?? {}));
        router.replace('/');
      } else {
        setError('Respuesta inesperada del servidor');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Error de login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container mx-auto p-6">
      <h1 className="text-2xl mb-4">Login</h1>
      <form onSubmit={handleSubmit} className="max-w-md">
        <label className="block">Email</label>
        <input className="w-full border rounded px-3 py-2 mb-3" value={email} onChange={(e) => setEmail(e.target.value)} />
        <label className="block">Password</label>
        <input type="password" className="w-full border rounded px-3 py-2 mb-3" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <div className="text-red-600 mb-2">{error}</div>}
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </main>
  );
}
