import { useState, useEffect } from 'react';
import { LogIn, AlertCircle, UserPlus } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AdminLoginProps {
  onLogin: (email: string, password: string) => Promise<void>;
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFirstAdmin, setIsFirstAdmin] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    checkIfFirstAdmin();
  }, []);

  const checkIfFirstAdmin = async () => {
    const { count } = await supabase
      .from('admin_users')
      .select('*', { count: 'exact', head: true });

    if (count === 0) {
      setIsFirstAdmin(true);
      setMode('signup');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (authError) throw authError;

        if (authData.user) {
          const { error: adminError } = await supabase
            .from('admin_users')
            .insert({
              id: authData.user.id,
              email: email,
            });

          if (adminError) throw adminError;

          await onLogin(email, password);
        }
      } else {
        await onLogin(email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to ' + (mode === 'signup' ? 'create account' : 'login'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-800 dark:bg-slate-700 rounded-full mb-4">
              {mode === 'signup' ? (
                <UserPlus className="h-8 w-8 text-white" />
              ) : (
                <LogIn className="h-8 w-8 text-white" />
              )}
            </div>
            <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">
              {mode === 'signup' ? 'Create First Admin' : 'Admin Login'}
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mt-2">
              {mode === 'signup'
                ? 'Set up your administrator account'
                : 'Sign in to manage your bookstore'}
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 focus:border-slate-500 dark:focus:border-slate-500 focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-600 focus:outline-none transition bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                placeholder="admin@bookstore.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-700 focus:border-slate-500 dark:focus:border-slate-500 focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-600 focus:outline-none transition bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-800 dark:bg-slate-700 text-white py-3 rounded-lg font-semibold hover:bg-slate-700 dark:hover:bg-slate-600 transition disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>{mode === 'signup' ? 'Creating Account...' : 'Signing in...'}</span>
                </>
              ) : (
                <>
                  {mode === 'signup' ? (
                    <UserPlus className="h-5 w-5" />
                  ) : (
                    <LogIn className="h-5 w-5" />
                  )}
                  <span>{mode === 'signup' ? 'Create Admin Account' : 'Sign In'}</span>
                </>
              )}
            </button>

            {!isFirstAdmin && mode === 'login' && (
              <p className="text-center text-sm text-slate-600 dark:text-slate-300 mt-4">
                First time here?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-slate-800 dark:text-slate-100 font-semibold hover:underline"
                >
                  Create first admin account
                </button>
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
