import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Spinner } from 'react-bootstrap'
import Breadcrumbs from '../components/Breadcrumbs'
import ErrorAlert from '../components/ErrorAlert'
import WorkCard from '../components/WorkCard'
import type { Work } from '../types'
import { addWorkToDraftThunk, ALREADY_IN_DRAFT } from '../store/orderSlice'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { fetchWorkByIdThunk, fetchWorksThunk } from '../store/worksSlice'
import { IS_GUEST_MODE } from '../config/env'
import { IMAGE_FALLBACK, resolveSafeImageUrl, resolveSafeVideoUrl } from '../utils/media'

export default function WorkDetailPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const user = useAppSelector((state) => state.auth.user)
  const draftOrder = useAppSelector((state) => state.order.draftOrder)
  const work = useAppSelector((state) => state.works.currentWork)
  const works = useAppSelector((state) => state.works.items)
  const loading = useAppSelector((state) => state.works.detailsLoading)
  const error = useAppSelector((state) => state.works.error)
  const [addStatus, setAddStatus] = useState<'idle' | 'loading' | 'in_draft' | 'error'>('idle')
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
      try {
        const similarity = await import('../utils/similarity')
        const targetText = `${work.name} ${work.description ?? ''}`
        const targetEmb = await similarity.getEmbedding(targetText)

        const scored = await Promise.all(
          others.map(async (item) => ({
            work: item,
            score: similarity.cosineSimilarity(
              targetEmb,
              await similarity.getEmbedding(`${item.name} ${item.description ?? ''}`),
            ),
          })),
        )

        const top3 = scored
          .sort((a, b) => b.score - a.score)
          .slice(0, 3)
          .map((item) => item.work)

        if (!canceled) setSimilar(top3)
      } catch {
        // In desktop WebView environments ML model init can fail; keep UI usable.
        if (!canceled) setSimilar(others.slice(0, 3))
      }
    }

    void compute()
    return () => {
      canceled = true
    }
  }, [work, works])

  const similarLoading = useMemo(() => work !== null && similar === null, [similar, work])

  const isInDraftFromStore =
    work != null && (draftOrder?.works?.some((item) => item.work_id === work.id) ?? false)
  const showInCart = isInDraftFromStore || addStatus === 'in_draft'

  const handleAddToCart = async () => {
    if (!work) return
    if (!user) {
      navigate('/login')
      return
    }
    if (showInCart) return
    setAddStatus('loading')
    const result = await dispatch(addWorkToDraftThunk(work.id))
    if (addWorkToDraftThunk.fulfilled.match(result)) {
      setAddStatus('in_draft')
      return
    }
    if (addWorkToDraftThunk.rejected.match(result) && result.payload === ALREADY_IN_DRAFT) {
      setAddStatus('in_draft')
      return
    }
    setAddStatus('error')
  }

  if (loading) return <div className="text-center py-5"><Spinner animation="border" /></div>
  if (error || !work) {
    return <ErrorAlert variant="page" message={error || 'Не найдено'} />
  }

  const imageUrl = resolveSafeImageUrl(work.image_url)
  const videoUrl = resolveSafeVideoUrl(work.video_url)
  const tags = work.tags ?? []
  const btnLabel =
    addStatus === 'loading' ? 'Добавляем...' :
    showInCart              ? '✓ В корзине' :
    addStatus === 'error'   ? 'Не удалось добавить' :
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
            <img
              src={imageUrl}
              alt={work.name}
              className="detail-image-custom"
              loading="lazy"
              onError={(e) => {
                const el = e.target as HTMLImageElement
                if (el.src.includes('mock-media/work-cover.svg')) {
                  el.style.display = 'none'
                  el.nextElementSibling?.removeAttribute('style')
                  return
                }
                el.src = IMAGE_FALLBACK
              }}
            />
            <div className="detail-image-placeholder" style={{ display: 'none' }}>
              фото услуги
            </div>
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

            {!IS_GUEST_MODE && (
              <button
                className="btn-add-custom"
                onClick={handleAddToCart}
                disabled={addStatus === 'loading' || showInCart}
              >
                {btnLabel}
              </button>
            )}

            <div className="params-table-scroll">
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
          {videoUrl ? (
            <video autoPlay muted loop playsInline preload="metadata" poster={imageUrl}>
              <source src={videoUrl} type="video/mp4" />
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