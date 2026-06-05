import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

const GREEN = '#2f6b12';
const DARK = '#153308';
const LIGHT = '#f3f8ec';

export default function ForgotPassword() {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [resetLink, setResetLink] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleForgot = async (e) => {
    e.preventDefault();

    setError('');
    setResetLink('');
    setLoading(true);

    try {
      const res = await api.post('/auth/forgot-password', {
        usernameOrEmail,
      });

      setResetLink(res.data.resetLink);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Ошибка при создании ссылки');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: LIGHT, padding: '70px 20px' }}>
      <div
        style={{
          maxWidth: 620,
          margin: '0 auto',
          background: '#fff',
          borderRadius: 28,
          padding: 42,
          boxShadow: '0 25px 70px rgba(47,107,18,0.12)',
        }}
      >
        <h1 style={{ color: DARK, margin: 0, fontSize: 34, fontWeight: 900 }}>
          Восстановление пароля
        </h1>

        <p style={{ color: '#6b7280', marginTop: 10, marginBottom: 28 }}>
          Введите username или email. Система создаст ссылку для смены пароля.
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

        <form onSubmit={handleForgot} style={{ display: 'grid', gap: 16 }}>
          <div>
            <label style={label}>Username или email</label>
            <input
              style={input}
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              placeholder="Введите username или email"
            />
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
            }}
          >
            {loading ? 'Создаём...' : 'Создать ссылку'}
          </button>
        </form>

        {resetLink && (
          <div
            style={{
              marginTop: 24,
              background: '#f8fbf4',
              border: '1px solid #dfe8d6',
              borderRadius: 18,
              padding: 18,
            }}
          >
            <b style={{ color: DARK }}>Ссылка для сброса пароля:</b>

            <p style={{ color: '#6b7280', lineHeight: 1.5 }}>
              В реальном проекте эта ссылка отправляется на email. Сейчас для теста можно открыть её вручную:
            </p>

            <a
              href={resetLink}
              style={{
                color: GREEN,
                fontWeight: 900,
                wordBreak: 'break-all',
              }}
            >
              {resetLink}
            </a>
          </div>
        )}

        <div style={{ marginTop: 22, color: '#6b7280' }}>
          Вспомнили пароль?{' '}
          <Link to="/login" style={{ color: GREEN, fontWeight: 900 }}>
            Войти
          </Link>
        </div>
      </div>
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
