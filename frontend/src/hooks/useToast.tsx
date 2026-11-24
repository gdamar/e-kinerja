import { useState, useEffect } from 'react';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

type ToastInput = Omit<Toast, 'id'>;

let memoryToasts: Toast[] = [];
const listeners: Array<(toasts: Toast[]) => void> = [];

function notify() {
  listeners.forEach((listener) => listener([...memoryToasts]));
}

export function toast({ title, description, variant = 'default' }: ToastInput) {
  const id = Math.random().toString(36).slice(2);
  const newToast: Toast = { id, title, description, variant };

  memoryToasts = [...memoryToasts, newToast];
  notify();

  // Auto dismiss after 3 seconds
  setTimeout(() => {
    memoryToasts = memoryToasts.filter((t) => t.id !== id);
    notify();
  }, 3500);

  return { id };
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>(memoryToasts);

  useEffect(() => {
    listeners.push(setToasts);
    return () => {
      const idx = listeners.indexOf(setToasts);
      if (idx > -1) {
        listeners.splice(idx, 1);
      }
    };
  }, []);

  return { toast, toasts };
}

// Global Toaster component
export function Toaster({ toasts: propToasts }: { toasts?: Toast[] } = {}) {
  const { toasts: hookToasts } = useToast();
  const toasts = propToasts ?? hookToasts;

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none max-w-sm w-full px-4 sm:px-0">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto rounded-lg shadow-xl p-4 min-w-[280px] border transition-all animate-in slide-in-from-bottom-2 sm:slide-in-from-right duration-200 ${
            t.variant === 'destructive'
              ? 'bg-[#EF4444] text-white border-red-600'
              : 'bg-white text-stone-900 border-stone-200'
          }`}
        >
          <p className="font-semibold text-sm leading-tight">{t.title}</p>
          {t.description && (
            <p className={`text-xs mt-1 leading-relaxed ${t.variant === 'destructive' ? 'text-white/90' : 'text-stone-600'}`}>
              {t.description}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
