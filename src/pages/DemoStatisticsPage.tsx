import { lazy, Suspense, useEffect, useState } from 'react'
import { Container, Spinner } from 'react-bootstrap'
import Breadcrumbs from '../components/Breadcrumbs'
import ErrorAlert from '../components/ErrorAlert'
import StatisticsErrorBoundary from '../components/StatisticsErrorBoundary'
import type { Order, Work } from '../types'

const AdminStatisticsTab = lazy(() => import('../components/AdminStatisticsTab'))

const tabFallback = (
  <div className="text-center py-5">
    <Spinner animation="border" />
  </div>
)

function demoStatsUrl(file: string): string {
  const base = import.meta.env.BASE_URL
  const prefix = base.endsWith('/') ? base : `${base}/`
  return `${prefix}demo-stats/${file}`
}

export default function DemoStatisticsPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [works, setWorks] = useState<Work[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError('')
      try {
        const [ordersRes, worksRes] = await Promise.all([
          fetch(demoStatsUrl('orders.json')),
          fetch(demoStatsUrl('works.json')),
        ])
        if (!ordersRes.ok || !worksRes.ok) {
          throw new Error('Не удалось загрузить демо-данные статистики')
        }
        const [ordersData, worksData] = await Promise.all([
          ordersRes.json() as Promise<Order[]>,
          worksRes.json() as Promise<Work[]>,
        ])
        if (!cancelled) {
          setOrders(ordersData)
          setWorks(worksData)
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Ошибка загрузки демо-данных')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <Container className="py-4">
      <Breadcrumbs items={[{ label: 'Главная', path: '/' }, { label: 'Демо аналитики' }]} />
      <div className="admin-works-toolbar admin-stats-toolbar mb-3">
        <div>
          <p className="admin-works-toolbar-title">Демонстрация аналитики Folio</p>
          <p className="admin-works-toolbar-meta">
            Вкладка «Статистика» панели модератора · демо-стенд GitHub Pages
          </p>
        </div>
      </div>

      {error && <ErrorAlert message={error} className="mb-3" />}

      <StatisticsErrorBoundary>
        <Suspense fallback={tabFallback}>
          <AdminStatisticsTab orders={orders} works={works} loading={loading} error={error} />
        </Suspense>
      </StatisticsErrorBoundary>
    </Container>
  )
}
