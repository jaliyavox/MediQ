// Holds the logged-in provider (doctor or pharmacy) and their JWT.
// The token also lives in localStorage so a refresh does not log them out.
import { createContext, useContext, useEffect, useState } from 'react';
import { getMe } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem('mediq_token')) {
      setLoading(false);
      return;
    }
    getMe()
      .then(setProvider)
      .catch(() => localStorage.removeItem('mediq_token'))
      .finally(() => setLoading(false));
  }, []);

  const signIn = ({ token, provider }) => {
    localStorage.setItem('mediq_token', token);
    setProvider(provider);
  };

  const signOut = () => {
    localStorage.removeItem('mediq_token');
    setProvider(null);
  };

  const updateProvider = (updatedProvider) => setProvider(updatedProvider);

  return (
    <AuthContext.Provider value={{ provider, loading, signIn, signOut, updateProvider }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
