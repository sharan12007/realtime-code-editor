import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
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

export const RoomPage = () => {
  const { roomId = '' } = useParams();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.accessToken);

  const { language, code, setCode, setLanguage, setFiles } = useEditorStore();
  const { connect, bindRoomEvents, users, cursors, typingUsers, executionResult } = useSocketStore();
  const pushToast = useToastStore((state) => state.push);

  const [stdin, setStdin] = useState('');

  const editorRef = useRef<MonacoEditor.editor.IStandaloneCodeEditor | null>(null);
  const ydocRef = useRef<Y.Doc | null>(null);
  const ytextRef = useRef<Y.Text | null>(null);
  const applyingRemoteRef = useRef(false);
  const unsubModelRef = useRef<MonacoEditor.IDisposable | null>(null);

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
        if (editorRef.current && editorRef.current.getValue() !== next) {
          applyingRemoteRef.current = true;
          editorRef.current.setValue(next);
          applyingRemoteRef.current = false;
        }
        setCode(next);
      });

      socket.on('code-updated', (payload) => {
        if (payload.roomId !== roomId || payload.fromUserId === user?.id) return;
        Y.applyUpdate(ydoc, Uint8Array.from(payload.update), 'remote');
      });

      socket.emit('join-room', { roomId }, (ack) => {
        if (!ack.ok) pushToast(ack.message ?? 'Unable to join room', 'error');
      });

      try {
        const { data } = await apiClient.get(`/projects/${roomId}`);
        const project = data.project;
        if (project) {
          setLanguage(project.language);
          setFiles(project.files);
        }
      } catch {
        setCode('// New room project initialized');
      }
    };

    void setupRoom();

    return () => {
      const socket = getSocket();
      socket?.emit('leave-room', { roomId });
      socket?.off('code-updated');

      unsubModelRef.current?.dispose();
      ydocRef.current?.destroy();
      ydocRef.current = null;
      ytextRef.current = null;
    };
  }, [bindRoomEvents, connect, pushToast, roomId, setCode, setFiles, setLanguage, token, user?.id]);

  const activeTypers = useMemo(() => Object.values(typingUsers), [typingUsers]);

  const bindMonacoModel = () => {
    const editor = editorRef.current;
    const ytext = ytextRef.current;
    if (!editor || !ytext) return;

    unsubModelRef.current?.dispose();

    const model = editor.getModel();
    if (!model) return;

    unsubModelRef.current = model.onDidChangeContent((event) => {
      if (applyingRemoteRef.current) return;

      ydocRef.current?.transact(() => {
        for (const change of event.changes) {
          const start = model.getOffsetAt({ lineNumber: change.range.startLineNumber, column: change.range.startColumn });
          const end = model.getOffsetAt({ lineNumber: change.range.endLineNumber, column: change.range.endColumn });
          if (end > start) ytext.delete(start, end - start);
          if (change.text.length > 0) ytext.insert(start, change.text);
        }
      }, 'local');

      const socket = getSocket();
      socket?.emit('typing-start', { roomId, userId: user?.id ?? '', username: user?.username ?? '' });
      socket?.emit('typing-stop', { roomId, userId: user?.id ?? '', username: user?.username ?? '' });
    });
  };

  const onCursorChange = (lineNumber: number, column: number) => {
    const socket = getSocket();
    socket?.emit('cursor-change', {
      roomId,
      userId: user?.id ?? '',
      username: user?.username ?? '',
      color: '#2563EB',
      position: { lineNumber, column }
    });
  };

  const onRunCode = () => {
    const socket = getSocket();
    socket?.emit('run-code', { roomId, language, code, stdin });
  };

  const onSaveProject = async () => {
    try {
      await apiClient.put(`/projects/${roomId}`, {
        language,
        files: [
          {
            path: `main.${language === 'cpp' ? 'cpp' : language === 'javascript' ? 'js' : language}`,
            content: ytextRef.current?.toString() ?? code,
            isEntry: true
          }
        ]
      });
      pushToast('Project saved', 'success');
    } catch {
      pushToast('Failed to save project', 'error');
    }
  };

  return (
    <div className="grid min-h-screen grid-cols-12 gap-4 p-4">
      <aside className="col-span-12 rounded border border-slate-800 bg-slate-900 p-4 lg:col-span-3">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Collaborators</h2>
          <Link to="/" className="text-xs text-indigo-400">
            Back
          </Link>
        </div>
        <ul className="space-y-2">
          {users.map((roomUser) => (
            <li key={roomUser.userId} className="rounded border border-slate-800 p-2">
              <div className="flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: roomUser.color }} />
                <span>{roomUser.username}</span>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-4 text-xs text-slate-400">Live cursors: {Object.keys(cursors).length}</div>
        {activeTypers.length > 0 ? <div className="mt-2 text-xs text-slate-400">Typing: {activeTypers.join(', ')}</div> : null}
      </aside>

      <main className="col-span-12 rounded border border-slate-800 bg-slate-900 p-4 lg:col-span-9">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as typeof language)}
            className="rounded border border-slate-700 bg-slate-950 px-3 py-2 text-sm"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="cpp">C++</option>
            <option value="java">Java</option>
          </select>
          <Button onClick={onSaveProject}>Save</Button>
          <Button onClick={onRunCode}>Run</Button>
        </div>

        <Editor
          height="60vh"
          defaultLanguage="javascript"
          language={language === 'cpp' ? 'cpp' : language}
          value={code}
          theme="vs-dark"
          onMount={(editor, _monaco: Monaco) => {
            editorRef.current = editor;
            bindMonacoModel();
            editor.onDidChangeCursorPosition((event) => {
              onCursorChange(event.position.lineNumber, event.position.column);
            });
          }}
          options={{ minimap: { enabled: false }, fontSize: 14, automaticLayout: true }}
        />

        <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm text-slate-300">STDIN</label>
            <textarea
              value={stdin}
              onChange={(e) => setStdin(e.target.value)}
              className="h-28 w-full rounded border border-slate-700 bg-slate-950 p-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-300">Output</label>
            <pre className="h-28 overflow-auto rounded border border-slate-700 bg-slate-950 p-2 text-xs">
{executionResult ? `${executionResult.stdout}\n${executionResult.stderr}`.trim() : 'Run code to see output...'}
            </pre>
          </div>
        </div>
      </main>
    </div>
  );
};
