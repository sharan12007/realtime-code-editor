import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthCard } from '../../components/auth/AuthCard';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { useAuthStore } from '../../store/auth.store';
import { useToastStore } from '../../components/feedback/Toast';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const register = useAuthStore((state) => state.register);
  const loading = useAuthStore((state) => state.loading);
  const pushToast = useToastStore((state) => state.push);

  const [form, setForm] = useState({ username: '', email: '', password: '' });

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      await register(form.username, form.email, form.password);
      pushToast('Registration successful. Please login.', 'success');
      navigate('/login');
    } catch {
      pushToast('Registration failed', 'error');
    }
  };

  return (
    <AuthCard title="Create Account" subtitle="Start building together in real time">
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input id="username" value={form.username} onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" value={form.password} onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))} required />
        </div>
        <Button loading={loading} type="submit" className="w-full">
          Register
        </Button>
      </form>
      <p className="mt-4 text-sm text-slate-400">
        Already have an account?{' '}
        <Link to="/login" className="text-indigo-400">
          Login
        </Link>
      </p>
    </AuthCard>
  );
};
