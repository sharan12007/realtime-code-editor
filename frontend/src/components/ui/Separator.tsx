import * as SeparatorPrimitive from '@radix-ui/react-separator';
import { cn } from '../../lib/utils';

export const Separator = ({ className, orientation = 'horizontal', ...props }: SeparatorPrimitive.SeparatorProps) => (
  <SeparatorPrimitive.Root className={cn('shrink-0 bg-zinc-800', orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px', className)} orientation={orientation} {...props} />
);
