/// <reference types="vite/client" />

import { IconAlertCircle, IconArrowLeft, IconLoader2 } from '@tabler/icons-react';
import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router';
import type React from 'react';
import { useState } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const Route = createFileRoute('/admin/login')({
  component: AdminLogin,
});

interface SignupForm {
  email: string;
  password: string;
  name: string;
}

function AdminLogin() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { redirect?: string };
  const [form, setForm] = useState<SignupForm>({ email: '', password: '', name: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signupClosed, setSignupClosed] = useState(false);

  const handleFieldChange = (field: keyof SignupForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupClosed || isSubmitting) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/api/auth/sign-up/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: form.email.trim(),
          password: form.password,
          name: form.name.trim(),
        }),
      });

      if (res.status === 403) {
        const data = await res.json().catch(() => null);
        const message = data?.message || 'Signup is closed. Contact the administrator.';
        setError(message);
        setSignupClosed(true);
        return;
      }

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.message || `Request failed (${res.status})`);
        return;
      }

      // Successful signup — redirect to admin dashboard or original destination
      const redirectTo = search.redirect || '/admin';
      navigate({ to: redirectTo });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-parchment-100 px-4">
      <div className="w-full max-w-sm animate-enter">
        <div className="card-apothecary overflow-hidden">
          {/* Header */}
          <div className="bg-terra-400 p-6 text-white text-center">
            <h1 className="font-display text-2xl font-semibold">Admin Signup</h1>
            <p className="text-white/75 mt-1 text-sm">Create the initial admin account</p>
          </div>

          {/* Signup closed banner */}
          {signupClosed && (
            <div className="mx-6 mt-6 rounded-xl border border-red-300 bg-red-50 p-4">
              <div className="flex items-start gap-3">
                <IconAlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-600">
                    {error || 'Signup is closed. Contact the administrator.'}
                  </p>
                  <p className="text-xs text-red-400 mt-1">
                    An admin account already exists. Further signups are disabled.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="p-6 space-y-5">
            <div>
              <label htmlFor="signup-name" className="block text-ink-700 font-medium mb-1.5">
                Name
              </label>
              <input
                id="signup-name"
                type="text"
                value={form.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                placeholder="Admin name"
                disabled={signupClosed || isSubmitting}
                className={`input-apothecary ${signupClosed ? 'opacity-50 cursor-not-allowed' : ''}`}
                required
              />
            </div>

            <div>
              <label htmlFor="signup-email" className="block text-ink-700 font-medium mb-1.5">
                Email
              </label>
              <input
                id="signup-email"
                type="email"
                value={form.email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                placeholder="admin@example.com"
                disabled={signupClosed || isSubmitting}
                className={`input-apothecary ${signupClosed ? 'opacity-50 cursor-not-allowed' : ''}`}
                required
              />
            </div>

            <div>
              <label htmlFor="signup-password" className="block text-ink-700 font-medium mb-1.5">
                Password
              </label>
              <input
                id="signup-password"
                type="password"
                value={form.password}
                onChange={(e) => handleFieldChange('password', e.target.value)}
                placeholder="Choose a strong password"
                disabled={signupClosed || isSubmitting}
                className={`input-apothecary ${signupClosed ? 'opacity-50 cursor-not-allowed' : ''}`}
                required
                minLength={8}
              />
            </div>

            {/* Generic error display (non-403 errors) */}
            {error && !signupClosed && (
              <div className="rounded-xl border border-red-300 bg-red-50 p-3">
                <div className="flex items-center gap-2">
                  <IconAlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || signupClosed}
              className="btn-apothecary btn-primary btn-full text-base py-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? (
                <>
                  <IconLoader2 className="w-5 h-5 animate-spin" />
                  Creating account...
                </>
              ) : signupClosed ? (
                'Signup disabled'
              ) : (
                'Create admin account'
              )}
            </button>
          </form>
        </div>

        {/* Back to home link */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => navigate({ to: '/' })}
            className="inline-flex items-center gap-1.5 text-sm text-ink-400 hover:text-terra-500 transition-colors"
          >
            <IconArrowLeft className="w-4 h-4" />
            Back to shop
          </button>
        </div>
      </div>
    </div>
  );
}
