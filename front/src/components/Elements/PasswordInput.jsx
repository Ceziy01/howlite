import { useState } from 'react'

import './PasswordInput.css'

export default function PasswordInput({ value, onChange }) {
    const [passwordVisibile, setPasswordVisible] = useState(false);

    return (
        <>
            <div className='input-wrapper'>
                <input
                    className="password-input"
                    type={passwordVisibile ? "text" : "password"}
                    name="password"
                    value={value}
                    onChange={onChange}
                    placeholder="••••••••"
                    autoComplete="current-password"
                />
                <button
                    type="button"
                    className="input-visibility-btn"
                    onClick={() => setPasswordVisible(prev => !prev)}
                    onBlur={() => setPasswordVisible(false)} //эта ёбень выполняется при мисклики вне поля ввода
                >
                    <span
                        className="material-icons-round md-icon-btn"
                        style={{ fontSize: '22px' }}
                    >
                        {passwordVisibile ? 'visibility_off' : 'visibility'}
                    </span>
                </button>
            </div>
        </>
    )
}