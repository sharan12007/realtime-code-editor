import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '../../lib/utils';

export const Tabs = TabsPrimitive.Root;
export const TabsList = ({ className, ...props }: TabsPrimitive.TabsListProps) => <TabsPrimitive.List className={cn('inline-flex h-9 items-center rounded-lg bg-zinc-900 p-1', className)} {...props} />;
export const TabsTrigger = ({ className, ...props }: TabsPrimitive.TabsTriggerProps) => <TabsPrimitive.Trigger className={cn('inline-flex items-center justify-center rounded-md px-3 py-1 text-sm data-[state=active]:bg-zinc-800', className)} {...props} />;
export const TabsContent = ({ className, ...props }: TabsPrimitive.TabsContentProps) => <TabsPrimitive.Content className={cn('mt-4', className)} {...props} />;
