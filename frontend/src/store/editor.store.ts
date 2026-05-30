import { create } from 'zustand';
import type { SupportedLanguage } from '../types/socket';

type EditorFile = { path: string; content: string; isEntry?: boolean };

type EditorState = {
  language: SupportedLanguage;
  code: string;
  files: EditorFile[];
  setLanguage: (language: SupportedLanguage) => void;
  setCode: (code: string) => void;
  setFiles: (files: EditorFile[]) => void;
};

export const useEditorStore = create<EditorState>((set) => ({
  language: 'javascript',
  code: '// Start collaborating...',
  files: [{ path: 'main.js', content: '// Start collaborating...', isEntry: true }],
  setLanguage: (language) => set({ language }),
  setCode: (code) => set({ code }),
  setFiles: (files) => set({ files })
}));
