import { Spinner } from 'react-bootstrap'
import {
  deleteWorkThunk,
  fetchAdminWorksThunk,
} from '../store/worksAdminSlice'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { resolveSafeImageUrl } from '../utils/media'
import type { Work } from '../types'

interface AdminWorksTabProps {
  onAdd: () => void
  onEdit: (work: Work) => void
}

export default function AdminWorksTab({ onAdd, onEdit }: AdminWorksTabProps) {
  const dispatch = useAppDispatch()
  const { works: adminWorks, loading: worksLoading, mutating: worksMutating, error: worksError } =
    useAppSelector((state) => state.worksAdmin)

  return (
    <div className="admin-works-section">
      <div className="admin-works-toolbar">
        <div>
          <p className="admin-works-toolbar-title">Каталог услуг</p>
          <p className="admin-works-toolbar-meta">
            {worksLoading ? 'Загрузка…' : `Активных услуг: ${adminWorks.length}`}
          </p>
        </div>
        <button type="button" className="btn-profile-filter" disabled={worksMutating} onClick={onAdd}>
          + Добавить услугу
        </button>
      </div>

      {worksLoading && (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      )}

      {!worksLoading && worksError && <div className="mis-error py-4">{worksError}</div>}

      {!worksLoading && !worksError && adminWorks.length === 0 && (
        <div className="mis-empty">Нет услуг. Добавьте первую услугу в каталог.</div>
      )}

      {!worksLoading && !worksError && adminWorks.length > 0 && (
        <div className="admin-works-list">
          {adminWorks.map((work) => (
            <div key={work.id} className="profile-order-card admin-work-card">
              <div className="admin-work-card-main">
                {work.image_url ? (
                  <img src={resolveSafeImageUrl(work.image_url)} alt={work.name} className="admin-work-thumb" />
                ) : (
                  <div className="admin-work-thumb-placeholder">нет фото</div>
                )}
                <div className="admin-work-body">
                  <div className="profile-order-header">
                    <span className="profile-order-id">№{work.id}</span>
                    {work.work_type && <span className="admin-work-type-badge">{work.work_type}</span>}
                  </div>
                  <h2 className="admin-work-name">{work.name}</h2>
                  <div className="profile-order-meta">
                    <span>Цена: {work.price_rub.toLocaleString('ru-RU')} ₽</span>
                    {work.unit && <span>Ед.: {work.unit}</span>}
                    {work.video_url && <span>Есть видео</span>}
                  </div>
                  {work.tags && work.tags.length > 0 && (
                    <div className="admin-work-tags">
                      {work.tags.map((tag) => (
                        <span key={tag} className="admin-work-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="profile-order-footer">
                <button
                  type="button"
                  className="btn-profile-reset"
                  disabled={worksMutating}
                  onClick={() => onEdit(work)}
                >
                  Изменить
                </button>
                <button
                  type="button"
                  className="btn-profile-danger"
                  disabled={worksMutating}
                  onClick={() => {
                    if (!window.confirm(`Удалить услугу «${work.name}»?`)) return
                    void dispatch(deleteWorkThunk(work.id)).then((result) => {
                      if (deleteWorkThunk.fulfilled.match(result)) {
                        void dispatch(fetchAdminWorksThunk())
                      }
                    })
                  }}
                >
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
