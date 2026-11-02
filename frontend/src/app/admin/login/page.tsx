'use client';

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminLoginApi, checkAdminSessionApi } from '@/lib/api';
import { Eye, EyeOff } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // If already authenticated, redirect immediately to /admin
  useEffect(() => {
    checkAdminSessionApi().then((isAuthed) => {
      if (isAuthed) {
        router.push('/admin');
      }
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    const result = await adminLoginApi(username, password);
    setIsLoading(false);

    if (result.success) {
      router.push('/admin');
    } else {
      setErrorMsg(result.error || 'Invalid username or password.');
    }
  };

  return (
    <div className="min-h-screen bg-bg text-bone flex flex-col justify-center items-center p-4 selection:bg-champagne selection:text-on-champagne">
      <Head>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      <div className="w-full max-w-sm bg-surface border border-hairline rounded-[4px] p-8 shadow-2xl flex flex-col gap-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-1.5">
          <Link href="/" className="font-display text-2xl text-bone tracking-tight font-normal hover:text-champagne transition-colors">
            Mono Time
          </Link>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-champagne">
            Atelier Administration
          </span>
        </div>

        {/* Generic Error Notice */}
        {errorMsg && (
          <div className="p-3 bg-surface-2 border border-error rounded-[2px] text-xs text-error font-sans">
            {errorMsg}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10px] uppercase tracking-wider text-faint">
              Username
            </label>
            <input
              type="text"
              required
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-surface-2 border border-hairline focus:border-champagne rounded-[2px] px-3 py-2 text-xs text-bone focus:outline-none transition-colors font-sans"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10px] uppercase tracking-wider text-faint">
              Password
            </label>
            <div className="relative flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface-2 border border-hairline focus:border-champagne rounded-[2px] px-3 py-2 pr-9 text-xs text-bone focus:outline-none transition-colors font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 text-faint hover:text-bone transition-colors p-0.5"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full py-2.5 mt-2 disabled:opacity-40"
          >
            {isLoading ? 'Verifying...' : 'Sign in'}
          </button>
        </form>

        <div className="pt-2 border-t border-hairline text-center">
          <Link
            href="/"
            className="font-mono text-[10px] uppercase tracking-wider text-faint hover:text-muted transition-colors"
          >
            ← Return to storefront
          </Link>
        </div>
      </div>
    </div>
  );
}

