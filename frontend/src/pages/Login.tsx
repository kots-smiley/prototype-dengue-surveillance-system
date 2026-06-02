import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { ApiError } from '../utils/api-client';
import { APP_NAME, APP_FULL_NAME, APP_LOCATION } from '../configuration/constants';

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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 via-white to-slate-100 p-4">
      <div className="surface w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <p className="kicker">Surveillance login</p>
          <h1 className="mb-1 text-3xl font-bold text-primary-600">{APP_NAME}</h1>
          <p className="text-sm text-slate-600">{APP_FULL_NAME.split('—')[1]?.trim()}</p>
          <p className="mt-1 text-xs text-slate-500">{APP_LOCATION}</p>
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
