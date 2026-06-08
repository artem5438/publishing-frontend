import { useNavigate } from 'react-router-dom'
import type { Work } from '../types'
import { addWorkToDraftThunk, ALREADY_IN_DRAFT } from '../store/orderSlice'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { useState } from 'react'
import { IS_GUEST_MODE } from '../config/env'
import { IMAGE_FALLBACK, resolveSafeImageUrl } from '../utils/media'

interface WorkCardProps {
  work: Work
}

export default function WorkCard({ work }: WorkCardProps) {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const user = useAppSelector((state) => state.auth.user)
  const draftOrder = useAppSelector((state) => state.order.draftOrder)
  const imageUrl = resolveSafeImageUrl(work.image_url)
  const [addState, setAddState] = useState<'idle' | 'loading' | 'in_draft' | 'error'>('idle')

  const isInDraftFromStore =
    draftOrder?.works?.some((item) => item.work_id === work.id) ?? false
  const showInDraft = isInDraftFromStore || addState === 'in_draft'

  const handleAddToDraft = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    if (!user) {
      navigate('/login')
      return
    }
    if (showInDraft) return
    setAddState('loading')
    const result = await dispatch(addWorkToDraftThunk(work.id))
    if (addWorkToDraftThunk.fulfilled.match(result)) {
      setAddState('in_draft')
      return
    }
    if (addWorkToDraftThunk.rejected.match(result) && result.payload === ALREADY_IN_DRAFT) {
      setAddState('in_draft')
      return
    }
    setAddState('error')
  }

  const addBtnClass = [
    'mis-action-btn',
    'mis-action-btn--block',
    showInDraft ? 'mis-action-btn--in-draft' : '',
    addState === 'error' ? 'mis-action-btn--error' : '',
    addState === 'loading' ? 'mis-action-btn--loading' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const addBtnLabel =
    addState === 'loading'
      ? 'Добавляем...'
      : showInDraft
        ? 'В заявке'
        : addState === 'error'
          ? 'Не удалось'
          : 'Добавить'

  const handleGuestDetails = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    navigate(`/works/${work.id}`)
  }

  // Отображаем карточку услуги
  return (
    <div
      className="work-card-custom"
      onClick={() => navigate(`/works/${work.id}`)}
      style={{ cursor: 'pointer' }}
    >
      <img
        src={imageUrl}
        alt={work.name}
        className="card-img-top"
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
      <div className="work-card-img-placeholder" style={{ display: 'none' }}>
        нет фото
      </div>

      <div className="card-body">
        <div className="card-title">{work.name}</div>
        <div className="work-card-footer-custom">
          <span className="work-card-price">{work.price_rub.toLocaleString()} ₽</span>
          {IS_GUEST_MODE ? (
            <button
              type="button"
              className="mis-action-btn mis-action-btn--block"
              onClick={handleGuestDetails}
            >
              Подробнее
            </button>
          ) : (
            <button
              type="button"
              className={addBtnClass}
              onClick={handleAddToDraft}
              disabled={addState === 'loading' || showInDraft}
            >
              {addBtnLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}