import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';

export const ProfilePage = () => {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="mx-auto mt-10 max-w-2xl rounded border border-slate-800 bg-slate-900 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Profile</h1>
        <Link to="/" className="text-sm text-indigo-400">
          Back to Dashboard
        </Link>
      </div>
      <div className="space-y-2 text-sm">
        <div>
          <span className="text-slate-400">Username:</span> {user?.username ?? '-'}
        </div>
        <div>
          <span className="text-slate-400">Email:</span> {user?.email ?? '-'}
        </div>
        <div>
          <span className="text-slate-400">Status:</span> Active
        </div>
      </div>
    </div>
  );
};
