import * as AvatarPrimitive from '@radix-ui/react-avatar';
import { cn } from '../../lib/utils';

export const Avatar = ({ className, ...props }: AvatarPrimitive.AvatarProps) => <AvatarPrimitive.Root className={cn('relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full', className)} {...props} />;
export const AvatarImage = ({ className, ...props }: AvatarPrimitive.AvatarImageProps) => <AvatarPrimitive.Image className={cn('aspect-square h-full w-full', className)} {...props} />;
export const AvatarFallback = ({ className, ...props }: AvatarPrimitive.AvatarFallbackProps) => <AvatarPrimitive.Fallback className={cn('flex h-full w-full items-center justify-center rounded-full bg-zinc-800 text-xs', className)} {...props} />;
