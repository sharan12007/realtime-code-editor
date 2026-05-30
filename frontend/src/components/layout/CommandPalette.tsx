import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Home, User, PlusSquare } from 'lucide-react';
import { Dialog, DialogContent } from '../ui/Dialog';
import { Command, CommandInput, CommandItem, CommandList } from '../ui/Command';
import { useRoomStore } from '../../store/room.store';

export const CommandPalette = () => {
  const navigate = useNavigate();
  const { rooms } = useRoomStore();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const filteredRooms = useMemo(
    () => rooms.filter((room) => room.roomName.toLowerCase().includes(query.toLowerCase()) || room.roomSlug.toLowerCase().includes(query.toLowerCase())),
    [rooms, query]
  );

  const runAction = (fn: () => void) => {
    fn();
    setOpen(false);
    setQuery('');
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className='inline-flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800'
      >
        <Search className='h-3.5 w-3.5' />
        Command Palette
        <span className='rounded border border-zinc-700 px-1.5 py-0.5 text-[10px] text-zinc-500'>Ctrl+K</span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='p-0'>
          <Command>
            <div className='border-b border-zinc-800 p-2'>
              <CommandInput autoFocus placeholder='Search commands and rooms…' value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <CommandList>
              <CommandItem onSelect={() => runAction(() => navigate('/'))}><Home className='mr-2 inline h-4 w-4' />Go to Dashboard</CommandItem>
              <CommandItem onSelect={() => runAction(() => navigate('/profile'))}><User className='mr-2 inline h-4 w-4' />Open Profile</CommandItem>
              <CommandItem onSelect={() => runAction(() => navigate('/'))}><PlusSquare className='mr-2 inline h-4 w-4' />Create Room</CommandItem>
              {filteredRooms.slice(0, 8).map((room) => (
                <CommandItem key={room._id} onSelect={() => runAction(() => navigate(`/room/${room._id}`))}>
                  <Search className='mr-2 inline h-4 w-4' />Open Room: {room.roomName}
                </CommandItem>
              ))}
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    </>
  );
};
