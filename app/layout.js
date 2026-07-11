import './globals.css';
import StoreSync from '@/components/StoreSync';

export const metadata = {
  title: 'ConcernHub',
  description: 'ConcernHub — Every Concern. One Place. Resolved. Capture, understand, connect, intervene, and measure.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500&family=Inter:wght@400;500;600;700;800&family=Source+Serif+4:opsz,wght@8..60,400;8..60,500;8..60,600;8..60,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <StoreSync />
        {children}
      </body>
    </html>
  );
}
