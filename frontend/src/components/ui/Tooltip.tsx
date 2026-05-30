import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '../../lib/utils';

export const TooltipProvider = TooltipPrimitive.Provider;
export const Tooltip = TooltipPrimitive.Root;
export const TooltipTrigger = TooltipPrimitive.Trigger;
export const TooltipContent = ({ className, ...props }: TooltipPrimitive.TooltipContentProps) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content className={cn('z-50 rounded-md border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs', className)} sideOffset={4} {...props} />
  </TooltipPrimitive.Portal>
);
