import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { cn } from '../../lib/utils';

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
export const DropdownMenuContent = ({ className, ...props }: DropdownMenuPrimitive.DropdownMenuContentProps) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content className={cn('z-50 min-w-40 rounded-md border border-zinc-800 bg-zinc-950 p-1', className)} sideOffset={6} {...props} />
  </DropdownMenuPrimitive.Portal>
);
export const DropdownMenuItem = ({ className, ...props }: DropdownMenuPrimitive.DropdownMenuItemProps) => <DropdownMenuPrimitive.Item className={cn('cursor-pointer rounded px-2 py-1.5 text-sm outline-none hover:bg-zinc-800', className)} {...props} />;
