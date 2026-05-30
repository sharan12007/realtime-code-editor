import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthCard } from '../../components/auth/AuthCard';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useAuthStore } from '../../store/auth.store';
import { useToastStore } from '../../components/feedback/Toast';

export const LoginPage = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const loading = useAuthStore((state) => state.loading);
  const pushToast = useToastStore((state) => state.push);

  const [form, setForm] = useState({ email: '', password: '' });

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await login(form.email, form.password);
      pushToast('Welcome back!', 'success');
      navigate('/');
    } catch {
      pushToast('Invalid credentials', 'error');
    }
  };

  return (
    <AuthCard title="Sign In" subtitle="Continue to your collaborative rooms">
      <form className="space-y-4" onSubmit={onSubmit}>
        <Input
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
          required
        />
        <Input
          label="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
          required
        />
        <Button loading={loading} type="submit" className="w-full">
          Login
        </Button>
      </form>
      <p className="mt-4 text-sm text-slate-400">
        No account?{' '}
        <Link to="/register" className="text-indigo-400">
          Register
        </Link>
      </p>
    </AuthCard>
  );
};
