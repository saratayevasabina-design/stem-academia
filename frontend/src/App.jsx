import { BrowserRouter, Routes, Route, Navigate, Link, NavLink, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/AuthContext';
import { LangProvider, useLang } from './components/LangContext';

import Home from './pages/Home';
import Login from './pages/Login';
import Arena from './pages/Arena';
import Results from './pages/Results';
import Admin from './pages/Admin';
import Assistant from './pages/Assistant';
import FloatingAssistant from './components/FloatingAssistant';

const GREEN = '#2f6b12';

function Navbar() {
  const { user, logout } = useAuth();
  const { lang, setLang, t } = useLang();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navBtnStyle = {
    color: '#374151',
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: 600,
    padding: '8px 10px',
    borderRadius: 10,
  };

  return (
    <nav
      style={{
        background: '#fff',
        borderBottom: '1px solid #eee',
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        height: 52,
        justifyContent: 'space-between',
      }}
    >
      <Link
        to="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          textDecoration: 'none',
          color: 'inherit',
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            background: GREEN,
            borderRadius: 7,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 800,
          }}
        >
          S
        </div>

        <span style={{ fontSize: 15, fontWeight: 800 }}>
          {t.brand || 'STEM Academia'}
        </span>
      </Link>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <NavLink to="/" style={navBtnStyle}>
          {t.nav?.home || 'Главная'}
        </NavLink>

        <NavLink to="/results" style={navBtnStyle}>
          {t.nav?.results || 'Результаты'}
        </NavLink>

        <NavLink to="/assistant" style={navBtnStyle}>
          🤖 Помощник
        </NavLink>

        {(user?.role === 'judge' || user?.role === 'admin') && (
          <NavLink to="/arena" style={navBtnStyle}>
            {t.nav?.arena || 'Арена'}
          </NavLink>
        )}

        {user?.role === 'admin' && (
          <NavLink to="/admin" style={navBtnStyle}>
            Главный администратор
          </NavLink>
        )}

        {user ? (
          <>
            <span style={{ fontSize: 12, color: '#888', margin: '0 6px' }}>
              {user.full_name || user.username}
            </span>

            <button
              onClick={handleLogout}
              style={{
                background: GREEN,
                color: '#fff',
                border: 'none',
                padding: '8px 14px',
                borderRadius: 8,
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              {t.nav?.logout || 'Выйти'}
            </button>
          </>
        ) : (
          <Link
            to="/login"
            style={{
              ...navBtnStyle,
              background: GREEN,
              color: '#fff',
              padding: '8px 16px',
            }}
          >
            {t.nav?.login || 'Войти'}
          </Link>
        )}

        <div style={{ display: 'flex', gap: 2, marginLeft: 8 }}>
          {['ru', 'kz', 'en'].map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              style={{
                fontSize: 11,
                padding: '3px 7px',
                border: '1px solid #eee',
                borderRadius: 5,
                cursor: 'pointer',
                background: lang === l ? '#EAF3DE' : 'transparent',
                color: lang === l ? GREEN : '#888',
                fontWeight: lang === l ? 800 : 500,
              }}
            >
              {l.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" />;

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/results" />;
  }

  return children;
}

export default function App() {
  return (
    <LangProvider>
      <AuthProvider>
        <BrowserRouter>
          <Navbar />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/results" element={<Results />} />
            <Route path="/assistant" element={<Assistant />} />

            <Route
              path="/arena"
              element={
                <ProtectedRoute roles={['judge', 'admin']}>
                  <Arena />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute roles={['admin']}>
                  <Admin />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>

          <FloatingAssistant />
        </BrowserRouter>
      </AuthProvider>
    </LangProvider>
  );
}