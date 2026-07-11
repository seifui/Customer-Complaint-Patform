'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';

function normalize(options) {
  return options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o));
}

export default function Select({ value, onChange, options, placeholder = 'Select…', variant = 'field', style }) {
  const opts = useMemo(() => normalize(options), [options]);
  const uid = useId();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const wrapRef = useRef(null);
  const triggerRef = useRef(null);
  const optionRefs = useRef([]);

  const selectedIndex = opts.findIndex((o) => o.value === value);
  const selected = selectedIndex >= 0 ? opts[selectedIndex] : null;

  useEffect(() => {
    if (!open) return undefined;
    function onDocMouseDown(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, [open]);

  useEffect(() => {
    if (open && optionRefs.current[activeIndex]) {
      optionRefs.current[activeIndex].scrollIntoView({ block: 'nearest' });
    }
  }, [activeIndex, open]);

  function openMenu() {
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    setOpen(true);
  }

  function selectAt(i) {
    const o = opts[i];
    if (!o) return;
    onChange(o.value);
    setOpen(false);
    triggerRef.current?.focus();
  }

  function onTriggerKeyDown(e) {
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        openMenu();
      }
      return;
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, opts.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        break;
      case 'Home':
        e.preventDefault();
        setActiveIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setActiveIndex(opts.length - 1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        selectAt(activeIndex);
        break;
      case 'Escape':
        e.preventDefault();
        setOpen(false);
        break;
      case 'Tab':
        setOpen(false);
        break;
      default:
        break;
    }
  }

  return (
    <div className={'sel-wrap' + (variant === 'field' ? ' sel-wrap-full' : '')} ref={wrapRef} style={style}>
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        className={'sel-trigger sel-trigger-' + variant}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={uid + '-listbox'}
        aria-activedescendant={open ? uid + '-opt-' + activeIndex : undefined}
        onClick={() => (open ? setOpen(false) : openMenu())}
        onKeyDown={onTriggerKeyDown}
      >
        <span className={'sel-value' + (!selected ? ' sel-placeholder' : '')}>{selected ? selected.label : placeholder}</span>
        <svg className="sel-chevron" width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 3.2l4 4 4-4" />
        </svg>
      </button>

      {open && (
        <div className="sel-popover" role="listbox" id={uid + '-listbox'}>
          {opts.map((o, i) => {
            const isSel = o.value === value;
            return (
              <div
                key={o.value + '-' + i}
                id={uid + '-opt-' + i}
                role="option"
                aria-selected={isSel}
                ref={(el) => { optionRefs.current[i] = el; }}
                className={'sel-opt' + (isSel ? ' sel-opt-sel' : '') + (i === activeIndex ? ' sel-opt-active' : '')}
                onMouseEnter={() => setActiveIndex(i)}
                onClick={() => selectAt(i)}
              >
                <span className="sel-opt-label">{o.label}</span>
                {isSel && (
                  <svg className="sel-opt-check" width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2.5 7.2l3 3L11.5 3.8" />
                  </svg>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
