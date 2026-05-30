import * as AccordionPrimitive from '@radix-ui/react-accordion';
import { cn } from '../../lib/utils';

export const Accordion = AccordionPrimitive.Root;
export const AccordionItem = ({ className, ...props }: AccordionPrimitive.AccordionItemProps) => <AccordionPrimitive.Item className={cn('border-b border-zinc-800', className)} {...props} />;
export const AccordionTrigger = ({ className, ...props }: AccordionPrimitive.AccordionTriggerProps) => <AccordionPrimitive.Trigger className={cn('flex w-full items-center justify-between py-3 text-sm', className)} {...props} />;
export const AccordionContent = ({ className, ...props }: AccordionPrimitive.AccordionContentProps) => <AccordionPrimitive.Content className={cn('pb-3 text-sm text-zinc-400', className)} {...props} />;
