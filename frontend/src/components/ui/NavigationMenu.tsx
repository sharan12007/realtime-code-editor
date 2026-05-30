import { Link } from 'react-router-dom';

export const NavigationMenu = ({ items }: { items: Array<{ label: string; href: string }> }) => (
  <nav className='flex items-center gap-2'>
    {items.map((item) => <Link key={item.href} className='rounded-md px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100' to={item.href}>{item.label}</Link>)}
  </nav>
);
