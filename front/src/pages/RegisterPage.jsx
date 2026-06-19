import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import Logo from '../components/Elements/Logo';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.username || !form.password) { setError('Заполните все поля'); return; }
    if (form.password.length < 8) { setError('Пароль должен быть не менее 8 символов'); return; }
    if (!/^[a-zA-Z0-9_]+$/.test(form.username)) { setError('Никнейм: только латиница, цифры и _'); return; }
    setLoading(true);
    try {
      await register(form.name, form.username, form.password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Ошибка регистрации');
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
        <p className="auth-subtitle">Зарегистрируйтесь, чтобы начать</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-label">Имя</label>
            <input
              className="auth-input"
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Ваше имя"
              autoComplete="name"
              autoFocus
            />
          </div>

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
            />
          </div>

          <div className="auth-field">
            <label className="auth-label">Пароль</label>
            <input
              className="auth-input"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="не менее 8 символов"
              autoComplete="new-password"
            />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button className="auth-btn" type="submit" disabled={loading}>
            {loading ? 'Создание...' : 'Создать аккаунт'}
          </button>
        </form>

        <p className="auth-footer">
          Уже есть аккаунт?{' '}
          <Link to="/login" className="auth-link">Войти</Link>
        </p>
      </div>
    </div>
  );
}