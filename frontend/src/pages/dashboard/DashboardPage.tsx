import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useRoomStore } from '../../store/room.store';
import { useToastStore } from '../../components/feedback/Toast';
import { useAuthStore } from '../../store/auth.store';

export const DashboardPage = () => {
  const { rooms, loading, fetchRooms, createRoom } = useRoomStore();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const pushToast = useToastStore((state) => state.push);

  const [roomName, setRoomName] = useState('');

  useEffect(() => {
    void fetchRooms();
  }, [fetchRooms]);

  const roomSlug = useMemo(
    () =>
      roomName
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .slice(0, 100),
    [roomName]
  );

  const onCreateRoom = async () => {
    if (!roomName.trim()) return;
    try {
      await createRoom(roomName, roomSlug || `room-${Date.now()}`);
      setRoomName('');
      pushToast('Room created', 'success');
    } catch {
      pushToast('Failed to create room', 'error');
    }
  };

  return (
    <div className="mx-auto max-w-6xl p-6">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-slate-400">Welcome {user?.username}</p>
        </div>
        <div className="flex gap-2">
          <Link to="/profile" className="rounded border border-slate-700 px-3 py-2 text-sm">
            Profile
          </Link>
          <Button onClick={() => void logout()}>Logout</Button>
        </div>
      </header>

      <section className="mb-6 rounded border border-slate-800 bg-slate-900 p-4">
        <h2 className="mb-3 text-lg">Create Room</h2>
        <div className="flex gap-2">
          <Input label="Room Name" value={roomName} onChange={(e) => setRoomName(e.target.value)} />
          <Button onClick={onCreateRoom} className="self-end">
            Create
          </Button>
        </div>
      </section>

      <section className="rounded border border-slate-800 bg-slate-900 p-4">
        <h2 className="mb-3 text-lg">Your Rooms</h2>
        {loading ? (
          <div className="text-slate-400">Loading rooms...</div>
        ) : rooms.length === 0 ? (
          <div className="text-slate-400">No rooms yet</div>
        ) : (
          <ul className="space-y-2">
            {rooms.map((room) => (
              <li key={room._id} className="flex items-center justify-between rounded border border-slate-800 p-3">
                <div>
                  <div className="font-medium">{room.roomName}</div>
                  <div className="text-xs text-slate-400">{room.roomSlug}</div>
                </div>
                <Link to={`/room/${room._id}`} className="rounded bg-indigo-600 px-3 py-2 text-sm">
                  Join
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};
