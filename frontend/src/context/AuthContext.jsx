// OWNER: Member A
// Holds the logged-in doctor and their JWT. The token also lives in
// localStorage so a page refresh does not log the doctor out.
import { createContext, useContext, useEffect, useState } from 'react';
import { getMe } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem('mediq_token')) {
      setLoading(false);
      return;
    }
    getMe()
      .then(setDoctor)
      .catch(() => localStorage.removeItem('mediq_token'))
      .finally(() => setLoading(false));
  }, []);

  const login = ({ token, doctor }) => {
    localStorage.setItem('mediq_token', token);
    setDoctor(doctor);
  };

  const logout = () => {
    localStorage.removeItem('mediq_token');
    setDoctor(null);
  };

  return (
    <AuthContext.Provider value={{ doctor, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
