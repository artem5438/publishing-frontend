import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Spinner } from 'react-bootstrap'
import Breadcrumbs from '../components/Breadcrumbs'
import WorkCard from '../components/WorkCard'
import { getEmbedding, cosineSimilarity } from '../utils/similarity'
import type { Work } from '../types'
import { addWorkToDraftThunk } from '../store/orderSlice'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchWorkByIdThunk, fetchWorksThunk } from '../store/worksSlice'

export default function WorkDetailPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const user = useAppSelector((state) => state.auth.user)
  const work = useAppSelector((state) => state.works.currentWork)
  const works = useAppSelector((state) => state.works.items)
  const loading = useAppSelector((state) => state.works.detailsLoading)
  const error = useAppSelector((state) => state.works.error)
  const [addStatus, setAddStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle')
  const [similar, setSimilar] = useState<Work[] | null>(null)

  useEffect(() => {
    const numericId = Number(id)
    if (!Number.isFinite(numericId) || numericId <= 0) return
    void dispatch(fetchWorkByIdThunk(numericId))
    void dispatch(fetchWorksThunk({ search: '', minPrice: '', maxPrice: '', workType: '' }))
  }, [dispatch, id])

  useEffect(() => {
    if (!work) return
    const others = works.filter((item) => item.id !== work.id)
    if (!others.length) return

    let canceled = false
    const compute = async () => {
      const targetText = `${work.name} ${work.description ?? ''}`
      const targetEmb = await getEmbedding(targetText)

      const scored = await Promise.all(
        others.map(async (item) => ({
          work: item,
          score: cosineSimilarity(
            targetEmb,
            await getEmbedding(`${item.name} ${item.description ?? ''}`),
          ),
        })),
      )

      const top3 = scored
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map((item) => item.work)

      if (!canceled) setSimilar(top3)
    }

    void compute()
    return () => {
      canceled = true
    }
  }, [work, works])

  const similarLoading = useMemo(() => work !== null && similar === null, [similar, work])

  const handleAddToCart = async () => {
    if (!work) return
    if (!user) {
      navigate('/login')
      return
    }
    setAddStatus('loading')
    const result = await dispatch(addWorkToDraftThunk(work.id))
    setAddStatus(addWorkToDraftThunk.fulfilled.match(result) ? 'ok' : 'error')
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
        { label: 'Услуги', path: '/works' },
        { label: work.name },
      ]} />

      <div className="detail-page-wrapper">
        <Link to="/works" className="back-link">← Все работы</Link>

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

        {/* Преимущества */}
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

        {/* Похожие услуги */}
        <div className="similar-block">
          <h2>Похожие услуги</h2>
          {similarLoading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#999', fontSize: 14, marginBottom: 16 }}>
              <Spinner animation="border" size="sm" />
              Вычисляем похожие услуги...
            </div>
          )}
          {!similarLoading && similar && similar.length > 0 && (
            <div className="works-grid-custom">
              {similar.map(w => <WorkCard key={w.id} work={w} />)}
            </div>
          )}
        </div>

      </div>
    </>
  )
}