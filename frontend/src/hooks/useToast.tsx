import { useState, useCallback } from 'react';

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback(({ title, description, variant = 'default' }: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    const newToast: Toast = { id, title, description, variant };

    setToasts((prev) => [...prev, newToast]);

    // Auto dismiss after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);

    return { id };
  }, []);

  return { toast, toasts };
}

// Simple toast component
export function Toaster({ toasts }: { toasts: Toast[] }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`rounded-lg shadow-lg p-4 min-w-[300px] animate-in slide-in-from-right ${t.variant === 'destructive' ? 'bg-status-error text-white' : 'bg-surface border border-border'}`}
        >
          <p className="font-medium">{t.title}</p>
          {t.description && <p className="text-sm opacity-90 mt-1">{t.description}</p>}
        </div>
      ))}
    </div>
  );
}
