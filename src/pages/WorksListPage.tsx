import { useState, useEffect } from 'react'
import { Container, Spinner } from 'react-bootstrap'
import Breadcrumbs from '../components/Breadcrumbs'
import FilterPanel from '../components/FilterPanel'
import WorkCard from '../components/WorkCard'
import { mockWorks } from '../mocks/works'
import type { Work } from '../types'

interface Filters {
  search: string
  minPrice: string
  maxPrice: string
  workType: string
}

export default function WorksListPage() {
  const [works, setWorks]     = useState<Work[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  const [searchInput, setSearchInput]     = useState('')
  const [minPriceInput, setMinPriceInput] = useState('')
  const [maxPriceInput, setMaxPriceInput] = useState('')
  const [workTypeInput, setWorkTypeInput] = useState('')

  const [filters, setFilters] = useState<Filters>({
    search: '', minPrice: '', maxPrice: '', workType: ''
  })

  const workTypes = [...new Set(works.map(w => w.work_type).filter(Boolean))] as string[]

  useEffect(() => {
    const params = new URLSearchParams()
    if (filters.search)   params.append('query',    filters.search)
    if (filters.minPrice) params.append('minPrice', filters.minPrice)
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice)
    if (filters.workType) params.append('workType', filters.workType)

    const url = `/api/works${params.toString() ? '?' + params.toString() : ''}`

    fetch(url)
      .then(r => { if (!r.ok) throw new Error('Ошибка сервера'); return r.json() })
      .then((data: Work[]) => {
        setWorks(data)
        setError('')
        setLoading(false)
      })
      .catch(() => {
        const mocked = mockWorks.filter(w => {
          const matchSearch = !filters.search   || w.name.toLowerCase().includes(filters.search.toLowerCase())
          const matchMin    = !filters.minPrice || w.price_rub >= Number(filters.minPrice)
          const matchMax    = !filters.maxPrice || w.price_rub <= Number(filters.maxPrice)
          const matchType   = !filters.workType || w.work_type === filters.workType
          return matchSearch && matchMin && matchMax && matchType
        })
        setWorks(mocked)
        setError('')
        setLoading(false)
      })
  }, [filters])

  const handleApplyFilters = () => {
    setLoading(true)
    setFilters({
      search:   searchInput,
      minPrice: minPriceInput,
      maxPrice: maxPriceInput,
      workType: workTypeInput,
    })
  }

  const handleReset = () => {
    setLoading(true)
    setSearchInput('')
    setMinPriceInput('')
    setMaxPriceInput('')
    setWorkTypeInput('')
    setFilters({ search: '', minPrice: '', maxPrice: '', workType: '' })
  }

  return (
    <>
      <Breadcrumbs items={[{ label: 'Каталог услуг' }]} />
      <Container fluid className="px-5 py-4">
        <h1 className="works-page-title">Услуги издательства</h1>
        <FilterPanel
          search={searchInput}
          minPrice={minPriceInput}
          maxPrice={maxPriceInput}
          workType={workTypeInput}
          workTypes={workTypes}
          onSearchChange={setSearchInput}
          onMinPriceChange={setMinPriceInput}
          onMaxPriceChange={setMaxPriceInput}
          onWorkTypeChange={setWorkTypeInput}
          onApply={handleApplyFilters}
          onReset={handleReset}
        />
        {loading && (
          <div className="text-center py-5">
            <Spinner animation="border" />
          </div>
        )}
        {!loading && error && (
          <div className="mis-error">{error}</div>
        )}
        {!loading && !error && works.length === 0 && (
          <div className="mis-empty">Услуги не найдены. Попробуйте изменить фильтры.</div>
        )}
        {!loading && works.length > 0 && (
          <div className="works-grid-custom">
            {works.map(work => <WorkCard key={work.id} work={work} />)}
          </div>
        )}
      </Container>
    </>
  )
}