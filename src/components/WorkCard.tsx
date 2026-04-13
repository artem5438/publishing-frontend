import { useNavigate } from 'react-router-dom'
import Card from 'react-bootstrap/Card'
import Button from 'react-bootstrap/Button'
import Badge from 'react-bootstrap/Badge'
import type { Work } from '../types'

const DEFAULT_IMAGE = 'https://placehold.co/400x260?text=Нет+фото'
const MINIO_URL = 'http://localhost:9000/publishing-media/'

interface WorkCardProps {
  work: Work
}

export default function WorkCard({ work }: WorkCardProps) {
  const navigate = useNavigate()
  const imageUrl = work.image_key ? MINIO_URL + work.image_key : DEFAULT_IMAGE
  const tags = [work.tag1, work.tag2, work.tag3].filter(Boolean)

  return (
    <Card className="h-100 shadow-sm">
      <Card.Img
        variant="top"
        src={imageUrl}
        alt={work.name}
        style={{ height: '200px', objectFit: 'cover' }}
        onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_IMAGE }}
      />
      <Card.Body className="d-flex flex-column">
        <Card.Title>{work.name}</Card.Title>
        <Card.Text className="text-muted small flex-grow-1">
          {work.description
            ? work.description.slice(0, 100) + (work.description.length > 100 ? '...' : '')
            : 'Описание отсутствует'}
        </Card.Text>
        <div className="mb-2">
          {tags.map((tag, i) => (
            <Badge key={i} bg="secondary" className="me-1">{tag}</Badge>
          ))}
        </div>
        <div className="d-flex justify-content-between align-items-center mt-auto">
          <span className="fw-bold fs-5">{work.price_rub.toLocaleString()} ₽</span>
          <Button
            variant="outline-dark"
            size="sm"
            onClick={() => navigate(`/works/${work.id}`)}
          >
            Подробнее
          </Button>
        </div>
      </Card.Body>
    </Card>
  )
}