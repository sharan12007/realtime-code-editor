import * as React from 'react';
import { cn } from '../../lib/utils';

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => (
  <textarea ref={ref} className={cn('min-h-20 w-full rounded-md border bg-zinc-950/70 p-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]', className)} {...props} />
));
Textarea.displayName = 'Textarea';
