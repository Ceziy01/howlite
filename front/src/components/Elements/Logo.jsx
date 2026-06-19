import './Logo.css'
import LogoIcon from '../../assets/logo.svg?react'

export default function Logo({ shadow = true, text = true, size = 32, font_size = 18}) {
    return (
        <>
            <span className={`topbar-logo ${shadow ? "has-shadow" : ""}`} style={{width: `${size}px`, height: `${size}px`}}>
                <LogoIcon />
            </span>
            {text && <span className="topbar-title" style={{fontSize: `${font_size}px`}}>Howlite</span>}
        </>
    )
}