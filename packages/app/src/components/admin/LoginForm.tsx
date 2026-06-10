import { useState } from 'react';
import { useAdminStore } from '@/stores/useAdminStore';
import { useNavigate } from '@tanstack/react-router';

const API_BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/+$/, '');

export function LoginForm() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const setAuth = useAdminStore((s) => s.setAuth);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/api/admin/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.status === 429) {
        setError('Too many attempts. Please wait a minute and try again.');
        return;
      }
      if (!res.ok) {
        setError('Invalid password');
        return;
      }

      const data = (await res.json()) as { token?: string };
      if (!data.token) {
        setError('Server returned an invalid response');
        return;
      }

      setAuth(data.token);
      navigate({ to: '/admin' });
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
      setPassword('');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-stone-800 mb-6">Admin Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-stone-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Enter admin password"
              required
              autoComplete="current-password"
              disabled={isSubmitting}
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-amber-600 text-white py-2 px-4 rounded-md hover:bg-amber-700 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Signing in…' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
