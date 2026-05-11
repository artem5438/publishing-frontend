import { useEffect } from 'react'
import { Container, Spinner } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import WorkCard from '../components/WorkCard'
import { fetchWorksThunk } from '../store/worksSlice'
import { useAppDispatch, useAppSelector } from '../store/hooks'

const emptyFilters = { search: '', minPrice: '', maxPrice: '', workType: '' }
const HERO_VIDEO_URL = 'http://localhost:9000/publishing-media/hero-folio.mp4'

export default function HomePage() {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.auth.user)
  const { items: works, loading, error } = useAppSelector((state) => state.works)
  const popularWorks = works.slice(0, 3)

  useEffect(() => {
    if (works.length > 0) return
    void dispatch(fetchWorksThunk(emptyFilters))
  }, [dispatch, works.length])

  return (
    <main className="home-page">
      <section className="home-hero">
        <video className="home-hero-video" autoPlay muted loop playsInline preload="metadata">
          <source src={HERO_VIDEO_URL} type="video/mp4" />
        </video>
        <div className="home-hero-overlay" aria-hidden="true" />
        <Container className="text-center home-hero-content">
          <h1 className="home-hero-title">Folio</h1>
          <p className="home-hero-subtitle">Издательские услуги - от заявки до тиража</p>
          <div className="home-hero-actions">
            <Link to="/works" className="btn-add-custom home-hero-btn">
              Смотреть услуги
            </Link>
            {!user && (
              <Link to="/login" className="mis-nav-btn home-login-btn">
                Войти
              </Link>
            )}
          </div>
        </Container>
      </section>

      <section className="home-section">
        <Container className="px-4">
          <h2 className="home-section-title">Как это работает</h2>
          <div className="home-steps-grid">
            <article className="home-info-card">
              <div className="home-info-icon">📚</div>
              <h3>Выбери услуги</h3>
              <p>Просматривай каталог и добавляй нужное в заявку</p>
            </article>
            <article className="home-info-card">
              <div className="home-info-icon">📝</div>
              <h3>Оформи заявку</h3>
              <p>Укажи название книги и тираж, подтверди заказ</p>
            </article>
            <article className="home-info-card">
              <div className="home-info-icon">📈</div>
              <h3>Следи за статусом</h3>
              <p>Отслеживай заявку в личном кабинете</p>
            </article>
          </div>
        </Container>
      </section>

      <section className="home-section">
        <Container className="px-4">
          <h2 className="home-section-title">Цифры</h2>
          <div className="home-metrics-grid">
            <article className="home-metric-card">
              <div className="home-metric-value">10+</div>
              <div className="home-metric-label">видов услуг</div>
            </article>
            <article className="home-metric-card">
              <div className="home-metric-value">5 минут</div>
              <div className="home-metric-label">на оформление</div>
            </article>
            <article className="home-metric-card">
              <div className="home-metric-value">3</div>
              <div className="home-metric-label">статуса отслеживания</div>
            </article>
            <article className="home-metric-card">
              <div className="home-metric-value">100%</div>
              <div className="home-metric-label">онлайн</div>
            </article>
          </div>
        </Container>
      </section>

      <section className="home-section">
        <Container fluid className="px-5">
          <h2 className="home-section-title">Популярные услуги</h2>
          {loading && (
            <div className="text-center py-4">
              <Spinner animation="border" />
            </div>
          )}
          {!loading && error && <div className="mis-error">{error}</div>}
          {!loading && !error && popularWorks.length === 0 && (
            <div className="mis-empty">Пока нет услуг для отображения.</div>
          )}
          {!loading && popularWorks.length > 0 && (
            <div className="works-grid-custom">
              {popularWorks.map((work) => (
                <WorkCard key={work.id} work={work} />
              ))}
            </div>
          )}
          <div className="home-link-row">
            <Link to="/works" className="btn-detail-custom">
              Все услуги →
            </Link>
          </div>
        </Container>
      </section>

      <section className="home-cta-section">
        <Container className="text-center home-cta-content">
          <h2>Готовы начать?</h2>
          <Link to="/works" className="btn-add-custom home-cta-btn">
            Создать заявку
          </Link>
        </Container>
      </section>

      <footer className="home-footer">
        <Container className="home-footer-content">
          <div className="home-footer-main">
            <div className="home-footer-brand">Folio</div>
            <p className="home-footer-tagline">Издательские услуги</p>
            <div className="home-footer-contact-row">
              <a href="tel:+78007756741" className="home-footer-phone">
                8 800 775-67-41
              </a>
              <span className="home-footer-sep" aria-hidden="true">
                ·
              </span>
              <a href="mailto:support@folio.ru" className="home-footer-mail">
                support@folio.ru
              </a>
            </div>
            <p className="home-footer-note">Пн–Вс, 9:00–20:00</p>
          </div>

          <nav className="home-footer-nav" aria-label="Дополнительно">
            <a href="#">Помощь</a>
            <a href="#">Для партнёров</a>
            <a href="#">Правовая информация</a>
          </nav>

          <div className="home-footer-bottom">
            <span className="home-footer-copy">© 2026 Folio</span>
          </div>
        </Container>
      </footer>
    </main>
  )
}
