'use client';

import { useEffect } from 'react';
import NavIcon from './NavIcon';

export default function SlidePanel({ open, onClose, title, subtitle, children, footer, width }) {
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  return (
    <>
      <div className={'slide-backdrop' + (open ? ' open' : '')} onClick={onClose} />
      <div className={'slide-panel' + (open ? ' open' : '')} style={width ? { width } : undefined} role="dialog" aria-modal="true" aria-label={title}>
        <div className="slide-hd">
          <div className="slide-hd-text">
            <div className="slide-title">{title}</div>
            {subtitle && <div className="slide-subtitle">{subtitle}</div>}
          </div>
          <button type="button" className="slide-close" onClick={onClose} aria-label="Close">
            <NavIcon type="x" />
          </button>
        </div>
        <div className="slide-body">{open ? children : null}</div>
        {footer && <div className="slide-ft">{footer}</div>}
      </div>
    </>
  );
}
