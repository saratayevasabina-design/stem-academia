import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';

const GREEN = '#2f6b12';
const DARK = '#153308';
const LIGHT = '#f3f8ec';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: '',
    username: '',
    email: '',
    password: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register(form);
      navigate('/results');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Ошибка при регистрации');
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
          Создать аккаунт
        </h1>

        <p style={{ color: '#6b7280', marginTop: 10, marginBottom: 28 }}>
          После регистрации аккаунт получит роль viewer. Доступ судьи или администратора выдаёт админ.
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

        <form onSubmit={handleRegister} style={{ display: 'grid', gap: 16 }}>
          <div>
            <label style={label}>Полное имя</label>
            <input
              style={input}
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              placeholder="Например: Sagi Alyonov"
            />
          </div>

          <div>
            <label style={label}>Username</label>
            <input
              style={input}
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="Например: sagi"
            />
          </div>

          <div>
            <label style={label}>Email</label>
            <input
              style={input}
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="example@email.com"
            />
          </div>

          <div>
            <label style={label}>Пароль</label>
            <input
              style={input}
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="Минимум 6 символов"
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
              marginTop: 6,
            }}
          >
            {loading ? 'Создаём...' : 'Зарегистрироваться'}
          </button>
        </form>

        <div style={{ marginTop: 22, color: '#6b7280' }}>
          Уже есть аккаунт?{' '}
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
