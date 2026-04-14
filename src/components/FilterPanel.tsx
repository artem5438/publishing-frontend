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
  onApply: () => void   // ← новый проп
  onReset: () => void
}

export default function FilterPanel({
  search, minPrice, maxPrice, workType, workTypes,
  onSearchChange, onMinPriceChange, onMaxPriceChange, onWorkTypeChange,
  onApply, onReset
}: FilterPanelProps) {
  return (
    <div className="mis-filter-panel">
      <div>
        <Form.Label>Поиск</Form.Label>
        <Form.Control
          type="text"
          placeholder="Название услуги..."
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && onApply()}
          style={{ width: 260 }}
        />
      </div>
      <div>
        <Form.Label>Цена от</Form.Label>
        <Form.Control
          type="number" min={0} placeholder="0"
          value={minPrice}
          onChange={e => onMinPriceChange(e.target.value)}
          style={{ width: 120 }}
        />
      </div>
      <div>
        <Form.Label>Цена до</Form.Label>
        <Form.Control
          type="number" min={0} placeholder="999999"
          value={maxPrice}
          onChange={e => onMaxPriceChange(e.target.value)}
          style={{ width: 120 }}
        />
      </div>
      <div>
        <Form.Label>Тип работы</Form.Label>
        <Form.Select
          value={workType}
          onChange={e => onWorkTypeChange(e.target.value)}
          style={{ width: 200 }}
        >
          <option value="">Все типы</option>
          {workTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </Form.Select>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
        <Button className="btn-reset-filter" onClick={onApply}>
          Найти
        </Button>
        <Button
          variant="outline-secondary"
          onClick={onReset}
          style={{ fontSize: 14, padding: '10px 16px', borderRadius: 4 }}
        >
          Сбросить
        </Button>
      </div>
    </div>
  )
}