import { X, Loader2 } from 'lucide-react';

// Modal component
export function Modal({ open, onClose, title, children, size = 'md' }) {
  if (!open) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-surface-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${sizes[size]} card p-0 shadow-xl animate-in`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100">
          <h2 className="font-display text-xl text-surface-900">{title}</h2>
          <button onClick={onClose} className="btn-ghost p-1.5 -mr-1.5">
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// Loading spinner
export function Spinner({ className = '' }) {
  return <Loader2 className={`animate-spin text-brand-500 ${className}`} size={24} />;
}

// Empty state
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-surface-100 flex items-center justify-center mb-4">
          <Icon size={24} className="text-surface-400" />
        </div>
      )}
      <h3 className="text-base font-semibold text-surface-700 mb-1">{title}</h3>
      {description && <p className="text-sm text-surface-400 mb-4 max-w-xs">{description}</p>}
      {action}
    </div>
  );
}

// Confirm dialog
export function ConfirmDialog({ open, onClose, onConfirm, title, message, confirmText = 'Delete', loading }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-surface-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm card p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-surface-900 mb-2">{title}</h3>
        <p className="text-sm text-surface-500 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="btn-secondary" disabled={loading}>Cancel</button>
          <button onClick={onConfirm} className="btn-danger" disabled={loading}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : null}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

// Toast notification (simple)
export function Toast({ message, type = 'success', onClose }) {
  if (!message) return null;

  const colors = {
    success: 'bg-green-50 text-green-800 border-green-200',
    error: 'bg-red-50 text-red-800 border-red-200',
    info: 'bg-brand-50 text-brand-800 border-brand-200',
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl border shadow-lg text-sm font-medium ${colors[type]} animate-in`}>
      {message}
    </div>
  );
}
