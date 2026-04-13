import { useState, useEffect } from 'react'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Spinner from 'react-bootstrap/Spinner'
import Alert from 'react-bootstrap/Alert'
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
  setTimeout(() => {
    setWorks(mockWorks)
    setLoading(false)
  }, 0)
  return
}
    fetch('/api/works')
      .then((r) => {
        if (!r.ok) throw new Error('Ошибка загрузки')
        return r.json()
      })
      .then((data: Work[]) => {
        setWorks(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  const workTypes = [...new Set(works.map((w) => w.worktype).filter(Boolean))]

  const filtered = works.filter((w) => {
    const matchSearch = w.name.toLowerCase().includes(search.toLowerCase())
    const matchMin = minPrice === '' || w.pricerub >= Number(minPrice)
    const matchMax = maxPrice === '' || w.pricerub <= Number(maxPrice)
    const matchType = workType === '' || w.worktype === workType
    return matchSearch && matchMin && matchMax && matchType
  })

  const handleReset = () => {
    setSearch('')
    setMinPrice('')
    setMaxPrice('')
    setWorkType('')
  }

  return (
    <Container className="py-4">
      <Breadcrumbs items={[{ label: 'Главная', path: '/' }, { label: 'Услуги' }]} />
      <h1 className="mb-4">Услуги издательства</h1>

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
        onReset={handleReset}
      />

      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      )}

      {error && <Alert variant="danger">{error}</Alert>}

      {!loading && !error && filtered.length === 0 && (
        <Alert variant="info">Услуги не найдены. Попробуйте изменить фильтры.</Alert>
      )}

      <Row xs={1} sm={2} md={3} lg={4} className="g-4">
        {filtered.map((work) => (
          <Col key={work.id}>
            <WorkCard work={work} />
          </Col>
        ))}
      </Row>
    </Container>
  )
}