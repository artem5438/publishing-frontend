import { useEffect, useMemo, useState } from 'react'
import { Container, Spinner } from 'react-bootstrap'
import Breadcrumbs from '../components/Breadcrumbs'
import FilterPanel from '../components/FilterPanel'
import WorkCard from '../components/WorkCard'
import { fetchWorksThunk, setWorksFilters } from '../store/worksSlice'
import { useAppDispatch, useAppSelector } from '../store/hooks'

export default function WorksListPage() {
  const dispatch = useAppDispatch()
  const { items: works, loading, error, filters } = useAppSelector((state) => state.works)

  const [searchInput, setSearchInput] = useState(filters.search)
  const [minPriceInput, setMinPriceInput] = useState(filters.minPrice)
  const [maxPriceInput, setMaxPriceInput] = useState(filters.maxPrice)
  const [workTypeInput, setWorkTypeInput] = useState(filters.workType)

  useEffect(() => {
    void dispatch(fetchWorksThunk(filters))
  }, [dispatch, filters])

  const workTypes = useMemo(
    () => [...new Set(works.map((work) => work.work_type).filter(Boolean))] as string[],
    [works],
  )

  const handleApplyFilters = () => {
    const nextFilters = {
      search: searchInput,
      minPrice: minPriceInput,
      maxPrice: maxPriceInput,
      workType: workTypeInput,
    }
    dispatch(setWorksFilters(nextFilters))
  }

  const handleReset = () => {
    setSearchInput('')
    setMinPriceInput('')
    setMaxPriceInput('')
    setWorkTypeInput('')
    dispatch(setWorksFilters({ search: '', minPrice: '', maxPrice: '', workType: '' }))
  }

  return (
    <>
      <Breadcrumbs items={[{ label: 'Главная', path: '/' }, { label: 'Каталог услуг' }]} />
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
        {!loading && error && <div className="mis-error">{error}</div>}
        {!loading && !error && works.length === 0 && (
          <div className="mis-empty">Услуги не найдены. Попробуйте изменить фильтры.</div>
        )}
        {!loading && works.length > 0 && (
          <div className="works-grid-custom">
            {works.map((work) => (
              <WorkCard key={work.id} work={work} />
            ))}
          </div>
        )}
      </Container>
    </>
  )
}
