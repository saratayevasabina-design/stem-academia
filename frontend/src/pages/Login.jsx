import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { useLang } from '../components/LangContext';

const GREEN = '#2f6b12';
const DARK = '#153308';

export default function Login() {
  const { login } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();

  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const quickUsers = [
    ['admin', 'Admin123!', 'Главный администратор'],
    ['judge1', 'Judge123!', 'Судья 1'],
    ['judge2', 'Judge123!', 'Судья 2'],
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(form.username, form.password);
      navigate(user.role === 'judge' || user.role === 'admin' ? '/arena' : '/results');
    } catch (err) {
      setError(err.response?.data?.error || t.login.err || 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  const fillUser = (username, password) => {
    setForm({ username, password });
    setError('');
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 52px)',
        background: 'radial-gradient(circle at top left, #dff0d4 0%, transparent 35%), linear-gradient(135deg, #f7faf4 0%, #e8f4df 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.1fr 0.9fr',
          maxWidth: 980,
          width: '100%',
          background: '#fff',
          borderRadius: 32,
          overflow: 'hidden',
          border: '1px solid #e4ecd9',
          boxShadow: '0 30px 80px rgba(31, 77, 10, 0.16)',
        }}
      >
        <div
          style={{
            padding: 48,
            background: 'linear-gradient(135deg, #244f0d, #4f8f22)',
            color: '#fff',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ fontSize: 110, opacity: 0.15, position: 'absolute', right: 28, bottom: 16 }}>
            🏆
          </div>

          <div
            style={{
              width: 56,
              height: 56,
              background: 'rgba(255,255,255,0.18)',
              border: '1px solid rgba(255,255,255,0.25)',
              borderRadius: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              fontWeight: 800,
              marginBottom: 26,
            }}
          >
            S
          </div>

          <h1 style={{ fontSize: 42, lineHeight: 1.1, margin: '0 0 16px', letterSpacing: '-1px' }}>
            STEM Academia Platform
          </h1>

          <p style={{ fontSize: 16, lineHeight: 1.7, opacity: 0.9, maxWidth: 420 }}>
            Современная платформа для олимпиад: арена, судейство, результаты и управление турниром.
          </p>

          <div style={{ display: 'grid', gap: 12, marginTop: 34 }}>
            {['Live scoring', 'Admin dashboard', 'Results tracking'].map((item) => (
              <div
                key={item}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  background: 'rgba(255,255,255,0.12)',
                  border: '1px solid rgba(255,255,255,0.18)',
                  borderRadius: 14,
                  padding: '12px 14px',
                }}
              >
                <span>✓</span>
                <span style={{ fontWeight: 700 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: 48 }}>
          <h2 style={{ fontSize: 30, margin: '0 0 8px', color: DARK }}>
            {t.login.title}
          </h2>

          <p style={{ color: '#6b7280', margin: '0 0 28px', fontSize: 14 }}>
            {t.login.sub}
          </p>

          {error && (
            <div
              style={{
                background: '#fdecec',
                color: '#9f1239',
                border: '1px solid #fecdd3',
                padding: '12px 14px',
                borderRadius: 14,
                fontSize: 13,
                marginBottom: 18,
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: DARK, marginBottom: 8 }}>
              {t.login.user}
            </label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '1px solid #dfe8d6',
                borderRadius: 14,
                fontSize: 15,
                marginBottom: 18,
              }}
              placeholder="admin"
              required
            />

            <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: DARK, marginBottom: 8 }}>
              {t.login.pass}
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '1px solid #dfe8d6',
                borderRadius: 14,
                fontSize: 15,
                marginBottom: 10,
              }}
              placeholder="••••••••"
              required
            />

            <div style={{ color: GREEN, fontSize: 13, fontWeight: 700, marginBottom: 22 }}>
              {t.login.forgot}
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: 15,
                background: GREEN,
                color: '#fff',
                border: 'none',
                borderRadius: 15,
                fontSize: 16,
                fontWeight: 800,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.75 : 1,
                boxShadow: '0 14px 30px rgba(47, 107, 18, 0.22)',
              }}
            >
              {loading ? 'Загрузка...' : t.login.btn}
            </button>
          </form>

          <div style={{ marginTop: 26 }}>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 10 }}>
              Быстрый вход:
            </p>

            <div style={{ display: 'grid', gap: 8 }}>
              {quickUsers.map(([username, password, label]) => (
                <button
                  key={username}
                  type="button"
                  onClick={() => fillUser(username, password)}
                  style={{
                    padding: '10px 12px',
                    background: '#f0f7ec',
                    color: DARK,
                    border: '1px solid #dcebd1',
                    borderRadius: 12,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  {label}: {username}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}