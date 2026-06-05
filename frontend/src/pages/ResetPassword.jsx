import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/client';

const GREEN = '#2f6b12';
const DARK = '#153308';
const LIGHT = '#f3f8ec';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();

    setError('');
    setMessage('');

    if (!token) {
      setError('Token не найден');
      return;
    }

    if (newPassword.length < 6) {
      setError('Пароль должен быть минимум 6 символов');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/reset-password', {
        token,
        newPassword,
      });

      setMessage('Пароль успешно изменён. Сейчас можно войти.');
      setTimeout(() => navigate('/login'), 1600);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Ошибка при смене пароля');
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
          Новый пароль
        </h1>

        <p style={{ color: '#6b7280', marginTop: 10, marginBottom: 28 }}>
          Введите новый пароль для аккаунта.
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
            }}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleReset} style={{ display: 'grid', gap: 16 }}>
          <div>
            <label style={label}>Новый пароль</label>
            <input
              style={input}
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Минимум 6 символов"
            />
          </div>

          <div>
            <label style={label}>Повторите пароль</label>
            <input
              style={input}
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Повторите новый пароль"
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
            {loading ? 'Сохраняем...' : 'Сменить пароль'}
          </button>
        </form>

        <div style={{ marginTop: 22, color: '#6b7280' }}>
          <Link to="/login" style={{ color: GREEN, fontWeight: 900 }}>
            Вернуться ко входу
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
