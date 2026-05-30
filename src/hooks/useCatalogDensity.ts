import { useCallback, useEffect, useState } from 'react'

export type CatalogDensity = 'comfortable' | 'compact'

const STORAGE_KEY = 'folio-catalog-density'

function readStoredDensity(): CatalogDensity {
  if (typeof window === 'undefined') return 'comfortable'
  const stored = window.localStorage.getItem(STORAGE_KEY)
  return stored === 'compact' ? 'compact' : 'comfortable'
}

function applyDensity(density: CatalogDensity) {
  document.documentElement.dataset.catalogDensity = density
}

export function useCatalogDensity() {
  const [density, setDensityState] = useState<CatalogDensity>(() => {
    const initial = readStoredDensity()
    applyDensity(initial)
    return initial
  })

  useEffect(() => {
    applyDensity(density)
    window.localStorage.setItem(STORAGE_KEY, density)
  }, [density])

  const toggleDensity = useCallback(() => {
    setDensityState((prev) => (prev === 'comfortable' ? 'compact' : 'comfortable'))
  }, [])

  const isCompact = density === 'compact'

  return { density, isCompact, toggleDensity }
}
