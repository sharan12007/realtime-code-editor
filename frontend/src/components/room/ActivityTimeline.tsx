import { motion } from 'framer-motion';
import { History } from 'lucide-react';

type ActivityItem = { id: string; text: string; ts: number };

export const ActivityTimeline = ({ items }: { items: ActivityItem[] }) => {
  return (
    <div className='rounded-xl border border-zinc-800 bg-zinc-900/90 p-3'>
      <div className='mb-2 inline-flex items-center gap-2 text-sm font-medium'><History className='h-4 w-4 text-zinc-400' /> Activity</div>
      <ul className='space-y-2'>
        {items.slice(-8).reverse().map((item) => (
          <motion.li key={item.id} layout initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className='rounded-md border border-zinc-800 px-2 py-1.5 text-xs text-zinc-400'>
            <div>{item.text}</div>
            <div className='mt-1 text-[10px] text-zinc-500'>{new Date(item.ts).toLocaleTimeString()}</div>
          </motion.li>
        ))}
      </ul>
    </div>
  );
};
