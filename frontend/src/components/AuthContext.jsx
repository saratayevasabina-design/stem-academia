import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMe = async () => {
      const token = localStorage.getItem('sa_token');

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get('/auth/me');
        setUser(res.data);
      } catch (err) {
        localStorage.removeItem('sa_token');
        localStorage.removeItem('sa_user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadMe();
  }, []);

  const login = async (username, password) => {
    const res = await api.post('/auth/login', {
      username,
      password,
    });

    localStorage.setItem('sa_token', res.data.token);
    localStorage.setItem('sa_user', JSON.stringify(res.data.user));

    setUser(res.data.user);

    return res.data.user;
  };

  const register = async (data) => {
    const res = await api.post('/auth/register', data);

    localStorage.setItem('sa_token', res.data.token);
    localStorage.setItem('sa_user', JSON.stringify(res.data.user));

    setUser(res.data.user);

    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem('sa_token');
    localStorage.removeItem('sa_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);