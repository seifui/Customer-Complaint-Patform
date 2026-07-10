export default function NavIcon({ type }) {
  const common = { viewBox: '0 0 14 14', fill: 'none', stroke: 'currentColor', strokeWidth: '1.4' };
  switch (type) {
    case 'rects':
      return (
        <svg {...common}>
          <rect x="1" y="1" width="5" height="5" rx=".5" />
          <rect x="8" y="1" width="5" height="5" rx=".5" />
          <rect x="1" y="8" width="5" height="5" rx=".5" />
          <rect x="8" y="8" width="5" height="5" rx=".5" />
        </svg>
      );
    case 'path':
      return (
        <svg {...common}>
          <path d="M7 1v12M1 7h12" />
        </svg>
      );
    case 'queue':
      return (
        <svg {...common}>
          <rect x="1" y="1" width="12" height="3" rx=".5" />
          <rect x="1" y="6" width="12" height="3" rx=".5" />
          <rect x="1" y="11" width="7" height="2" rx=".5" />
        </svg>
      );
    case 'inbox':
      return (
        <svg {...common}>
          <rect x="1" y="2" width="12" height="10" rx="1" />
          <path d="M4 2V1M10 2V1M1 6h12" />
        </svg>
      );
    case 'target':
      return (
        <svg {...common}>
          <circle cx="7" cy="7" r="5.5" />
          <path d="M7 4.2v3.2l2 1.6" />
        </svg>
      );
    case 'check':
      return (
        <svg {...common}>
          <path d="M2 7l3.5 3.5L12 3.5" />
        </svg>
      );
    case 'bell':
      return (
        <svg width="15" height="15" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4">
          <path d="M7 1.5a4.5 4.5 0 00-4.5 4.5v3l-1 2h11l-1-2V6A4.5 4.5 0 007 1.5zM5.5 12a1.5 1.5 0 003 0" />
        </svg>
      );
    case 'chevron-down':
      return (
        <svg width="10" height="10" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M3 5l4 4 4-4" />
        </svg>
      );
    default:
      return null;
  }
}
