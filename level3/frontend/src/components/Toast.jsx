import { useEffect, useState } from 'react';

function Toast({ toast, onDismiss }) {
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (paused) return;

    const duration = 4000;
    const start = Date.now() - (100 - progress) * (duration / 100);

    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        onDismiss(toast.id);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [paused]);

  const icons = {
    created: '✓',
    updated: '↻',
    deleted: '✕',
  };

  return (
    <div
      className={`toast toast-${toast.type}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onClick={() => onDismiss(toast.id)}
      role="status"
    >
      <span className="toast-icon">{icons[toast.type] || '•'}</span>
      <span className="toast-text">{toast.message}</span>
      <button
        className="toast-close"
        onClick={(e) => { e.stopPropagation(); onDismiss(toast.id); }}
        aria-label="Fermer la notification"
      >
        ✕
      </button>
      <div className="toast-progress" style={{ width: `${progress}%` }} />
    </div>
  );
}

function ToastContainer({ toasts, onDismiss }) {
  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

export default ToastContainer;