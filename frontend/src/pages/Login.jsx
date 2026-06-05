import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';

const GREEN = '#2f6b12';
const DARK = '#153308';
const LIGHT = '#f3f8ec';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(form.username, form.password);

      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'judge') {
        navigate('/arena');
      } else {
        navigate('/results');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Ошибка при входе');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: LIGHT, padding: '70px 20px' }}>
      <div
        style={{
          maxWidth: 1080,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          background: '#fff',
          borderRadius: 30,
          overflow: 'hidden',
          boxShadow: '0 25px 70px rgba(47,107,18,0.15)',
        }}
      >
        <section
          style={{
            background: GREEN,
            color: '#fff',
            padding: '70px 55px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              background: 'rgba(255,255,255,0.16)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 30,
              fontWeight: 900,
              marginBottom: 28,
            }}
          >
            S
          </div>

          <h1 style={{ fontSize: 42, margin: 0, fontWeight: 900 }}>
            STEM Academia Platform
          </h1>

          <p style={{ fontSize: 18, lineHeight: 1.6, opacity: 0.9, marginTop: 22 }}>
            Современная платформа для олимпиад: арена, судейство, результаты и управление турниром.
          </p>

          <div style={{ display: 'grid', gap: 12, marginTop: 35 }}>
            <Feature text="Безопасный вход" />
            <Feature text="Роли: администратор, судья, участник" />
            <Feature text="PDF-протокол и результаты" />
          </div>
        </section>

        <section
          style={{
            padding: '70px 55px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <h2 style={{ color: DARK, fontSize: 34, margin: 0, fontWeight: 900 }}>
            Вход в систему
          </h2>

          <p style={{ color: '#6b7280', marginTop: 10, marginBottom: 30 }}>
            Введите username/email и пароль
          </p>

          {error && (
            <div
              style={{
                background: '#fde8e8',
                color: '#991b1b',
                padding: '14px 16px',
                borderRadius: 14,
                fontWeight: 800,
                marginBottom: 18,
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'grid', gap: 18 }}>
            <div>
              <label style={label}>Username или email</label>
              <input
                style={input}
                value={form.username}
                onChange={(e) =>
                  setForm({ ...form, username: e.target.value })
                }
                placeholder="Введите username или email"
              />
            </div>

            <div>
              <label style={label}>Пароль</label>
              <input
                style={input}
                type="password"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                placeholder="Введите пароль"
              />
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 12,
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              <Link
                to="/forgot-password"
                style={{
                  color: GREEN,
                  fontWeight: 800,
                  textDecoration: 'none',
                }}
              >
                Забыли пароль?
              </Link>

              <Link
                to="/register"
                style={{
                  color: GREEN,
                  fontWeight: 800,
                  textDecoration: 'none',
                }}
              >
                Создать аккаунт
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                background: GREEN,
                color: '#fff',
                border: 'none',
                borderRadius: 16,
                padding: '16px 20px',
                fontSize: 16,
                fontWeight: 900,
                cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: 8,
              }}
            >
              {loading ? 'Входим...' : 'Войти'}
            </button>
          </form>

          <div
            style={{
              marginTop: 25,
              background: '#f8fbf4',
              border: '1px solid #e5eadf',
              borderRadius: 16,
              padding: 16,
              color: '#4b5563',
              fontSize: 14,
              lineHeight: 1.5,
            }}
          >
            Новый пользователь после регистрации получает роль <b>viewer</b>.  
            Доступ судьи или администратора выдаёт только главный администратор.
          </div>
        </section>
      </div>
    </div>
  );
}

function Feature({ text }) {
  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.14)',
        border: '1px solid rgba(255,255,255,0.18)',
        borderRadius: 16,
        padding: '14px 16px',
        fontWeight: 800,
      }}
    >
      ✓ {text}
    </div>
  );
}

const label = {
  display: 'block',
  color: DARK,
  fontWeight: 800,
  marginBottom: 8,
};

const input = {
  width: '100%',
  padding: '15px 16px',
  borderRadius: 14,
  border: '1px solid #dfe8d6',
  outline: 'none',
  fontSize: 15,
  boxSizing: 'border-box',
};