import { useMemo, useState } from 'react'
import { Spinner } from 'react-bootstrap'
import ErrorAlert from './ErrorAlert'
import StatsChartCard from './StatsChartCard'
import type { Order, Work } from '../types'
import {
  STATS_CHART_COLORS,
  TOP_WORK_COLORS,
  computeKpis,
  filterOrdersByPeriod,
  formatPeriodLabel,
  getWorkTypeColor,
  groupCirculationByMonth,
  groupOrdersByMonth,
  groupRevenueByMonth,
  statusBreakdown,
  topWorksByQuantity,
  workTypeBreakdown,
  type StatsDateRange,
} from '../utils/moderatorStats'

interface AdminStatisticsTabProps {
  orders: Order[]
  works: Work[]
  loading: boolean
  error: string
}

export default function AdminStatisticsTab({ orders, works, loading, error }: AdminStatisticsTabProps) {
  const [dateFromInput, setDateFromInput] = useState('')
  const [dateToInput, setDateToInput] = useState('')
  const [appliedRange, setAppliedRange] = useState<StatsDateRange>({ dateFrom: '', dateTo: '' })

  const filteredOrders = useMemo(
    () => filterOrdersByPeriod(orders, appliedRange),
    [orders, appliedRange],
  )

  const kpis = useMemo(() => computeKpis(filteredOrders, works), [filteredOrders, works])
  const periodLabel = useMemo(() => formatPeriodLabel(appliedRange), [appliedRange])

  const ordersByMonth = useMemo(() => groupOrdersByMonth(filteredOrders), [filteredOrders])
  const circulationByMonth = useMemo(() => groupCirculationByMonth(filteredOrders), [filteredOrders])
  const revenueByMonth = useMemo(() => groupRevenueByMonth(filteredOrders), [filteredOrders])
  const statusSlices = useMemo(() => statusBreakdown(filteredOrders), [filteredOrders])
  const workTypes = useMemo(() => workTypeBreakdown(works), [works])
  const topWorks = useMemo(() => topWorksByQuantity(filteredOrders, 3), [filteredOrders])

  const statusPieData = useMemo(
    () => statusSlices.filter((s) => s.count > 0).map((s) => ({ label: s.label, count: s.count, color: s.color })),
    [statusSlices],
  )
  const workTypeChartData = useMemo(
    () => workTypes.map((w) => ({ name: w.name, value: w.count })),
    [workTypes],
  )
  const ordersMonthData = useMemo(
    () => ordersByMonth.map((p) => ({ label: p.label, value: p.value })),
    [ordersByMonth],
  )
  const circulationMonthData = useMemo(
    () => circulationByMonth.map((p) => ({ label: p.label, value: p.value })),
    [circulationByMonth],
  )
  const revenueMonthData = useMemo(
    () => revenueByMonth.map((p) => ({ label: p.label, value: p.value })),
    [revenueByMonth],
  )
  const topWorksData = useMemo(
    () => topWorks.map((w) => ({ name: w.name, count: w.count })),
    [topWorks],
  )

  const handleApplyPeriod = () => {
    setAppliedRange({ dateFrom: dateFromInput, dateTo: dateToInput })
  }

  const handleResetPeriod = () => {
    setDateFromInput('')
    setDateToInput('')
    setAppliedRange({ dateFrom: '', dateTo: '' })
  }

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    )
  }

  if (error) {
    return <ErrorAlert message={error} className="mb-3" />
  }

  const kpiCards = [
    { label: 'Всего заявок', value: String(kpis.totalOrders) },
    { label: 'На модерации', value: String(kpis.formedCount) },
    { label: 'Завершено', value: String(kpis.completedCount) },
    { label: 'Отклонено', value: String(kpis.rejectedCount) },
    {
      label: 'Суммарный тираж',
      value: kpis.totalCirculation.toLocaleString('ru-RU'),
      hint: 'по завершённым',
    },
    {
      label: 'Суммарная выручка',
      value: `${kpis.totalRevenue.toLocaleString('ru-RU')} ₽`,
      hint: 'по завершённым',
    },
    {
      label: 'Средний тираж',
      value: kpis.avgCirculation.toLocaleString('ru-RU'),
      hint: 'по завершённым',
    },
    { label: 'Активных услуг', value: String(kpis.activeWorksCount) },
    {
      label: 'Доля отказов',
      value: kpis.rejectionRatePercent != null ? `${kpis.rejectionRatePercent}%` : '—',
      hint: 'от завершённых и отклонённых',
    },
  ]

  return (
    <div className="admin-stats-section">
      <div className="profile-filter-panel">
        <div className="profile-filter-field">
          <label>Дата от</label>
          <input
            type="date"
            className="profile-input"
            value={dateFromInput}
            onChange={(e) => setDateFromInput(e.target.value)}
          />
        </div>
        <div className="profile-filter-field">
          <label>Дата до</label>
          <input
            type="date"
            className="profile-input"
            value={dateToInput}
            onChange={(e) => setDateToInput(e.target.value)}
          />
        </div>
        <div className="profile-filter-actions">
          <button type="button" className="btn-profile-filter" onClick={handleApplyPeriod}>
            Применить
          </button>
          <button type="button" className="btn-profile-reset" onClick={handleResetPeriod}>
            Сбросить
          </button>
        </div>
      </div>

      <div className="admin-works-toolbar admin-stats-toolbar">
        <div>
          <p className="admin-works-toolbar-title">Показатели</p>
          <p className="admin-works-toolbar-meta">Период: {periodLabel}</p>
        </div>
      </div>

      {filteredOrders.length === 0 && (
        <div className="mis-empty mb-3">Нет заявок за выбранный период</div>
      )}

      <div className="stats-kpi-grid">
        {kpiCards.map((card) => (
          <div key={card.label} className="stats-kpi-card profile-order-card">
            <p className="stats-kpi-value">{card.value}</p>
            <p className="stats-kpi-label">{card.label}</p>
            {card.hint && <p className="stats-kpi-hint">{card.hint}</p>}
          </div>
        ))}
      </div>

      <div className="stats-charts-grid">
        <StatsChartCard
          title="Заявки по статусам"
          data={statusPieData}
          nameKey="label"
          valueKey="count"
          allowedTypes={['pie', 'bar']}
          defaultType="pie"
          pieInnerRadius={50}
          getFill={(entry) => String(entry.color ?? STATS_CHART_COLORS.neutral)}
          valueFormatter={(v) => `${v} заявок`}
          emptyMessage="Нет данных"
        />

        <StatsChartCard
          title="Заявки по месяцам"
          data={ordersMonthData}
          nameKey="label"
          valueKey="value"
          allowedTypes={['bar', 'line']}
          defaultType="bar"
        />

        <StatsChartCard
          title="Тираж по месяцам (завершённые)"
          data={circulationMonthData}
          nameKey="label"
          valueKey="value"
          allowedTypes={['bar']}
          defaultType="bar"
          getFill={() => STATS_CHART_COLORS.neutralAlt}
          valueFormatter={(v) => `${v.toLocaleString('ru-RU')} экз.`}
          emptyMessage="Нет данных"
        />

        <StatsChartCard
          title="Выручка по месяцам (завершённые)"
          subtitle="Сумма по завершённым заявкам за календарный месяц (не накопительно)"
          data={revenueMonthData}
          nameKey="label"
          valueKey="value"
          allowedTypes={['bar']}
          defaultType="bar"
          valueFormatter={(v) => `${v.toLocaleString('ru-RU')} ₽`}
          showMonthDelta={revenueMonthData.length >= 2}
          emptyMessage="Нет данных"
        />

        <StatsChartCard
          title="Топ-3 услуги в заявках"
          data={topWorksData}
          nameKey="name"
          valueKey="count"
          allowedTypes={['bar', 'pie']}
          defaultType="bar"
          layout="vertical"
          categoryAxisWidth={140}
          getFill={(_entry, index) => TOP_WORK_COLORS[index % TOP_WORK_COLORS.length]}
          emptyMessage="Нет позиций в заявках за выбранный период"
        />

        <StatsChartCard
          title="Услуги по типу (каталог)"
          data={workTypeChartData}
          nameKey="name"
          valueKey="value"
          allowedTypes={['pie', 'bar']}
          defaultType="pie"
          getFill={(entry, index) => getWorkTypeColor(String(entry.name ?? ''), index)}
          emptyMessage="Нет услуг в каталоге"
        />
      </div>

      {(kpis.rejectedCount > 0 || kpis.rejectionRatePercent != null) && (
        <div className="admin-works-toolbar admin-stats-rejection-summary">
          <div>
            <p className="admin-works-toolbar-title">Отказы</p>
            <p className="admin-works-toolbar-meta">
              Отклонено: {kpis.rejectedCount}
              {kpis.rejectionRatePercent != null ? ` · ${kpis.rejectionRatePercent}% от обработанных` : ''}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
