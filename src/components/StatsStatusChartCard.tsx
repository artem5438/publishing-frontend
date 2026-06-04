import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import StatsChartTooltip from './StatsChartTooltip'
import type { Order } from '../types'
import {
  getDistinctChartColor,
  STATS_CHART_COLORS,
  STATUS_GROUP_LABELS,
  STATUS_STACK_SERIES,
  statusBreakdown,
  statusByMonthBreakdown,
  type StatusGroupMode,
} from '../utils/moderatorStats'

const CHART_HEIGHT = 260

type StatusChartType = 'pie' | 'bar'

const CHART_TYPE_LABELS: Record<StatusChartType, string> = {
  pie: 'Круговая',
  bar: 'Столбцы',
}

const axisTick = { fill: STATS_CHART_COLORS.axis, fontSize: 12 }
const gridStroke = STATS_CHART_COLORS.grid
const legendStyle = { fontSize: 13, paddingTop: 8 }

const tooltipBoxStyle: React.CSSProperties = {
  backgroundColor: STATS_CHART_COLORS.tooltipBg,
  border: `1px solid ${STATS_CHART_COLORS.tooltipBorder}`,
  borderRadius: 4,
  fontSize: 13,
  color: STATS_CHART_COLORS.neutral,
  padding: '8px 12px',
  lineHeight: 1.45,
}

interface PeriodTooltipProps {
  active?: boolean
  payload?: { name: string; value: number; color: string }[]
  label?: string
}

function PeriodTooltip({ active, payload, label }: PeriodTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div style={tooltipBoxStyle}>
      {label && <div style={{ fontWeight: 600, marginBottom: 6 }}>{label}</div>}
      {payload.map((p) => (
        <div key={p.name} style={{ marginTop: 2 }}>
          {`${p.name}: ${Number(p.value).toLocaleString('ru-RU')}`}
        </div>
      ))}
    </div>
  )
}

interface StatsStatusChartCardProps {
  orders: Order[]
  emptyMessage?: string
}

export default function StatsStatusChartCard({
  orders,
  emptyMessage = 'Нет данных',
}: StatsStatusChartCardProps) {
  const [groupMode, setGroupMode] = useState<StatusGroupMode>('all')
  const [chartType, setChartType] = useState<StatusChartType>('pie')

  const isTimeGrouped = groupMode !== 'all'

  const statusSummary = useMemo(
    () =>
      statusBreakdown(orders)
        .filter((s) => s.count > 0)
        .map((s) => ({ label: s.label, count: s.count, color: s.color })),
    [orders],
  )

  const periodData = useMemo(() => {
    if (!isTimeGrouped) return []
    return statusByMonthBreakdown(orders, groupMode)
  }, [orders, groupMode, isTimeGrouped])

  const pieData = useMemo(() => {
    if (!isTimeGrouped) return statusSummary
    return periodData
      .map((row, index) => ({
        label: row.label,
        count: row.formed + row.completed + row.rejected,
        color: getDistinctChartColor(index),
      }))
      .filter((d) => d.count > 0)
  }, [isTimeGrouped, statusSummary, periodData])

  const formatValue = (value: unknown) => `${Number(value ?? 0)} заявок`

  const pieTooltipProps = useMemo(
    () => ({
      nameKey: 'label',
      valueKey: 'count',
      seriesLabel: 'Заявок',
      formatValue,
      data: pieData as Record<string, unknown>[],
      showPiePercent: true,
    }),
    [pieData],
  )

  const barTooltipProps = useMemo(
    () => ({
      nameKey: 'label',
      valueKey: 'count',
      seriesLabel: 'Заявок',
      formatValue,
      data: statusSummary as Record<string, unknown>[],
      showPiePercent: false,
    }),
    [statusSummary],
  )

  const isEmpty =
    chartType === 'pie'
      ? pieData.length === 0
      : isTimeGrouped
        ? periodData.length === 0
        : statusSummary.length === 0

  const renderGroupedBarChart = () => (
    <div className="stats-chart-body">
      <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
        <BarChart data={periodData} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
          <XAxis dataKey="label" tick={axisTick} />
          <YAxis allowDecimals={false} tick={axisTick} width={48} />
          <Tooltip content={<PeriodTooltip />} />
          <Legend iconType="square" wrapperStyle={legendStyle} />
          {STATUS_STACK_SERIES.map((s) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.label}
              fill={s.color}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )

  const renderPieChart = () => (
    <div className="stats-chart-body">
      <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
        <PieChart key={groupMode}>
          <Pie
            data={pieData}
            dataKey="count"
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius={isTimeGrouped ? 0 : 50}
            outerRadius={85}
            paddingAngle={isTimeGrouped ? 0 : 2}
            label={false}
          >
            {pieData.map((entry) => (
              <Cell key={`${groupMode}-${entry.label}`} fill={String(entry.color)} />
            ))}
          </Pie>
          <Tooltip content={<StatsChartTooltip {...pieTooltipProps} />} />
          <Legend iconType="square" wrapperStyle={legendStyle} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )

  const renderSummaryBarChart = () => (
    <div className="stats-chart-body">
      <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
        <BarChart data={statusSummary} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
          <XAxis dataKey="label" tick={axisTick} />
          <YAxis allowDecimals={false} domain={[0, 'dataMax']} tick={axisTick} width={48} />
          <Tooltip content={<StatsChartTooltip {...barTooltipProps} />} />
          <Bar dataKey="count" name="Заявок" radius={[4, 4, 0, 0]}>
            {statusSummary.map((entry, index) => (
              <Cell key={index} fill={String(entry.color)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )

  const renderChart = () => {
    if (chartType === 'pie') return renderPieChart()
    if (isTimeGrouped) return renderGroupedBarChart()
    return renderSummaryBarChart()
  }

  return (
    <div className="stats-chart-card profile-order-card">
      <div className="stats-chart-header">
        <div className="stats-chart-header-text">
          <h3 className="stats-chart-title">Заявки по статусам</h3>
        </div>
        <div className="stats-chart-header-controls">
          <select
            className="profile-select stats-chart-header-select"
            value={groupMode}
            onChange={(e) => setGroupMode(e.target.value as StatusGroupMode)}
            aria-label="Группировка"
          >
            {(Object.keys(STATUS_GROUP_LABELS) as StatusGroupMode[]).map((m) => (
              <option key={m} value={m}>
                {STATUS_GROUP_LABELS[m]}
              </option>
            ))}
          </select>
          <select
            className="profile-select stats-chart-header-select"
            value={chartType}
            onChange={(e) => setChartType(e.target.value as StatusChartType)}
            aria-label="Тип диаграммы"
          >
            {(Object.keys(CHART_TYPE_LABELS) as StatusChartType[]).map((t) => (
              <option key={t} value={t}>
                {CHART_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </div>
      </div>
      {isEmpty ? <p className="stats-chart-empty">{emptyMessage}</p> : renderChart()}
    </div>
  )
}
