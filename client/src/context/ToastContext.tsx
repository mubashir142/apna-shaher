import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  success: (msg: string) => void;
  error: (msg: string) => void;
  info: (msg: string) => void;
  warning: (msg: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const ICONS: Record<ToastType, string> = {
  success: '✓',
  error:   '✕',
  info:    'ℹ',
  warning: '⚠',
};

const STYLES: Record<ToastType, { bg: string; color: string; border: string }> = {
  success: { bg: 'var(--success-light)', color: 'var(--success)', border: 'var(--success-border)' },
  error:   { bg: 'var(--danger-light)',  color: 'var(--danger)',  border: 'var(--danger-border)'  },
  info:    { bg: 'var(--primary-light)', color: 'var(--primary)', border: 'var(--primary-border)' },
  warning: { bg: 'var(--warning-light)', color: 'var(--warning)', border: 'var(--warning-border)' },
};

let nextId = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const add = useCallback((type: ToastType, message: string) => {
    const id = ++nextId;
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  const dismiss = (id: number) => setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <ToastContext.Provider value={{
      success: (m) => add('success', m),
      error:   (m) => add('error', m),
      info:    (m) => add('info', m),
      warning: (m) => add('warning', m),
    }}>
      {children}

      {/* Toast container */}
      <div style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.625rem',
        maxWidth: '340px',
        width: '100%',
      }}>
        {toasts.map(toast => {
          const s = STYLES[toast.type];
          return (
            <div key={toast.id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.875rem 1rem',
              background: s.bg,
              border: `1px solid ${s.border}`,
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)',
              animation: 'slideIn 0.2s ease',
            }}>
              <span style={{
                width: '22px', height: '22px',
                borderRadius: '50%',
                background: s.color,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 700,
                flexShrink: 0,
              }}>
                {ICONS[toast.type]}
              </span>
              <span style={{ flex: 1, fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-2)' }}>
                {toast.message}
              </span>
              <button
                onClick={() => dismiss(toast.id)}
                style={{ background: 'none', color: 'var(--text-4)', fontSize: '1rem', lineHeight: 1, flexShrink: 0 }}
              >
                ×
              </button>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
