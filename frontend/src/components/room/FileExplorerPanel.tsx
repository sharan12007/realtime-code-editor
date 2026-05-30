import { motion, AnimatePresence } from 'framer-motion';
import { FileCode2, FileText, ChevronRight, ChevronDown } from 'lucide-react';

type FileItem = { path: string; content: string; isEntry?: boolean };

export const FileExplorerPanel = ({
  files,
  activePath,
  onSelect,
  collapsed,
  onToggle
}: {
  files: FileItem[];
  activePath: string;
  onSelect: (path: string) => void;
  collapsed: boolean;
  onToggle: () => void;
}) => {
  return (
    <div className='rounded-xl border border-zinc-800 bg-zinc-900/90'>
      <button onClick={onToggle} className='flex w-full items-center justify-between px-3 py-2 text-left text-sm font-medium'>
        <span className='inline-flex items-center gap-2'><FileCode2 className='h-4 w-4 text-zinc-400' /> Explorer</span>
        {collapsed ? <ChevronRight className='h-4 w-4 text-zinc-500' /> : <ChevronDown className='h-4 w-4 text-zinc-500' />}
      </button>
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className='overflow-hidden border-t border-zinc-800'>
            <ul className='p-2'>
              {files.map((file) => (
                <motion.li key={file.path} layout>
                  <button
                    onClick={() => onSelect(file.path)}
                    className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition ${
                      activePath === file.path ? 'bg-zinc-800 text-zinc-100' : 'text-zinc-400 hover:bg-zinc-850 hover:text-zinc-200'
                    }`}
                  >
                    <FileText className='h-3.5 w-3.5' />
                    <span className='mono text-xs'>{file.path}</span>
                    {file.isEntry ? <span className='ml-auto rounded border border-indigo-700/50 px-1.5 py-0.5 text-[10px] text-indigo-300'>entry</span> : null}
                  </button>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
