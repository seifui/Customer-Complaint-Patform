'use client';

import { useEffect } from 'react';
import NavIcon from './NavIcon';

export default function Modal({ open, onClose, title, children, footer, width }) {
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="modal-backdrop open" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={width ? { width } : undefined} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-hd">
          <div className="modal-title">{title}</div>
          <button type="button" className="slide-close" onClick={onClose} aria-label="Close">
            <NavIcon type="x" />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-ft">{footer}</div>}
      </div>
    </div>
  );
}
