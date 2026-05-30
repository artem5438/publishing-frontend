import { useCatalogDensity } from '../hooks/useCatalogDensity'

function IconComfortable() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <rect x="6" y="3" width="10" height="16" rx="1.5" stroke="#1C1C1C" strokeWidth="2" />
    </svg>
  )
}

function IconCompact() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" rx="1" stroke="#1C1C1C" strokeWidth="2" />
      <rect x="12" y="3" width="7" height="7" rx="1" stroke="#1C1C1C" strokeWidth="2" />
      <rect x="3" y="12" width="7" height="7" rx="1" stroke="#1C1C1C" strokeWidth="2" />
      <rect x="12" y="12" width="7" height="7" rx="1" stroke="#1C1C1C" strokeWidth="2" />
    </svg>
  )
}

export default function CatalogDensityToggle() {
  const { isCompact, toggleDensity } = useCatalogDensity()

  const label = isCompact
    ? 'Показать 1 карточку в ряд'
    : 'Показать 2 карточки в ряд'

  return (
    <button
      type="button"
      className={`mis-navbar-density-toggle${isCompact ? ' mis-navbar-density-toggle--active' : ''}`}
      onClick={toggleDensity}
      aria-label={label}
      aria-pressed={isCompact}
      title={label}
    >
      {isCompact ? <IconCompact /> : <IconComfortable />}
    </button>
  )
}
