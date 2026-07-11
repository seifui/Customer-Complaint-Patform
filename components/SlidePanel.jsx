'use client';

export default function SlidePanel({ open, onClose, title, children, footer, width }) {
  return (
    <>
      <div className={'slide-backdrop' + (open ? ' open' : '')} onClick={onClose} />
      <div className={'slide-panel' + (open ? ' open' : '')} style={width ? { width } : undefined}>
        <div className="slide-hd">
          <div className="slide-title">{title}</div>
          <div className="slide-close" onClick={onClose}>
            ✕
          </div>
        </div>
        <div className="slide-body">{open ? children : null}</div>
        {footer && <div className="slide-ft">{footer}</div>}
      </div>
    </>
  );
}
