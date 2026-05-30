import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Save, ChevronLeft, PanelLeftOpen, PanelLeftClose } from 'lucide-react';
import Editor, { type Monaco } from '@monaco-editor/react';
import type * as MonacoEditor from 'monaco-editor';
import * as Y from 'yjs';
import { useEditorStore } from '../../store/editor.store';
import { useSocketStore } from '../../store/socket.store';
import { useAuthStore } from '../../store/auth.store';
import { getSocket } from '../../services/socket/client';
import { Button } from '../../components/ui/Button';
import { useToastStore } from '../../components/feedback/Toast';
import { apiClient } from '../../services/api/client';
import { Textarea } from '../../components/ui/Textarea';
import { FileExplorerPanel } from '../../components/room/FileExplorerPanel';
import { ActivityTimeline } from '../../components/room/ActivityTimeline';
import { PresenceList } from '../../components/room/PresenceList';

export const RoomPage = () => {
  const { roomId = '' } = useParams();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.accessToken);

  const { language, setLanguage, files, setFiles } = useEditorStore();
  const { connect, bindRoomEvents, users, cursors, typingUsers, executionResult } = useSocketStore();
  const pushToast = useToastStore((state) => state.push);

  const executionEnabled = import.meta.env.VITE_EXECUTION_ENABLED !== 'false';

  const [stdin, setStdin] = useState('');
  const [activePath, setActivePath] = useState('main.js');
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [explorerCollapsed, setExplorerCollapsed] = useState(false);
  const [activity, setActivity] = useState<Array<{ id: string; text: string; ts: number }>>([]);

  const editorRef = useRef<MonacoEditor.editor.IStandaloneCodeEditor | null>(null);
  const ydocRef = useRef<Y.Doc | null>(null);
  const ytextRef = useRef<Y.Text | null>(null);
  const applyingRemoteRef = useRef(false);
  const unsubModelRef = useRef<MonacoEditor.IDisposable | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const addActivity = (text: string) => setActivity((prev) => [...prev, { id: crypto.randomUUID(), text, ts: Date.now() }]);

  useEffect(() => {
    const setupRoom = async () => {
      if (!token || !roomId) return;
      connect(token);
      bindRoomEvents();
      const socket = getSocket();
      if (!socket) return;

      const ydoc = new Y.Doc();
      const ytext = ydoc.getText('monaco');
      ydocRef.current = ydoc;
      ytextRef.current = ytext;

      ydoc.on('update', (update, origin) => {
        if (origin === 'remote') return;
        socket.emit('code-change', { roomId, update: Array.from(update) });
      });

      ytext.observe(() => {
        const next = ytext.toString();
        const editor = editorRef.current;
        if (editor && editor.getValue() !== next) {
          applyingRemoteRef.current = true;
          editor.executeEdits('yjs-remote', [{ range: editor.getModel()!.getFullModelRange(), text: next, forceMoveMarkers: true }]);
          applyingRemoteRef.current = false;
        }
      });

      socket.on('code-updated', (payload) => {
        if (payload.roomId !== roomId || payload.fromUserId === user?.id) return;
        Y.applyUpdate(ydoc, Uint8Array.from(payload.update), 'remote');
      });

      socket.emit('join-room', { roomId }, (ack) => {
        if (!ack.ok) pushToast(ack.message ?? 'Unable to join room', 'error');
        else addActivity('Joined room');
      });

      try {
        const { data } = await apiClient.get(`/projects/${roomId}`);
        const project = data.project;
        if (project) {
          setLanguage(project.language);
          setFiles(project.files);
          const entry = project.files.find((f: { isEntry?: boolean }) => f.isEntry) ?? project.files[0];
          if (entry?.path) setActivePath(entry.path);
          addActivity('Loaded project files');
        }
      } catch {
        const editor = editorRef.current;
        if (editor && editor.getValue().length === 0) editor.setValue('// New room project initialized');
      }
    };

    void setupRoom();
    return () => {
      const socket = getSocket();
      socket?.emit('leave-room', { roomId });
      socket?.off('code-updated');
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      unsubModelRef.current?.dispose();
      ydocRef.current?.destroy();
      ydocRef.current = null;
      ytextRef.current = null;
    };
  }, [bindRoomEvents, connect, pushToast, roomId, setFiles, setLanguage, token, user?.id]);

  useEffect(() => {
    const typingNames = Object.values(typingUsers);
    if (typingNames.length > 0) addActivity(`${typingNames.join(', ')} typing...`);
  }, [typingUsers]);

  useEffect(() => { if (executionResult) addActivity(`Run finished: ${executionResult.status}`); }, [executionResult]);

  const activeTypers = useMemo(() => Object.values(typingUsers), [typingUsers]);

  const bindMonacoModel = () => {
    const editor = editorRef.current;
    const ytext = ytextRef.current;
    if (!editor || !ytext) return;

    unsubModelRef.current?.dispose();
    const model = editor.getModel();
    if (!model) return;

    unsubModelRef.current = model.onDidChangeContent(() => {
      if (applyingRemoteRef.current) return;
      const nextValue = model.getValue();
      const currentYValue = ytext.toString();
      if (nextValue !== currentYValue) {
        ydocRef.current?.transact(() => {
          ytext.delete(0, currentYValue.length);
          ytext.insert(0, nextValue);
        }, 'local');
      }
      const socket = getSocket();
      socket?.emit('typing-start', { roomId, userId: user?.id ?? '', username: user?.username ?? '' });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket?.emit('typing-stop', { roomId, userId: user?.id ?? '', username: user?.username ?? '' });
      }, 1200);
    });
  };

  const onCursorChange = (lineNumber: number, column: number) => {
    getSocket()?.emit('cursor-change', {
      roomId,
      userId: user?.id ?? '',
      username: user?.username ?? '',
      color: '#2563EB',
      position: { lineNumber, column }
    });
  };

  const onRunCode = () => {
    if (!executionEnabled) return;

    const currentCode = ytextRef.current?.toString() ?? editorRef.current?.getValue() ?? '';
    getSocket()?.emit('run-code', { roomId, language, code: currentCode, stdin });
    addActivity('Triggered code run');
  };

  const onSaveProject = async () => {
    try {
      await apiClient.put(`/projects/${roomId}`, {
        language,
        files: [{ path: activePath, content: ytextRef.current?.toString() ?? editorRef.current?.getValue() ?? '', isEntry: true }]
      });
      pushToast('Project saved', 'success');
      addActivity('Saved project');
    } catch {
      pushToast('Failed to save project', 'error');
    }
  };

  useEffect(() => {
    const onKeydown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        void onSaveProject();
      }
      if (executionEnabled && (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'enter') {
        event.preventDefault();
        onRunCode();
      }
    };
    window.addEventListener('keydown', onKeydown);
    return () => window.removeEventListener('keydown', onKeydown);
  });

  const onSelectFile = (path: string) => {
    setActivePath(path);
    const selected = files.find((file) => file.path === path);
    const text = selected?.content ?? '';
    if (editorRef.current && editorRef.current.getValue() !== text) {
      applyingRemoteRef.current = true;
      editorRef.current.setValue(text);
      applyingRemoteRef.current = false;
      if (ytextRef.current) {
        ydocRef.current?.transact(() => {
          ytextRef.current!.delete(0, ytextRef.current!.length);
          ytextRef.current!.insert(0, text);
        }, 'local');
      }
    }
    addActivity(`Opened file ${path}`);
  };

  return (
    <div className='grid min-h-screen grid-cols-12 gap-4 p-4'>
      <motion.aside layout className={`col-span-12 ${leftCollapsed ? 'lg:col-span-1' : 'lg:col-span-3'} rounded border border-zinc-800 bg-zinc-900 p-3`}>
        <div className='mb-3 flex items-center justify-between'>
          <h2 className='text-sm font-semibold'>Workspace</h2>
          <div className='flex items-center gap-2'>
            <Link to='/' className='inline-flex items-center gap-1 text-xs text-indigo-400'><ChevronLeft className='h-3 w-3' />Back</Link>
            <button onClick={() => setLeftCollapsed((v) => !v)} className='rounded border border-zinc-700 p-1'>{leftCollapsed ? <PanelLeftOpen className='h-3.5 w-3.5' /> : <PanelLeftClose className='h-3.5 w-3.5' />}</button>
          </div>
        </div>
        {!leftCollapsed && (
          <div className='space-y-3'>
            <FileExplorerPanel files={files} activePath={activePath} onSelect={onSelectFile} collapsed={explorerCollapsed} onToggle={() => setExplorerCollapsed((v) => !v)} />
            <PresenceList users={users} />
            <ActivityTimeline items={activity} />
            <div className='text-xs text-zinc-400'>Live cursors: {Object.keys(cursors).length}</div>
            {activeTypers.length > 0 ? <div className='text-xs text-zinc-400'>Typing: {activeTypers.join(', ')}</div> : null}
          </div>
        )}
      </motion.aside>

      <main className='col-span-12 rounded border border-zinc-800 bg-zinc-900 p-4 lg:col-span-9'>
        <motion.div layout className='mb-3 flex flex-wrap items-center gap-2'>
          <motion.select whileFocus={{ scale: 1.01 }} value={language} onChange={(e) => setLanguage(e.target.value as typeof language)} className='rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm'>
            <option value='javascript'>JavaScript</option>
            <option value='python'>Python</option>
            <option value='cpp'>C++</option>
            <option value='java'>Java</option>
          </motion.select>
          <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}><Button onClick={onSaveProject}><Save className='mr-1 h-4 w-4' />Save</Button></motion.div>
          {executionEnabled && (
            <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}><Button onClick={onRunCode}><Play className='mr-1 h-4 w-4' />Run</Button></motion.div>
          )}
          <div className='ml-auto text-[11px] text-zinc-500'>{executionEnabled ? '?/Ctrl+S Save � ?/Ctrl+Enter Run' : 'Code execution is disabled'}</div>
        </motion.div>

        <Editor
          height='60vh'
          defaultLanguage='javascript'
          language={language === 'cpp' ? 'cpp' : language}
          defaultValue=''
          theme='vs-dark'
          onMount={(editor, _monaco: Monaco) => {
            editorRef.current = editor;
            bindMonacoModel();
            editor.onDidChangeCursorPosition((event) => onCursorChange(event.position.lineNumber, event.position.column));
          }}
          options={{ minimap: { enabled: false }, fontSize: 14, automaticLayout: true, quickSuggestions: { other: true, comments: false, strings: false }, suggestOnTriggerCharacters: true, acceptSuggestionOnEnter: 'smart', inlineSuggest: { enabled: true }, wordBasedSuggestions: 'matchingDocuments', parameterHints: { enabled: true }, snippetSuggestions: 'inline' }}
        />

        <div className='mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2'>
          <div>
            <label className='mb-1 block text-sm text-zinc-300'>STDIN</label>
            <Textarea value={stdin} onChange={(e) => setStdin(e.target.value)} className='h-28' />
          </div>
          <div>
            <label className='mb-1 block text-sm text-zinc-300'>Output</label>
            <pre className='h-28 overflow-auto rounded border border-zinc-700 bg-zinc-950 p-2 text-xs mono'>
              {executionEnabled
                ? executionResult
                  ? `${executionResult.stdout}\n${executionResult.stderr}`.trim()
                  : 'Run code to see output...'
                : 'Code execution is disabled.'}
            </pre>
          </div>
        </div>
      </main>
    </div>
  );
};
