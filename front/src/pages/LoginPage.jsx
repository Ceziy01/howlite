import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import './Auth.css';
import Logo from '../components/Elements/Logo';
import PasswordInput from '../components/Elements/PasswordInput';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) { setError('Заполните все поля'); return; }
    setLoading(true);
    try {
      await login(form.username, form.password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      <div className="auth-card">
        <div className="auth-logo">
          <Logo size={48} font_size={25}/>
        </div>

        <p className="auth-subtitle">Войдите в свой аккаунт</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-label">Никнейм</label>
            <input
              className="auth-input"
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="username"
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">Пароль</label>
            <PasswordInput value={form.password} onChange={handleChange}/>
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <p className="auth-footer">
          Нет аккаунта?{' '}
          <Link to="/register" className="auth-link">Зарегистрироваться</Link>
        </p>
      </div>
    </div>
  );
}