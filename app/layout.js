import './globals.css';
import StoreSync from '@/components/StoreSync';
import { TooltipProvider } from '@/components/ui/tooltip';

export const metadata = {
  title: 'Concerns AI',
  description: 'Concerns AI — Capture, understand, connect, intervene, and measure every customer concern.',
};

const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem('ch-theme') === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', stored);
    document.documentElement.classList.toggle('dark', stored === 'dark');
  } catch (e) {}
})();
`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        <StoreSync />
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
