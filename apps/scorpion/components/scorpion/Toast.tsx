'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  isExiting?: boolean;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (type: Toast['type'], message: string, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((type: Toast['type'], message: string, duration = 5000) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: Toast = { id, type, message, duration };
    
    setToasts(prev => [...prev, newToast]);
    
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.map(toast => 
      toast.id === id ? { ...toast, isExiting: true } : toast
    ));
    
    // Remove from DOM after animation completes (reduced delay for faster cleanup)
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 100);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm" suppressHydrationWarning>
      {toasts.map((toast, index) => (
        <ToastItem 
          key={toast.id} 
          toast={toast} 
          onRemove={removeToast}
          index={index}
        />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove, index }: { toast: Toast; onRemove: (id: string) => void; index: number }) {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-400" />,
    error: <XCircle className="w-5 h-5 text-red-400" />,
    warning: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />
  };

  const colors = {
    success: 'border-emerald-400/30 bg-emerald-900/20',
    error: 'border-red-400/30 bg-red-900/20',
    warning: 'border-yellow-400/30 bg-yellow-900/20',
    info: 'border-blue-400/30 bg-blue-900/20'
  };

  const handleRemove = () => {
    onRemove(toast.id);
  };

  return (
    <div 
      className={`sc-panel ${colors[toast.type]} flex items-start gap-3 p-4 ${
        toast.isExiting 
          ? 'animate-slide-out-to-right' 
          : 'animate-slide-in-from-right'
      }`}
      style={{ 
        animationDelay: toast.isExiting ? '0ms' : `${index * 50}ms` 
      }}
      role="alert"
      suppressHydrationWarning
    >
      {icons[toast.type]}
      <div className="flex-1 text-sm">{toast.message}</div>
      <button
        onClick={handleRemove}
        className="text-white/60 hover:text-white transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:ring-offset-2 focus:ring-offset-transparent rounded"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

