import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Button from 'react-bootstrap/Button'

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
  onReset: () => void
}

export default function FilterPanel({
  search,
  minPrice,
  maxPrice,
  workType,
  workTypes,
  onSearchChange,
  onMinPriceChange,
  onMaxPriceChange,
  onWorkTypeChange,
  onReset,
}: FilterPanelProps) {
  return (
    <div className="bg-light p-3 rounded mb-4">
      <Row className="g-3 align-items-end">
        <Col md={4}>
          <Form.Label className="fw-semibold">Поиск по названию</Form.Label>
          <Form.Control
            type="text"
            placeholder="Например: печать..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </Col>
        <Col md={2}>
          <Form.Label className="fw-semibold">Цена от (₽)</Form.Label>
          <Form.Control
            type="number"
            min={0}
            placeholder="0"
            value={minPrice}
            onChange={(e) => onMinPriceChange(e.target.value)}
          />
        </Col>
        <Col md={2}>
          <Form.Label className="fw-semibold">Цена до (₽)</Form.Label>
          <Form.Control
            type="number"
            min={0}
            placeholder="999999"
            value={maxPrice}
            onChange={(e) => onMaxPriceChange(e.target.value)}
          />
        </Col>
        <Col md={3}>
          <Form.Label className="fw-semibold">Тип услуги</Form.Label>
          <Form.Select
            value={workType}
            onChange={(e) => onWorkTypeChange(e.target.value)}
          >
            <option value="">Все типы</option>
            {workTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </Form.Select>
        </Col>
        <Col md={1}>
          <Button variant="outline-secondary" className="w-100" onClick={onReset}>
            Сброс
          </Button>
        </Col>
      </Row>
    </div>
  )
}