'use client'; // Required in Next.js to enable React Context and browser APIs like localStorage

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

// TypeScript interfaces ensure strict type safety across the application,
// reducing runtime errors and improving code maintainability.
interface User {
  id: string;
  email: string;
  name?: string;
}

// Defines the shape of our global AuthContext. 
// This acts as a contract for what data and methods are available to consumers.
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  loginWithTokens: (accessToken: string, refreshToken: string, userData: User) => void;
  logout: () => void;
}

// Create the Context with default empty values. 
// These are overridden by the AuthProvider below.
export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: () => {},
  loginWithTokens: () => {},
  logout: () => {},
});

// The Provider component wraps our entire Next.js application (usually in layout.tsx)
// to make the authentication state globally accessible.
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Global state for the authenticated user and the initial loading phase
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Hydration Phase: When the app first loads, check if the user is already logged in.
  // We use useEffect to read from localStorage only on the client side.
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      // Restore the user session from memory so they don't get logged out on page refresh
      setUser(JSON.parse(savedUser));
    }
    // Mark loading as false so the application can render the protected routes or login page
    setIsLoading(false);
  }, []);

  // Standard login method for traditional email/password authentication
  const login = (token: string, userData: User) => {
    localStorage.setItem('accessToken', token);
    localStorage.setItem('user', JSON.stringify(userData)); // Serialize object to string for storage
    setUser(userData);
    router.push('/jobs'); // Programmatically redirect to the Daily Feed dashboard
  };

  // Specialized login method for OAuth flows (GitHub/Google) which provide both Access and Refresh tokens
  const loginWithTokens = (accessToken: string, refreshToken: string, userData: User) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    // Note: Routing is handled in the OAuthCallback component after this is called
  };

  // Securely end the session by wiping local state and clearing browser storage
  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login'); // Boot the user back to the authentication screen
  };

  // Memoize or bundle the values to be passed down the context tree
  const value = {
    user,
    isAuthenticated: !!user, // Double-bang explicitly casts the user object (or null) to a boolean
    isLoading,
    login,
    loginWithTokens,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom Hook: Abstraction to make consuming the context easier and safer in other components.
// Instead of importing useContext AND AuthContext everywhere, we just import useAuth().
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  // Fail-safe to alert developers if they try to use authentication outside the Provider boundary
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};