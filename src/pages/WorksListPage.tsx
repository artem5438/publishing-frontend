import { useState, useEffect } from 'react'
import { Container, Spinner } from 'react-bootstrap'
import Breadcrumbs from '../components/Breadcrumbs'
import FilterPanel from '../components/FilterPanel'
import WorkCard from '../components/WorkCard'
import { mockWorks } from '../mocks/works'
import type { Work } from '../types'

const USE_MOCK = false

export default function WorksListPage() {
  const [works, setWorks] = useState<Work[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [workType, setWorkType] = useState('')

  useEffect(() => {
    if (USE_MOCK) {
      setTimeout(() => { setWorks(mockWorks); setLoading(false) }, 0)
      return
    }
    fetch('/api/works')
      .then((r) => { if (!r.ok) throw new Error('Ошибка загрузки'); return r.json() })
      .then((data: Work[]) => { setWorks(data); setLoading(false) })
      .catch((err: Error) => { setError(err.message); setLoading(false) })
  }, [])

  const workTypes = [...new Set(works.map((w) => w.work_type).filter(Boolean))]

  const filtered = works.filter((w) => {
    const matchSearch = w.name.toLowerCase().includes(search.toLowerCase())
    const matchMin = minPrice === '' || w.price_rub >= Number(minPrice)
    const matchMax = maxPrice === '' || w.price_rub <= Number(maxPrice)
    const matchType = workType === '' || w.work_type === workType
    return matchSearch && matchMin && matchMax && matchType
  })

  return (
    <>
      <Breadcrumbs items={[{ label: 'Главная', path: '/' }, { label: 'Услуги' }]} />
      <Container fluid className="px-5 py-4">
        <h1 className="works-page-title">Работы издательства</h1>

        <FilterPanel
          search={search}
          minPrice={minPrice}
          maxPrice={maxPrice}
          workType={workType}
          workTypes={workTypes}
          onSearchChange={setSearch}
          onMinPriceChange={setMinPrice}
          onMaxPriceChange={setMaxPrice}
          onWorkTypeChange={setWorkType}
          onReset={() => {
            setSearch('')
            setMinPrice('')
            setMaxPrice('')
            setWorkType('')
          }}
        />

        {loading && (
          <div className="text-center py-5"><Spinner animation="border" /></div>
        )}
        {error && <div className="mis-error">{error}</div>}
        {!loading && !error && filtered.length === 0 && (
          <div className="mis-empty">Услуги не найдены. Попробуйте изменить фильтры.</div>
        )}

        <div className="works-grid-custom">
          {filtered.map((work) => (
            <WorkCard key={work.id} work={work} />
          ))}
        </div>
      </Container>
    </>
  )
}