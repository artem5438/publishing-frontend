import { useNavigate } from 'react-router-dom'
import type { Work } from '../types'

interface WorkCardProps {
  work: Work
}

export default function WorkCard({ work }: WorkCardProps) {
  const navigate = useNavigate()
  const imageUrl = work.image_url || null
  // Отображаем карточку услуги
  return (
    <div
      className="work-card-custom"
      onClick={() => navigate(`/works/${work.id}`)}
      style={{ cursor: 'pointer' }}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={work.name}
          className="card-img-top"
          onError={(e) => {
            const el = e.target as HTMLImageElement
            el.style.display = 'none'
            el.nextElementSibling?.removeAttribute('style')
          }}
        />
      ) : null}
      <div
        className="work-card-img-placeholder"
        style={imageUrl ? { display: 'none' } : {}}
      >
        нет фото
      </div>

      <div className="card-body">
        <div className="card-title">{work.name}</div>
        <div className="work-card-footer-custom">
          <span className="work-card-price">{work.price_rub.toLocaleString()} ₽</span>
          <button
            className="btn-detail-custom"
            onClick={(e) => { e.stopPropagation(); navigate(`/works/${work.id}`) }}
          >
            Подробнее
          </button>
        </div>
      </div>
    </div>
  )
}