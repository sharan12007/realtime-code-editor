import { create } from 'zustand';

type ToastItem = { id: string; message: string; type: 'success' | 'error' | 'info' };

type ToastState = {
  items: ToastItem[];
  push: (message: string, type?: ToastItem['type']) => void;
  remove: (id: string) => void;
};

export const useToastStore = create<ToastState>((set) => ({
  items: [],
  push: (message, type = 'info') => {
    const id = crypto.randomUUID();
    set((state) => ({ items: [...state.items, { id, message, type }] }));
    setTimeout(() => {
      set((state) => ({ items: state.items.filter((item) => item.id !== id) }));
    }, 3000);
  },
  remove: (id) => set((state) => ({ items: state.items.filter((item) => item.id !== id) }))
}));

export const ToastViewport = () => {
  const items = useToastStore((state) => state.items);
  const remove = useToastStore((state) => state.remove);

  return (
    <div className="fixed right-4 top-4 z-50 space-y-2">
      {items.map((toast) => (
        <button
          key={toast.id}
          onClick={() => remove(toast.id)}
          className={`block rounded px-4 py-2 text-left text-sm shadow ${
            toast.type === 'error'
              ? 'bg-rose-600'
              : toast.type === 'success'
                ? 'bg-emerald-600'
                : 'bg-slate-700'
          }`}
        >
          {toast.message}
        </button>
      ))}
    </div>
  );
};
