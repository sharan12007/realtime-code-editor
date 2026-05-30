import { Input } from './Input';

export const Command = ({ children }: { children: React.ReactNode }) => <div className='rounded-lg border border-zinc-800 bg-zinc-950'>{children}</div>;
export const CommandInput = (props: React.ComponentProps<typeof Input>) => <Input className='border-0' {...props} />;
export const CommandList = ({ children }: { children: React.ReactNode }) => <div className='max-h-72 overflow-auto p-2'>{children}</div>;
export const CommandItem = ({ children, onSelect }: { children: React.ReactNode; onSelect?: () => void }) => <button onClick={onSelect} className='w-full rounded px-2 py-2 text-left text-sm hover:bg-zinc-800'>{children}</button>;
