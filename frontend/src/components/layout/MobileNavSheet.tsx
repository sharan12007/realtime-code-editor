import { Menu } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Sheet, SheetContent, SheetTrigger } from '../ui/Sheet';
import { Separator } from '../ui/Separator';
import { Button } from '../ui/Button';
import { useAuthStore } from '../../store/auth.store';

export const MobileNavSheet = () => {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className='inline-flex h-9 w-9 items-center justify-center rounded-md border border-zinc-800 bg-zinc-900 lg:hidden'>
          <Menu className='h-4 w-4' />
        </button>
      </SheetTrigger>
      <SheetContent className='left-0 right-auto h-full w-72 rounded-none border-r border-zinc-800 bg-zinc-950 p-4'>
        <div className='text-lg font-semibold'>Collab IDE</div>
        <Separator className='my-4' />
        <div className='space-y-2'>
          <Link className='block rounded-md px-3 py-2 text-sm hover:bg-zinc-800' to='/'>Dashboard</Link>
          <Link className='block rounded-md px-3 py-2 text-sm hover:bg-zinc-800' to='/profile'>Profile</Link>
        </div>
        <Separator className='my-4' />
        <Button variant='outline' className='w-full' onClick={async () => { await logout(); navigate('/login'); }}>
          Logout
        </Button>
      </SheetContent>
    </Sheet>
  );
};
