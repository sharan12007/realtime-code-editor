import { motion } from 'framer-motion';
import { Avatar, AvatarFallback } from '../ui/Avatar';
import type { RoomUser } from '../../types/socket';

export const PresenceList = ({ users }: { users: RoomUser[] }) => {
  return (
    <div className='rounded-xl border border-zinc-800 bg-zinc-900/90 p-3'>
      <div className='mb-2 text-sm font-medium'>Presence</div>
      <ul className='space-y-2'>
        {users.map((member) => (
          <motion.li key={member.userId} layout initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} className='flex items-center gap-2 rounded-md border border-zinc-800 px-2 py-1.5'>
            <motion.span layout className='inline-block h-2.5 w-2.5 rounded-full' style={{ background: member.color }} />
            <Avatar className='h-6 w-6'><AvatarFallback>{member.username.slice(0,2).toUpperCase()}</AvatarFallback></Avatar>
            <span className='text-sm'>{member.username}</span>
            <span className='ml-auto text-[10px] text-emerald-400'>online</span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
};
