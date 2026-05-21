import { Form, Button } from 'react-bootstrap'

interface FilterPanelProps {
  search: string
  minPrice: string
  maxPrice: string
  workType: string
  workTypes: string[]
  onSearchChange: (val: string) => void
  onMinPriceChange: (val: string) => void
  onMaxPriceChange: (val: string) => void
  onWorkTypeChange: (val: string) => void
  onApply: () => void   
  onReset: () => void
}
  // Фильтры для поиска услуг
export default function FilterPanel({
  search, minPrice, maxPrice, workType, workTypes,
  onSearchChange, onMinPriceChange, onMaxPriceChange, onWorkTypeChange,
  onApply, onReset
}: FilterPanelProps) {
  return (
    <div className="mis-filter-panel">
      <div className="mis-filter-field mis-filter-field-search">
        <Form.Label>Поиск</Form.Label>
        <Form.Control
          type="text"
          placeholder="Название услуги..."
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onApply()}
        />
      </div>
      <div className="mis-filter-field mis-filter-field-price">
        <Form.Label>Цена от</Form.Label>
        <Form.Control
          type="number" min={0} placeholder="0"
          value={minPrice}
          onChange={e => onMinPriceChange(e.target.value)}
        />
      </div>
      <div className="mis-filter-field mis-filter-field-price">
        <Form.Label>Цена до</Form.Label>
        <Form.Control
          type="number" min={0} placeholder="999999"
          value={maxPrice}
          onChange={e => onMaxPriceChange(e.target.value)}
        />
      </div>
      <div className="mis-filter-field mis-filter-field-type">
        <Form.Label>Тип работы</Form.Label>
        <Form.Select
          value={workType}
          onChange={e => onWorkTypeChange(e.target.value)}
        >
          <option value="">Все типы</option>
          {workTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </Form.Select>
      </div>
      <div className="mis-filter-actions">
        <Button className="btn-reset-filter" onClick={onApply}>
          Найти
        </Button>
        <Button
          className="btn-clear-filter"
          variant="outline-secondary"
          onClick={onReset}
        >
          Сбросить
        </Button>
      </div>
    </div>
  )
}