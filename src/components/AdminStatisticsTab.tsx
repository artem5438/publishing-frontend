import { useMemo, useState } from 'react'
import { Spinner } from 'react-bootstrap'
import ErrorAlert from './ErrorAlert'
import StatsChartCard from './StatsChartCard'
import StatsStatusChartCard from './StatsStatusChartCard'
import type { Order, Work } from '../types'
import {
  STATS_PERIOD_PRESET_LABELS,
  STATS_STATUS_FILTER_LABELS,
  computeKpis,
  filterOrdersForStats,
  formatStatsContextLabel,
  getDistinctChartColor,
  getWorkTypeColor,
  groupAvgCheckByMonth,
  groupCirculationByMonth,
  groupOrdersByMonth,
  groupRevenueByMonth,
  isStatsDateRangeInvalid,
  resolvePeriodPreset,
  statsCompletedMetricsBlocked,
  topWorksByQuantity,
  workTypeBreakdown,
  type StatsFilters,
  type StatsPeriodPreset,
  type StatsStatusFilter,
} from '../utils/moderatorStats'

interface AdminStatisticsTabProps {
  orders: Order[]
  works: Work[]
  loading: boolean
  error: string
}

const EMPTY_COMPLETED_STATUS = 'Нет завершённых заявок при выбранном статусе'

const defaultFilters: StatsFilters = {
  dateFrom: '',
  dateTo: '',
  preset: 'all',
  status: '',
  creatorLogin: '',
}

const TIME_SERIES_TYPES = ['bar', 'line', 'area', 'pie'] as const

const STATS_PERIOD_PRESETS: StatsPeriodPreset[] = ['all', 'last30', 'thisMonth', 'lastMonth']

export default function AdminStatisticsTab({ orders, works, loading, error }: AdminStatisticsTabProps) {
  const [presetInput, setPresetInput] = useState<StatsPeriodPreset>('all')
  const [dateFromInput, setDateFromInput] = useState('')
  const [dateToInput, setDateToInput] = useState('')
  const [statusInput, setStatusInput] = useState<StatsStatusFilter>('')
  const [creatorInput, setCreatorInput] = useState('')
  const [appliedFilters, setAppliedFilters] = useState<StatsFilters>(defaultFilters)
  const [filterError, setFilterError] = useState('')
  const [chartResetKey, setChartResetKey] = useState(0)
  const [topWorksLimit, setTopWorksLimit] = useState(3)

  const filteredOrders = useMemo(
    () => filterOrdersForStats(orders, appliedFilters),
    [orders, appliedFilters],
  )

  const completedBlocked = statsCompletedMetricsBlocked(appliedFilters)

  const kpis = useMemo(() => computeKpis(filteredOrders, works), [filteredOrders, works])
  const contextLabel = useMemo(() => formatStatsContextLabel(appliedFilters), [appliedFilters])

  const workTypes = useMemo(() => workTypeBreakdown(works), [works])
  const topWorks = useMemo(
    () => topWorksByQuantity(filteredOrders, topWorksLimit),
    [filteredOrders, topWorksLimit],
  )

  const workTypeChartData = useMemo(
    () => workTypes.map((w) => ({ name: w.name, value: w.count })),
    [workTypes],
  )
  const topWorksData = useMemo(
    () => topWorks.map((w) => ({ name: w.name, count: w.count })),
    [topWorks],
  )

  const periodFill = (_entry: { label?: string; value?: number }, index: number) =>
    getDistinctChartColor(index)

  const buildFilters = (
    preset: StatsPeriodPreset,
    dateFrom: string,
    dateTo: string,
    status: StatsStatusFilter,
    creatorLogin: string,
  ): StatsFilters => ({ dateFrom, dateTo, preset, status, creatorLogin })

  const applyFilters = (filters: StatsFilters) => {
    if (isStatsDateRangeInvalid(filters.dateFrom, filters.dateTo)) {
      setFilterError('Дата «от» не может быть позже даты «до»')
      return
    }
    setFilterError('')
    setAppliedFilters(filters)
  }

  const handlePresetChange = (preset: StatsPeriodPreset) => {
    setPresetInput(preset)
    const range = resolvePeriodPreset(preset)
    setDateFromInput(range.dateFrom)
    setDateToInput(range.dateTo)
    applyFilters(buildFilters(preset, range.dateFrom, range.dateTo, statusInput, creatorInput))
  }

  const handleDateManualChange = (which: 'from' | 'to', value: string) => {
    if (which === 'from') setDateFromInput(value)
    else setDateToInput(value)
  }

  const handleApplyFilters = () => {
    applyFilters(
      buildFilters(presetInput, dateFromInput, dateToInput, statusInput, creatorInput),
    )
  }

  const handleResetFilters = () => {
    setPresetInput('all')
    setDateFromInput('')
    setDateToInput('')
    setStatusInput('')
    setCreatorInput('')
    setFilterError('')
    setAppliedFilters(defaultFilters)
    setTopWorksLimit(3)
    setChartResetKey((k) => k + 1)
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
      value: completedBlocked ? '—' : kpis.totalCirculation.toLocaleString('ru-RU'),
      hint: completedBlocked ? EMPTY_COMPLETED_STATUS : 'по завершённым',
    },
    {
      label: 'Суммарная выручка',
      value: completedBlocked ? '—' : `${kpis.totalRevenue.toLocaleString('ru-RU')} ₽`,
      hint: completedBlocked ? EMPTY_COMPLETED_STATUS : 'по завершённым',
    },
    {
      label: 'Средний тираж',
      value: completedBlocked ? '—' : kpis.avgCirculation.toLocaleString('ru-RU'),
      hint: completedBlocked ? EMPTY_COMPLETED_STATUS : 'по завершённым',
    },
    { label: 'Активных услуг', value: String(kpis.activeWorksCount) },
    {
      label: 'Доля отказов',
      value: kpis.rejectionRatePercent != null ? `${kpis.rejectionRatePercent}%` : '—',
      hint: 'от завершённых и отклонённых',
    },
  ]

  const completedEmpty = completedBlocked ? EMPTY_COMPLETED_STATUS : 'Нет данных'
  const timeSeriesKey = chartResetKey

  return (
    <div className="admin-stats-section">
      <div className="profile-filter-panel">
        <div className="profile-filter-field">
          <label>Период</label>
          <select
            className="profile-select"
            value={presetInput}
            onChange={(e) => handlePresetChange(e.target.value as StatsPeriodPreset)}
          >
            {STATS_PERIOD_PRESETS.map((p) => (
              <option key={p} value={p}>
                {STATS_PERIOD_PRESET_LABELS[p]}
              </option>
            ))}
          </select>
        </div>
        <div className="profile-filter-field">
          <label>Дата от</label>
          <input
            type="date"
            className="profile-input"
            value={dateFromInput}
            onChange={(e) => handleDateManualChange('from', e.target.value)}
          />
        </div>
        <div className="profile-filter-field">
          <label>Дата до</label>
          <input
            type="date"
            className="profile-input"
            value={dateToInput}
            onChange={(e) => handleDateManualChange('to', e.target.value)}
          />
        </div>
        <div className="profile-filter-field">
          <label>Статус</label>
          <select
            className="profile-select"
            value={statusInput}
            onChange={(e) => setStatusInput(e.target.value as StatsStatusFilter)}
          >
            {(Object.keys(STATS_STATUS_FILTER_LABELS) as StatsStatusFilter[]).map((s) => (
              <option key={s || 'all'} value={s}>
                {STATS_STATUS_FILTER_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        <div className="profile-filter-field">
          <label>Создатель</label>
          <input
            type="text"
            className="profile-input"
            placeholder="login"
            value={creatorInput}
            onChange={(e) => setCreatorInput(e.target.value)}
          />
        </div>
        <div className="profile-filter-actions">
          <button type="button" className="btn-profile-filter" onClick={handleApplyFilters}>
            Применить
          </button>
          <button type="button" className="btn-profile-reset" onClick={handleResetFilters}>
            Сбросить
          </button>
        </div>
      </div>

      {filterError && <ErrorAlert message={filterError} className="mb-3" />}

      <div className="admin-works-toolbar admin-stats-toolbar">
        <div>
          <p className="admin-works-toolbar-title">Показатели</p>
          <p className="admin-works-toolbar-meta">Фильтр: {contextLabel}</p>
          <p className="admin-works-toolbar-meta stats-catalog-note">Каталог «Услуги по типу» — без фильтра заявок</p>
        </div>
      </div>

      {filteredOrders.length === 0 && (
        <div className="mis-empty mb-3">Нет заявок за выбранный период и фильтры</div>
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
        <StatsStatusChartCard
          key={`status-${timeSeriesKey}`}
          orders={filteredOrders}
          emptyMessage="Нет данных"
        />

        <StatsChartCard
          key={`orders-period-${timeSeriesKey}`}
          title="Заявки по периодам"
          timeSeries={{ orders: filteredOrders, aggregate: groupOrdersByMonth }}
          nameKey="label"
          valueKey="value"
          seriesLabel="Заявок"
          allowedTypes={[...TIME_SERIES_TYPES]}
          defaultType="bar"
          getFill={periodFill}
          valueFormatter={(v) => `${v} заявок`}
          showPiePercent
        />

        <StatsChartCard
          key={`circulation-${timeSeriesKey}`}
          title="Тираж по периодам (завершённые)"
          timeSeries={{ orders: filteredOrders, aggregate: groupCirculationByMonth }}
          nameKey="label"
          valueKey="value"
          seriesLabel="Тираж"
          allowedTypes={[...TIME_SERIES_TYPES]}
          defaultType="bar"
          getFill={periodFill}
          valueFormatter={(v) => `${v.toLocaleString('ru-RU')} экз.`}
          showPiePercent
          emptyMessage={completedEmpty}
        />

        <StatsChartCard
          key={`revenue-${timeSeriesKey}`}
          title="Выручка по периодам (завершённые)"
          timeSeries={{ orders: filteredOrders, aggregate: groupRevenueByMonth }}
          nameKey="label"
          valueKey="value"
          seriesLabel="Выручка"
          allowedTypes={[...TIME_SERIES_TYPES]}
          defaultType="bar"
          getFill={periodFill}
          valueFormatter={(v) => `${v.toLocaleString('ru-RU')} ₽`}
          enableMonthDelta={!completedBlocked}
          showPiePercent
          emptyMessage={completedEmpty}
        />

        <StatsChartCard
          key={`avg-check-${timeSeriesKey}`}
          title="Средний чек по периодам (завершённые)"
          timeSeries={{ orders: filteredOrders, aggregate: groupAvgCheckByMonth }}
          nameKey="label"
          valueKey="value"
          seriesLabel="Средний чек"
          allowedTypes={[...TIME_SERIES_TYPES]}
          defaultType="bar"
          getFill={periodFill}
          valueFormatter={(v) => `${v.toLocaleString('ru-RU')} ₽`}
          showPiePercent
          emptyMessage={completedEmpty}
        />

        <StatsChartCard
          title="Топ услуги в заявках"
          data={topWorksData}
          nameKey="name"
          valueKey="count"
          seriesLabel="В заявках"
          allowedTypes={['bar', 'pie']}
          defaultType="bar"
          layout="vertical"
          categoryAxisWidth={140}
          getFill={(_entry, index) => getDistinctChartColor(index)}
          emptyMessage="Нет позиций в заявках за выбранный период"
          headerExtra={
            <select
              className="profile-select stats-chart-header-select"
              value={topWorksLimit}
              onChange={(e) => setTopWorksLimit(Number(e.target.value))}
              aria-label="Количество услуг в топе"
            >
              {[3, 5, 10].map((n) => (
                <option key={n} value={n}>
                  {`Топ-${n}`}
                </option>
              ))}
            </select>
          }
        />

        <StatsChartCard
          title="Услуги по типу (каталог)"
          data={workTypeChartData}
          nameKey="name"
          valueKey="value"
          seriesLabel="Услуг"
          allowedTypes={['pie', 'bar']}
          defaultType="pie"
          getFill={(entry, index) => getWorkTypeColor(String(entry.name ?? ''), index)}
          emptyMessage="Нет услуг в каталоге"
        />
      </div>
    </div>
  )
}
