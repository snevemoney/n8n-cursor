'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo-key'
);

// Check if we're in dev mode
const isDevMode = () => {
  // Check via NODE_ENV first
  const isDev = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_DEV_MODE === 'true';
  if (isDev) return true;

  // Fallback: Check hostname against configured dev hosts
  if (typeof window === 'undefined') return false;
  const devHosts = process.env.NEXT_PUBLIC_DEV_HOSTS?.split(',') || [];
  return devHosts.includes(window.location.hostname);
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  // Check if admin bypass is enabled
  const bypassEnabled = isDevMode();

  // Auto-redirect to dashboard if in dev mode with bypass
  useEffect(() => {
    if (bypassEnabled) {
      console.log('🚀 Dev bypass enabled - redirecting to dashboard');
      router.push('/dashboard');
    }
  }, [bypassEnabled, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage(`Login failed: ${error.message}`);
        return;
      }

      if (data.user) {
        // Check if user is the hardcoded admin
        const adminUID = process.env.NEXT_PUBLIC_ADMIN_UID;
        
        if (data.user.id === adminUID) {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      }
    } catch (error) {
      setMessage('Login error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Show loading screen during dev bypass redirect
  if (bypassEnabled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl mb-4">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Development Mode</h2>
          <p className="text-gray-400 mb-4">Redirecting to dashboard...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl mb-4">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Lightning Platform</h1>
          <p className="text-gray-400">Sign in to your Lightning business node</p>
        </div>

        {/* Login Form */}
        <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700 rounded-2xl p-8 shadow-2xl">
          {/* Dev Mode Notice */}
          {bypassEnabled && (
            <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
              <div className="flex items-center">
                <span className="text-yellow-400 text-xl mr-3">⚡</span>
                <div>
                  <h3 className="text-sm font-medium text-yellow-300">
                    Development Mode Active
                  </h3>
                  <p className="text-sm text-yellow-400/80 mt-1">
                    Admin bypass enabled. Visit <a href="/admin" className="underline font-medium hover:text-yellow-300">/admin</a> directly.
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            {message && (
              <div className={`p-4 rounded-xl text-sm ${
                message.includes('failed') || message.includes('denied') || message.includes('error')
                  ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                  : 'bg-green-500/10 text-green-400 border border-green-500/20'
              }`}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-semibold py-3 px-4 rounded-xl hover:from-yellow-300 hover:to-orange-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In to Lightning Platform'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-700">
            <div className="text-center text-sm text-gray-400">
              <div className="p-4 bg-gray-900/30 rounded-xl">
                <h3 className="font-medium text-gray-300 mb-2">🔐 Secure Access</h3>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li>• Advanced admin security with hardcoded access control</li>
                  <li>• Automatic role detection and redirection</li>
                  <li>• Enterprise-grade authentication</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-6 text-gray-500 text-sm">
          <p>Powered by Lightning Network ⚡ Secured by Bitcoin</p>
        </div>
      </div>
    </div>
  );
} 