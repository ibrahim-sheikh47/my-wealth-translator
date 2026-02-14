import { Inter } from 'next/font/google';
import { AuthProvider } from './context/AuthContext';
import ConditionalLayout from './components/ConditionalLayout';
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
        <AuthProvider>
          <ConditionalLayout>{children}</ConditionalLayout>
        </AuthProvider>
      </body>
    </html>
  );
}