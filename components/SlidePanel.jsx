'use client';

export default function SlidePanel({ open, onClose, title, children }) {
  return (
    <>
      <div className={'slide-backdrop' + (open ? ' open' : '')} onClick={onClose} />
      <div className={'slide-panel' + (open ? ' open' : '')}>
        <div className="slide-hd">
          <div className="slide-title">{title}</div>
          <div className="slide-close" onClick={onClose}>
            ✕
          </div>
        </div>
        <div className="slide-body">{open ? children : null}</div>
      </div>
    </>
  );
}
