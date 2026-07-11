'use client';

import { useEffect, useRef, useState } from 'react';

export default function OverflowMenu({ items }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    function onDocMouseDown(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, [open]);

  return (
    <div className="overflow-menu" ref={ref} onClick={(e) => e.stopPropagation()}>
      <button type="button" className="overflow-menu-btn" onClick={() => setOpen((v) => !v)} aria-label="More actions" aria-haspopup="menu" aria-expanded={open}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
          <circle cx="3" cy="7" r="1.3" />
          <circle cx="7" cy="7" r="1.3" />
          <circle cx="11" cy="7" r="1.3" />
        </svg>
      </button>
      {open && (
        <div className="overflow-menu-drop" role="menu">
          {items.map((it, i) => (
            <div
              key={i}
              role="menuitem"
              className="overflow-menu-item"
              onClick={() => {
                setOpen(false);
                it.onClick();
              }}
            >
              {it.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
