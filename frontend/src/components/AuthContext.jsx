import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('sa_user');

    if (stored) {
      setUser(JSON.parse(stored));
    }

    setLoading(false);
  }, []);

  const login = async (username, password) => {
    let fakeUser = null;

    if (username === 'admin') {
      fakeUser = {
        id: 'admin-local',
        username: 'admin',
        full_name: 'Главный администратор',
        role: 'admin',
      };
    }

    if (username === 'judge1') {
      fakeUser = {
        id: 'judge1-local',
        username: 'judge1',
        full_name: 'Судья 1',
        role: 'judge',
      };
    }

    if (username === 'judge2') {
      fakeUser = {
        id: 'judge2-local',
        username: 'judge2',
        full_name: 'Судья 2',
        role: 'judge',
      };
    }

    if (!fakeUser) {
      throw new Error('Invalid username or password');
    }

    localStorage.setItem('sa_token', 'local-test-token');
    localStorage.setItem('sa_user', JSON.stringify(fakeUser));

    setUser(fakeUser);

    return fakeUser;
  };

  const logout = () => {
    localStorage.removeItem('sa_token');
    localStorage.removeItem('sa_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);