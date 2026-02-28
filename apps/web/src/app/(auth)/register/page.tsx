'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { register } from '@/lib/auth';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(username, email, displayName, password);
      router.push('/channels');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6 p-8 bg-surface-light rounded-xl">
        <h1 className="text-2xl font-bold text-center">Register</h1>
        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-4 py-3 bg-surface rounded-lg border border-surface-lighter focus:border-primary outline-none"
          required
        />
        <input
          type="text"
          placeholder="Display Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full px-4 py-3 bg-surface rounded-lg border border-surface-lighter focus:border-primary outline-none"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 bg-surface rounded-lg border border-surface-lighter focus:border-primary outline-none"
          required
        />
        <input
          type="password"
          placeholder="Password (min 8 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 bg-surface rounded-lg border border-surface-lighter focus:border-primary outline-none"
          required
          minLength={8}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-primary rounded-lg hover:bg-primary-dark transition disabled:opacity-50"
        >
          {loading ? 'Creating account...' : 'Register'}
        </button>
        <p className="text-center text-text-muted text-sm">
          Already have an account? <Link href="/login" className="text-primary hover:underline">Login</Link>
        </p>
      </form>
    </div>
  );
}
