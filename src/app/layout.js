import { Inter } from 'next/font/google';
import Sidebar from './components/Sidebar';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Wealth Translator',
  description: 'Translate your wealth with ease',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex min-h-screen" style={{ backgroundColor: '#1a1a1a' }}>
          {/* Sidebar - hidden on mobile, visible on desktop */}
          <Sidebar />

          {/* Main content area */}
          <main className="flex-1 pb-20 lg:pb-0 lg:ml-0">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}