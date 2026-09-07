import { useEffect, useState } from 'react'
import './ThemeToggle.css'

// Locked to the "iris" concept, picker removed. The other 3 concepts
// compared (reel3d, clapperboard, dial) were fully deleted, not kept in
// reserve — see CLAUDE.md's "Theme toggle" section for what each looked
// like.
//
// Each click sets data-theme on <html> (see the useEffect below), which
// actually switches the site's colors via the override blocks in index.css
// — all 3 themes are live.
//
// `dark` and `color`'s swatches here are deliberately NOT the real theme
// colors (`--color-theme-dark` #111111 near-black, `--color-theme-accent`
// #c9622f) — the toggle itself sits on top of those exact backgrounds once
// that theme is active (Information/Photography's page background becomes
// that same color), so filling the blades with the literal theme color
// would blend into its own background and disappear right when it's most
// relevant. Both are lightened versions, only for the toggle's own icon —
// the real site-wide theme colors in index.css are untouched.
const THEME_COLORS = {
  light: 'var(--color-cream)',
  dark: '#8a8a8a',
  color: '#f4a973',
}
const THEME_ORDER = ['light', 'dark', 'color']
const MODE_LABELS = {
  light: 'Light mode',
  dark: 'Dark mode',
  color: 'Color mode',
}
const IRIS_BLADE_ANGLES = [0, 60, 120, 180, 240, 300]

function ThemeToggle() {
  const [step, setStep] = useState(0)
  const [clickKey, setClickKey] = useState(0)
  const activeIndex = step % THEME_ORDER.length
  const activeTheme = THEME_ORDER[activeIndex]
  const nextTheme = THEME_ORDER[(activeIndex + 1) % THEME_ORDER.length]

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', activeTheme)
  }, [activeTheme])

  const handleClick = () => {
    setStep((s) => s + 1)
    setClickKey((k) => k + 1)
  }

  return (
    <button type="button" className="theme-toggle" onClick={handleClick} aria-label={`Switch to ${MODE_LABELS[nextTheme]}`}>
      <svg key={clickKey} className="theme-toggle__iris" width="40" height="40" viewBox="0 0 40 40">
        {IRIS_BLADE_ANGLES.map((angle) => (
          <polygon
            key={angle}
            className="theme-toggle__iris-blade"
            style={{ fill: THEME_COLORS[activeTheme] }}
            points="20,20 32,14 30,4"
            transform={`rotate(${angle} 20 20)`}
          />
        ))}
        <circle cx="20" cy="20" r="18" className="theme-toggle__iris-ring" style={{ stroke: THEME_COLORS[activeTheme] }} />
      </svg>
      {/* Hover-only tooltip naming what clicking does — the object alone
          doesn't obviously read as "this switches the site theme", but a
          permanent visible label would clutter the otherwise minimal chrome
          this project has consistently favored (see CustomCursor's "VIEW"
          hover-reveal for the same pattern elsewhere). */}
      <span className="theme-toggle__tooltip">{MODE_LABELS[nextTheme]}</span>
    </button>
  )
}

export default ThemeToggle
