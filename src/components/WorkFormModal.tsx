import { useEffect, useState } from 'react'
import { Modal, Button, Form, Spinner } from 'react-bootstrap'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { createWorkThunk, updateWorkThunk } from '../store/worksAdminSlice'
import type { Work } from '../types'

interface WorkFormModalProps {
  show: boolean
  onHide: () => void
  work?: Work | null
  onSaved: () => void
}

const emptyForm = {
  name: '',
  priceRub: '',
  workType: '',
  unit: '',
  description: '',
  paramDeadline: '',
  paramQuantity: '',
  paramUnit: '',
  paramFormat: '',
  tag1: '',
  tag2: '',
  tag3: '',
}

export default function WorkFormModal({ show, onHide, work, onSaved }: WorkFormModalProps) {
  const dispatch = useAppDispatch()
  const { mutating, error } = useAppSelector((state) => state.worksAdmin)
  const isEdit = work != null

  const [form, setForm] = useState(emptyForm)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [removeImage, setRemoveImage] = useState(false)
  const [removeVideo, setRemoveVideo] = useState(false)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!show) return
    if (work) {
      setForm({
        name: work.name ?? '',
        priceRub: String(work.price_rub ?? ''),
        workType: work.work_type ?? '',
        unit: work.unit ?? '',
        description: work.description ?? '',
        paramDeadline: work.param_deadline ?? '',
        paramQuantity: work.param_quantity ?? '',
        paramUnit: work.param_unit ?? '',
        paramFormat: work.param_format ?? '',
        tag1: work.tags?.[0] ?? '',
        tag2: work.tags?.[1] ?? '',
        tag3: work.tags?.[2] ?? '',
      })
    } else {
      setForm(emptyForm)
    }
    setImageFile(null)
    setVideoFile(null)
    setRemoveImage(false)
    setRemoveVideo(false)
  }, [show, work])

  useEffect(() => {
    if (!imageFile) {
      setImagePreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(imageFile)
    setImagePreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [imageFile])

  const setField = (key: keyof typeof emptyForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const buildFormData = () => {
    const data = new FormData()
    data.append('name', form.name.trim())
    data.append('price_rub', form.priceRub.trim())
    data.append('description', form.description)
    data.append('work_type', form.workType)
    data.append('unit', form.unit)
    data.append('param_deadline', form.paramDeadline)
    data.append('param_quantity', form.paramQuantity)
    data.append('param_unit', form.paramUnit)
    data.append('param_format', form.paramFormat)
    data.append('tag1', form.tag1)
    data.append('tag2', form.tag2)
    data.append('tag3', form.tag3)
    if (imageFile) data.append('image', imageFile)
    if (videoFile) data.append('video', videoFile)
    if (isEdit && removeImage && !imageFile) data.append('remove_image', 'true')
    if (isEdit && removeVideo && !videoFile) data.append('remove_video', 'true')
    return data
  }

  const currentImageUrl = imagePreviewUrl ?? (removeImage ? null : work?.image_url)
  const currentVideoUrl = removeVideo ? null : work?.video_url
  const showVideoBlock = Boolean(currentVideoUrl || videoFile)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.priceRub.trim()) return

    const formData = buildFormData()
    const result = isEdit
      ? await dispatch(updateWorkThunk({ id: work!.id, formData }))
      : await dispatch(createWorkThunk(formData))

    if (createWorkThunk.fulfilled.match(result) || updateWorkThunk.fulfilled.match(result)) {
      onSaved()
      onHide()
    }
  }

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{isEdit ? 'Редактировать услугу' : 'Новая услуга'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={(e) => void handleSubmit(e)}>
        <Modal.Body className="d-flex flex-column gap-3">
          <Form.Group>
            <Form.Label>Название *</Form.Label>
            <Form.Control
              className="profile-input"
              required
              value={form.name}
              onChange={(e) => setField('name', e.target.value)}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Цена (руб.) *</Form.Label>
            <Form.Control
              className="profile-input"
              type="number"
              min={0}
              required
              value={form.priceRub}
              onChange={(e) => setField('priceRub', e.target.value)}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Тип работы</Form.Label>
            <Form.Control
              className="profile-input"
              placeholder="Печать / Переплёт / Дизайн / Допечать / Оформление"
              value={form.workType}
              onChange={(e) => setField('workType', e.target.value)}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Единица измерения</Form.Label>
            <Form.Control
              className="profile-input"
              placeholder="экз. / стр. / шт."
              value={form.unit}
              onChange={(e) => setField('unit', e.target.value)}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Описание</Form.Label>
            <Form.Control
              className="profile-input"
              as="textarea"
              rows={3}
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Срок</Form.Label>
            <Form.Control
              className="profile-input"
              value={form.paramDeadline}
              onChange={(e) => setField('paramDeadline', e.target.value)}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Тираж</Form.Label>
            <Form.Control
              className="profile-input"
              value={form.paramQuantity}
              onChange={(e) => setField('paramQuantity', e.target.value)}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Единица параметра</Form.Label>
            <Form.Control
              className="profile-input"
              value={form.paramUnit}
              onChange={(e) => setField('paramUnit', e.target.value)}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Формат</Form.Label>
            <Form.Control
              className="profile-input"
              value={form.paramFormat}
              onChange={(e) => setField('paramFormat', e.target.value)}
            />
          </Form.Group>
          <div className="d-flex flex-wrap gap-3">
            <Form.Group className="flex-grow-1">
              <Form.Label>Тег 1</Form.Label>
              <Form.Control className="profile-input" value={form.tag1} onChange={(e) => setField('tag1', e.target.value)} />
            </Form.Group>
            <Form.Group className="flex-grow-1">
              <Form.Label>Тег 2</Form.Label>
              <Form.Control className="profile-input" value={form.tag2} onChange={(e) => setField('tag2', e.target.value)} />
            </Form.Group>
            <Form.Group className="flex-grow-1">
              <Form.Label>Тег 3</Form.Label>
              <Form.Control className="profile-input" value={form.tag3} onChange={(e) => setField('tag3', e.target.value)} />
            </Form.Group>
          </div>
          <Form.Group>
            <Form.Label>Фото</Form.Label>
            {currentImageUrl && (
              <div className="mb-2 d-flex flex-column gap-2 align-items-start">
                <img src={currentImageUrl} alt={form.name || 'preview'} style={{ maxHeight: 120, borderRadius: 8 }} />
                {isEdit && (
                  <Button
                    type="button"
                    variant="outline-danger"
                    size="sm"
                    onClick={() => {
                      setRemoveImage(true)
                      setImageFile(null)
                    }}
                  >
                    Удалить фото
                  </Button>
                )}
              </div>
            )}
            <Form.Control
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = (e.target as HTMLInputElement).files?.[0] ?? null
                setImageFile(file)
                if (file) setRemoveImage(false)
              }}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Видео</Form.Label>
            {showVideoBlock && (
              <div className="mb-2 d-flex flex-column gap-2 align-items-start">
                {currentVideoUrl && (
                  <div className="text-muted small">
                    Текущее:{' '}
                    <a href={currentVideoUrl} target="_blank" rel="noreferrer">
                      {currentVideoUrl}
                    </a>
                  </div>
                )}
                {videoFile && <div className="text-muted small">Новый файл: {videoFile.name}</div>}
                {isEdit && (currentVideoUrl || videoFile) && (
                  <Button
                    type="button"
                    variant="outline-danger"
                    size="sm"
                    onClick={() => {
                      setRemoveVideo(true)
                      setVideoFile(null)
                    }}
                  >
                    Удалить видео
                  </Button>
                )}
              </div>
            )}
            <Form.Control
              type="file"
              accept="video/*"
              onChange={(e) => {
                const file = (e.target as HTMLInputElement).files?.[0] ?? null
                setVideoFile(file)
                if (file) setRemoveVideo(false)
              }}
            />
          </Form.Group>
          {error && <div className="mis-error">{error}</div>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onHide} disabled={mutating}>
            Отмена
          </Button>
          <Button variant="primary" type="submit" disabled={mutating}>
            {mutating ? <Spinner size="sm" animation="border" /> : 'Сохранить'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}
