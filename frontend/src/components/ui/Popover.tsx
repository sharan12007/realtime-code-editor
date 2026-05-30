import * as PopoverPrimitive from '@radix-ui/react-popover';
import { cn } from '../../lib/utils';

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;
export const PopoverContent = ({ className, ...props }: PopoverPrimitive.PopoverContentProps) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content className={cn('z-50 rounded-md border border-zinc-800 bg-zinc-950 p-4', className)} sideOffset={8} {...props} />
  </PopoverPrimitive.Portal>
);
