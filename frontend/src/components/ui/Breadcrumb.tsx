import { Link } from 'react-router-dom';

export const Breadcrumb = ({ items }: { items: Array<{ label: string; href?: string }> }) => (
  <div className='flex items-center gap-2 text-xs text-zinc-400'>
    {items.map((item, index) => (
      <span key={`${item.label}-${index}`}>
        {item.href ? <Link to={item.href} className='hover:text-zinc-100'>{item.label}</Link> : item.label}
        {index < items.length - 1 ? ' / ' : ''}
      </span>
    ))}
  </div>
);
