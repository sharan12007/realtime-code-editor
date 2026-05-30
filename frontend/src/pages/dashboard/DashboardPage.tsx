import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, LogOut, UserCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Avatar, AvatarFallback } from '../../components/ui/Avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/DropdownMenu';
import { useRoomStore } from '../../store/room.store';
import { useToastStore } from '../../components/feedback/Toast';
import { useAuthStore } from '../../store/auth.store';
import { apiClient } from '../../services/api/client';
import { CommandPalette } from '../../components/layout/CommandPalette';
import { MobileNavSheet } from '../../components/layout/MobileNavSheet';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { rooms, loading, fetchRooms, createRoom } = useRoomStore();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const pushToast = useToastStore((state) => state.push);

  const [roomName, setRoomName] = useState('');
  const [joinCode, setJoinCode] = useState('');

  useEffect(() => { void fetchRooms(); }, [fetchRooms]);

  const roomSlug = useMemo(() => roomName.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').slice(0, 100), [roomName]);

  const onCreateRoom = async () => {
    if (!roomName.trim()) return;
    try {
      const room = await createRoom(roomName, roomSlug || `room-${Date.now()}`);
      setRoomName('');
      pushToast('Room created', 'success');
      navigate(`/room/${room._id}`);
    } catch { pushToast('Failed to create room', 'error'); }
  };

  const onJoinByCode = async () => {
    const code = joinCode.trim().toLowerCase();
    if (!code) return;
    try {
      const { data } = await apiClient.get(`/rooms/code/${encodeURIComponent(code)}`);
      navigate(`/room/${data.room._id}`);
      setJoinCode('');
      pushToast('Joined room', 'success');
    } catch { pushToast('Room code not found', 'error'); }
  };

  return (
    <div className='mx-auto max-w-6xl p-6'>
      <header className='mb-8 flex items-center justify-between gap-3'>
        <div className='flex items-center gap-3'>
          <MobileNavSheet />
          <div>
            <h1 className='text-3xl font-semibold tracking-tight'>Dashboard</h1>
            <p className='text-sm text-zinc-400'>Welcome {user?.username}</p>
          </div>
        </div>
        <div className='hidden md:block'><CommandPalette /></div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className='rounded-full border border-zinc-800 p-1'><Avatar><AvatarFallback>{user?.username?.slice(0,2).toUpperCase() ?? 'U'}</AvatarFallback></Avatar></button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={() => navigate('/profile')}><UserCircle2 className='mr-2 h-4 w-4' /> Profile</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => void logout()}><LogOut className='mr-2 h-4 w-4' /> Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <div className='mb-4 md:hidden'><CommandPalette /></div>

      <Card className='mb-6'>
        <CardHeader><CardTitle>Create Room</CardTitle></CardHeader>
        <CardContent className='space-y-2'>
          <Label htmlFor='roomName'>Room Name</Label>
          <div className='flex gap-2'>
            <Input id='roomName' value={roomName} onChange={(e) => setRoomName(e.target.value)} />
            <Button onClick={onCreateRoom}><Plus className='mr-1 h-4 w-4' />Create</Button>
          </div>
          {roomSlug ? <p className='text-xs text-zinc-400'>Room code: {roomSlug}</p> : null}
        </CardContent>
      </Card>

      <Card className='mb-6'>
        <CardHeader><CardTitle>Join Room by Code</CardTitle></CardHeader>
        <CardContent className='space-y-2'>
          <Label htmlFor='joinCode'>Room Code</Label>
          <div className='flex gap-2'>
            <Input id='joinCode' value={joinCode} onChange={(e) => setJoinCode(e.target.value)} placeholder='my-team-room' />
            <Button onClick={onJoinByCode}>Join</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Your Rooms</CardTitle></CardHeader>
        <CardContent>
          {loading ? <div className='text-zinc-400'>Loading rooms...</div> : rooms.length === 0 ? <div className='text-zinc-400'>No rooms yet</div> : (
            <ul className='space-y-2'>
              {rooms.map((room) => (
                <li key={room._id} className='flex items-center justify-between rounded-lg border border-zinc-800 p-3'>
                  <div>
                    <div className='font-medium'>{room.roomName}</div>
                    <div className='text-xs text-zinc-400'>Code: {room.roomSlug}</div>
                  </div>
                  <Button asChild><Link to={`/room/${room._id}`}>Open</Link></Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
