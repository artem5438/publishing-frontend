import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Badge from 'react-bootstrap/Badge'
import Spinner from 'react-bootstrap/Spinner'
import Alert from 'react-bootstrap/Alert'
import Table from 'react-bootstrap/Table'
import Breadcrumbs from '../components/Breadcrumbs'
import { mockWorks } from '../mocks/works'
import type { Work } from '../types'

const USE_MOCK = false
const DEFAULT_IMAGE = 'https://placehold.co/600x400?text=Нет+фото'
const MINIO_URL = 'http://localhost:9000/publishing-media/'

export default function WorkDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [work, setWork] = useState<Work | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (USE_MOCK) {
      setTimeout(() => {
        const found = mockWorks.find((w) => w.id === Number(id))
        if (found) setWork(found)
        else setError('Услуга не найдена')
        setLoading(false)
      }, 0)
      return
    }
    fetch(`/api/works/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error('Услуга не найдена')
        return r.json()
      })
      .then((data: Work) => {
        setWork(data)
        setLoading(false)
      })
      .catch((err: Error) => {
        setError(err.message)
        setLoading(false)
      })
  }, [id])

  if (loading) return <Container className="py-5 text-center"><Spinner animation="border" /></Container>
  if (error) return <Container className="py-4"><Alert variant="danger">{error}</Alert></Container>
  if (!work) return null

  const imageUrl = work.image_key ? MINIO_URL + work.image_key : DEFAULT_IMAGE
  const tags = [work.tag1, work.tag2, work.tag3].filter(Boolean)

  return (
    <Container className="py-4">
      <Breadcrumbs
        items={[
          { label: 'Главная', path: '/' },
          { label: 'Услуги', path: '/' },
          { label: work.name },
        ]}
      />
      <Row className="mt-3 g-4">
        <Col md={5}>
          <img
            src={imageUrl}
            alt={work.name}
            className="img-fluid rounded shadow-sm w-100"
            style={{ maxHeight: '400px', objectFit: 'cover' }}
            onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_IMAGE }}
          />
        </Col>
        <Col md={7}>
          <h2>{work.name}</h2>
          <p className="text-muted">{work.work_type}</p>
          <p>{work.description || 'Описание отсутствует'}</p>
          <div className="mb-3">
            {tags.map((tag, i) => (
              <Badge key={i} bg="secondary" className="me-1">{tag}</Badge>
            ))}
          </div>
          <h3 className="text-dark">{work.price_rub.toLocaleString()} ₽ / {work.unit}</h3>
          {(work.param_deadline || work.param_quantity || work.param_unit || work.param_format) && (
            <Table bordered size="sm" className="mt-3">
              <tbody>
                {work.param_deadline && <tr><td className="fw-semibold">Срок</td><td>{work.param_deadline}</td></tr>}
                {work.param_quantity && <tr><td className="fw-semibold">Объём</td><td>{work.param_quantity}</td></tr>}
                {work.param_unit && <tr><td className="fw-semibold">Единица</td><td>{work.param_unit}</td></tr>}
                {work.param_format && <tr><td className="fw-semibold">Формат</td><td>{work.param_format}</td></tr>}
              </tbody>
            </Table>
          )}
        </Col>
      </Row>
    </Container>
  )
}