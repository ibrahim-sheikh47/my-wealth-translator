'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const AuthContext = createContext({});

// Dummy users database
const DUMMY_USERS = [
  { email: 'demo@wealth.com', password: 'demo123', name: 'Demo User' },
  { email: 'test@wealth.com', password: 'test123', name: 'Test User' },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check if user is logged in (from localStorage)
    const storedUser = localStorage.getItem('wealth_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // Redirect logic
    if (!loading) {
      const isAuthPage = pathname?.startsWith('/auth') || pathname === '/splash';

      if (!user && !isAuthPage) {
        // Not logged in and trying to access protected page
        router.replace('/splash');
      } else if (user && isAuthPage) {
        // Logged in but on auth page
        router.replace('/');
      }
    }
  }, [user, loading, pathname, router]);

  const login = (email, password) => {
    const foundUser = DUMMY_USERS.find(
      (u) => u.email === email && u.password === password
    );

    if (foundUser) {
      const userData = { email: foundUser.email, name: foundUser.name };
      setUser(userData);
      localStorage.setItem('wealth_user', JSON.stringify(userData));
      router.replace('/');
      return { success: true };
    }

    return { success: false, error: 'Invalid email or password' };
  };

  const signup = (email, password, name) => {
    // Check if user already exists
    const exists = DUMMY_USERS.find((u) => u.email === email);
    if (exists) {
      return { success: false, error: 'Email already registered' };
    }

    // In real app, you'd save to database
    // For now, just create the user in memory
    const newUser = { email, name };
    DUMMY_USERS.push({ email, password, name });

    setUser(newUser);
    localStorage.setItem('wealth_user', JSON.stringify(newUser));
    router.replace('/');
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('wealth_user');
    router.replace('/splash');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);