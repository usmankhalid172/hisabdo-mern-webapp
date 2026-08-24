'use client';

import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState({
    name: 'Muhammad Hamza Arif',
    email: 'hamza.merchant@hisabdo.com',
    shopName: 'Hamza Traders & Supplier Enterprise',
    role: 'Merchant Admin'
  });

  const [token, setToken] = useState('jwt-session-customer-vendor-crud');

  const [activeBranch, setActiveBranch] = useState({
    id: 'branch-1',
    name: 'Hamza Enterprise — Main Wholesale Branch',
    location: 'Hafeez Centre, Lahore',
    type: 'Electronics, Wholesale & Retail',
    cashBalance: 245000
  });

  const login = (email, password) => {
    setUser({
      name: email.split('@')[0].toUpperCase(),
      email: email,
      shopName: 'Hamza Retail Traders',
      role: 'Merchant Owner'
    });
    setToken('jwt-session-' + Date.now());
  };

  const logout = () => {
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!token,
      activeBranch,
      setActiveBranch,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
