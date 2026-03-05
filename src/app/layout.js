// app/layout.jsx  — replaces your existing layout
import { Inter }              from 'next/font/google';
import './globals.css';
import ReduxProvider from './store/provider';
import FirebaseAuthListener from './components/FirebaseAuthListener';
import ConditionalLayout from './components/ConditionalLayout';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title:       'My Wealth Translator',
  description: 'Translate your wealth with ease',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Redux wraps everything */}
        <ReduxProvider>
          {/* Syncs Firebase onAuthStateChanged → Redux (renders nothing) */}
          <FirebaseAuthListener />
          {/* Your existing conditional layout — now reads from Redux via useAuth hook */}
          <ConditionalLayout>{children}</ConditionalLayout>
        </ReduxProvider>
      </body>
    </html>
  );
}