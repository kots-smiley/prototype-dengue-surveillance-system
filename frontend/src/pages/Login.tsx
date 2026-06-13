import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { ApiError } from '../utils/api-client';
import { APP_FULL_NAME, APP_LOCATION } from '../configuration/constants';
import { BrandLogo } from '../components/common/BrandLogo';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
      toast.success('Login successful');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'Login failed. Please check your credentials.';
      toast.error(message);
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Spinner fullScreen />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 via-white to-slate-100 p-4 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="surface w-full max-w-md p-8">
        <div className="mb-8 flex flex-col items-center text-center">
          <BrandLogo size="lg" className="mb-4" />
          <p className="kicker">EMR + Surveillance login</p>
          <p className="text-sm text-slate-600 dark:text-slate-400">{APP_FULL_NAME.split('—')[1]?.trim()}</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">{APP_LOCATION}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
          />
          <Input
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
          />
          <Button type="submit" disabled={submitting} className="w-full" aria-live="polite">
            {submitting ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </div>
    </div>
  );
}
