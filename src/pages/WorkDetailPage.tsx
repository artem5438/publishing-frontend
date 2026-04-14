import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Spinner } from 'react-bootstrap'
import Breadcrumbs from '../components/Breadcrumbs'
import { mockWorks } from '../mocks/works'
import type { Work } from '../types'

export default function WorkDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [work, setWork] = useState<Work | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [addStatus, setAddStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')

  useEffect(() => {
    fetch(`/api/works/${id}`)
      .then((r) => { if (!r.ok) throw new Error('Услуга не найдена'); return r.json() })
      .then((data: Work) => { setWork(data) })
      .catch(() => {
        const found = mockWorks.find((w) => w.id === Number(id))
        if (found) setWork(found)
        else setError('Услуга не найдена')
      })
      .finally(() => setLoading(false))
  }, [id])

  const handleAddToCart = () => {
    if (!work) return
    setAddStatus('loading')
    fetch('/api/publishing-orders/cart/works', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ work_id: work.id }),
    })
      .then((r) => {
        if (r.status === 409) throw new Error('already')
        if (!r.ok) throw new Error('error')
        return r.json()
      })
      .then(() => setAddStatus('ok'))
      .catch((err: Error) => {
        if (err.message === 'already') setAddStatus('ok')
        else setAddStatus('error')
      })
  }

  if (loading) return <div className="text-center py-5"><Spinner animation="border" /></div>
  if (error || !work) return <div className="mis-error py-5">{error || 'Не найдено'}</div>

  const imageUrl = work.image_url || null
  const tags = work.tags ?? []
  const btnLabel =
    addStatus === 'loading' ? 'Добавляем...' :
    addStatus === 'ok'      ? '✓ В корзине' :
    addStatus === 'error'   ? 'Ошибка, повторите' :
    'Добавить в корзину'

  return (
    <>
      <Breadcrumbs items={[
        { label: 'Главная', path: '/' },
        { label: 'Услуги', path: '/' },
        { label: work.name },
      ]} />

      <div className="detail-page-wrapper">
        <Link to="/" className="back-link">← Все работы</Link>

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

            <button
              className="btn-add-custom"
              onClick={handleAddToCart}
              disabled={addStatus === 'loading' || addStatus === 'ok'}
            >
              {btnLabel}
            </button>

            <table className="params-table-custom">
              <thead>
                <tr>
                  <th>Срок</th><th>Тираж</th><th>Единица</th><th>Формат</th>
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

        <div className="detail-lower">
          <h2>Преимущества услуги</h2>

          {tags.length > 0 && (
            <div className="tags-row">
              {tags.map((tag, i) => <span key={i} className="tag-item">{tag}</span>)}
            </div>
          )}

          <div className="description-tab">Описание</div>
          <div className="description-text">
            <strong>{work.name} — профессиональная работа издательства.</strong>
            <p>{work.description || 'Описание отсутствует'}</p>
          </div>
        </div>

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