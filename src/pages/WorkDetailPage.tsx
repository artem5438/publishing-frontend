import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Spinner } from 'react-bootstrap'
import Breadcrumbs from '../components/Breadcrumbs'
import { mockWorks } from '../mocks/works'
import type { Work } from '../types'

const USE_MOCK = false
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
      .then((r) => { if (!r.ok) throw new Error('Услуга не найдена'); return r.json() })
      .then((data: Work) => { setWork(data); setLoading(false) })
      .catch((err: Error) => { setError(err.message); setLoading(false) })
  }, [id])

  if (loading) {
    return <div className="text-center py-5"><Spinner animation="border" /></div>
  }
  if (error || !work) {
    return <div className="mis-error py-5">{error || 'Не найдено'}</div>
  }

  const imageUrl = work.image_url || null
  const tags = work.tags ?? []

  return (
    <>
      <Breadcrumbs items={[
        { label: 'Главная', path: '/' },
        { label: 'Услуги', path: '/' },
        { label: work.name },
      ]} />

      <div className="detail-page-wrapper">
        <Link to="/" className="back-link">← Все работы</Link>

        {/* Основная карточка */}
        <div className="detail-card-custom">
          <div>
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={work.name}
                className="detail-image-custom"
                onError={(e) => {
                  const el = e.target as HTMLImageElement
                  el.style.display = 'none'
                  el.nextElementSibling?.removeAttribute('style')
                }}
              />
            ) : (
              <div className="detail-image-placeholder">фото услуги</div>
            )}
          </div>

          <div className="detail-info">
            <h1>{work.name}</h1>
            <p className="detail-work-type">{work.work_type}</p>

            {work.description && (
              <p style={{ fontSize: '14px', color: '#444', lineHeight: '1.7', marginBottom: '20px' }}>
                {work.description}
              </p>
            )}

            <div className="price-row-custom">
              <span className="price-label">Стоимость</span>
              <span className="price-value">{work.price_rub.toLocaleString()} ₽</span>
            </div>

            <button className="btn-add-custom">Добавить в корзину</button>

            <table className="params-table-custom">
              <thead>
                <tr>
                  <th>Срок</th>
                  <th>Тираж</th>
                  <th>Единица</th>
                  <th>Формат</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{work.param_deadline || '—'}</td>
                  <td>{work.param_quantity || '—'}</td>
                  <td>{work.param_unit || '—'}</td>
                  <td>{work.param_format || '—'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Преимущества */}
        <div className="detail-lower">
          <h2>Преимущества услуги</h2>

          {tags.length > 0 && (
            <div className="tags-row">
              {tags.map((tag, i) => (
                <span key={i} className="tag-item">{tag}</span>
              ))}
            </div>
          )}

          <div className="description-tab">Описание</div>
          <div className="description-text">
            <strong>{work.name} — профессиональная работа издательства.</strong>
            <p>{work.description || 'Описание отсутствует'}</p>
          </div>
        </div>

        {/* Видео */}
        <div className="video-block">
          <h3>Видео о работе</h3>
          {work.video_url ? (
            <video autoPlay muted loop playsInline>
              <source src={work.video_url} type="video/mp4" />
            </video>
          ) : (
            <div className="video-placeholder">[ВИДЕО: ПРОЦЕСС ПЕЧАТИ]</div>
          )}
        </div>
      </div>
    </>
  )
}