import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';

const GREEN = '#2f6b12';
const DARK = '#153308';
const LIGHT = '#f3f8ec';

export default function ForgotPassword() {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleForgot = async (e) => {
    e.preventDefault();

    setError('');
    setMessage('');
    setResetCode('');
    setLoading(true);

    try {
      const res = await api.post('/auth/forgot-password', {
        usernameOrEmail,
      });

      setMessage(res.data.message || 'Код создан');
      setResetCode(res.data.resetCode || '');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Ошибка при создании кода');
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
          Введите username или email. Сайт создаст одноразовый код для смены пароля.
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

        {message && (
          <div
            style={{
              background: '#e8f8ee',
              color: GREEN,
              padding: '14px 16px',
              borderRadius: 14,
              fontWeight: 800,
              marginBottom: 18,
              lineHeight: 1.5,
            }}
          >
            {message}
          </div>
        )}

        {resetCode && (
          <div
            style={{
              background: '#f8fbf4',
              border: '1px solid #dfe8d6',
              borderRadius: 18,
              padding: 22,
              marginBottom: 20,
              textAlign: 'center',
            }}
          >
            <div style={{ color: '#6b7280', fontWeight: 800 }}>
              Ваш код для сброса пароля:
            </div>

            <div
              style={{
                color: DARK,
                fontSize: 42,
                fontWeight: 900,
                letterSpacing: 8,
                marginTop: 12,
              }}
            >
              {resetCode}
            </div>

            <div style={{ color: '#6b7280', marginTop: 10 }}>
              Код действует 10 минут.
            </div>

            <Link
              to="/reset-password"
              style={{
                display: 'inline-block',
                marginTop: 18,
                background: GREEN,
                color: '#fff',
                padding: '13px 18px',
                borderRadius: 14,
                fontWeight: 900,
                textDecoration: 'none',
              }}
            >
              Перейти к смене пароля
            </Link>
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
            {loading ? 'Создаём...' : 'Создать код'}
          </button>
        </form>

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