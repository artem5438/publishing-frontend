import { useMemo, useState, type ReactNode } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
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
  CHART_PALETTE,
  STATS_CHART_COLORS,
  type MonthPoint,
  type StatsTimeGranularity,
} from '../utils/moderatorStats'

export type ChartViewType = 'pie' | 'bar' | 'line' | 'area'

export interface StatsChartDatum {
  [key: string]: string | number | null | undefined
}

export interface StatsTimeSeriesConfig {
  orders: Order[]
  aggregate: (orders: Order[], granularity: StatsTimeGranularity) => MonthPoint[]
}

const CHART_HEIGHT = 260

const CHART_TYPE_LABELS: Record<ChartViewType, string> = {
  pie: 'Круговая',
  bar: 'Столбцы',
  line: 'Линия',
  area: 'Область',
}

const GRANULARITY_LABELS: Record<StatsTimeGranularity, string> = {
  month: 'По месяцам',
  week: 'По неделям',
}

const axisTick = { fill: STATS_CHART_COLORS.axis, fontSize: 12 }
const gridStroke = STATS_CHART_COLORS.grid
const legendStyle = { fontSize: 13, paddingTop: 8 }

interface StatsChartCardProps {
  title: string
  subtitle?: string
  /** Статические данные (если нет timeSeries) */
  data?: StatsChartDatum[]
  timeSeries?: StatsTimeSeriesConfig
  nameKey: string
  valueKey: string
  seriesLabel: string
  allowedTypes: ChartViewType[]
  defaultType: ChartViewType
  layout?: 'vertical' | 'horizontal'
  pieInnerRadius?: number
  categoryAxisWidth?: number
  getFill?: (entry: StatsChartDatum, index: number) => string
  valueFormatter?: (value: number) => string
  emptyMessage?: string
  /** Δ к прошлому периоду (только bar/line/area, не pie) */
  enableMonthDelta?: boolean
  showPiePercent?: boolean
  headerExtra?: ReactNode
}

export default function StatsChartCard({
  title,
  subtitle,
  data: externalData = [],
  timeSeries,
  nameKey,
  valueKey,
  seriesLabel,
  allowedTypes,
  defaultType,
  layout = 'horizontal',
  pieInnerRadius = 0,
  categoryAxisWidth = 140,
  getFill,
  valueFormatter,
  emptyMessage = 'Нет данных',
  enableMonthDelta = false,
  showPiePercent = false,
  headerExtra,
}: StatsChartCardProps) {
  const initialType = allowedTypes.includes(defaultType) ? defaultType : allowedTypes[0]
  const [chartType, setChartType] = useState<ChartViewType>(initialType)
  const [granularity, setGranularity] = useState<StatsTimeGranularity>('month')

  const activeType = allowedTypes.includes(chartType) ? chartType : allowedTypes[0]
  const showTypeSelect = allowedTypes.length > 1
  const showGranularitySelect = timeSeries != null

  const chartData = useMemo(() => {
    if (timeSeries) {
      return timeSeries.aggregate(timeSeries.orders, granularity).map((p) => ({
        label: p.label,
        value: p.value,
      }))
    }
    return externalData
  }, [timeSeries, granularity, externalData])

  const defaultFill = useMemo(
    () => (entry: StatsChartDatum, index: number) =>
      getFill?.(entry, index) ?? CHART_PALETTE[index % CHART_PALETTE.length],
    [getFill],
  )

  const formatValue = (value: unknown) => {
    const n = Number(value ?? 0)
    return valueFormatter ? valueFormatter(n) : String(n)
  }

  const effectiveShowMonthDelta =
    enableMonthDelta && activeType !== 'pie' && chartData.length >= 2

  const monthDeltaByIndex = useMemo(() => {
    if (!effectiveShowMonthDelta) return new Map<number, number>()
    const map = new Map<number, number>()
    for (let i = 1; i < chartData.length; i++) {
      const prev = Number((chartData[i - 1] as StatsChartDatum)?.[valueKey] ?? 0)
      const cur = Number((chartData[i] as StatsChartDatum)?.[valueKey] ?? 0)
      map.set(i, cur - prev)
    }
    return map
  }, [chartData, effectiveShowMonthDelta, valueKey])

  const tooltipProps = useMemo(
    () => ({
      nameKey,
      valueKey,
      seriesLabel,
      formatValue,
      showMonthDelta: effectiveShowMonthDelta,
      monthDeltaByIndex,
      data: chartData as Record<string, unknown>[],
      showPiePercent: activeType === 'pie' ? showPiePercent : false,
    }),
    [
      nameKey,
      valueKey,
      seriesLabel,
      formatValue,
      effectiveShowMonthDelta,
      monthDeltaByIndex,
      chartData,
      showPiePercent,
      activeType,
    ],
  )

  const renderTimeSeries = (
    ChartComponent: typeof LineChart | typeof AreaChart,
    Series: typeof Line | typeof Area,
  ) => (
    <div className="stats-chart-body">
      <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
        <ChartComponent data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
          <XAxis dataKey={nameKey} tick={axisTick} />
          <YAxis allowDecimals={false} domain={[0, 'dataMax']} tick={axisTick} width={48} />
          <Tooltip content={<StatsChartTooltip {...tooltipProps} />} />
          <Series
            type="monotone"
            dataKey={valueKey}
            name={seriesLabel}
            stroke={STATS_CHART_COLORS.neutral}
            fill={activeType === 'area' ? STATS_CHART_COLORS.neutral : undefined}
            fillOpacity={activeType === 'area' ? 0.15 : undefined}
            strokeWidth={2}
            dot={{ r: 3, fill: STATS_CHART_COLORS.neutral }}
          />
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  )

  const renderChart = () => {
    if (chartData.length === 0) {
      return <p className="stats-chart-empty">{emptyMessage}</p>
    }

    if (activeType === 'pie') {
      return (
        <div className="stats-chart-body">
          <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
            <PieChart>
              <Pie
                data={chartData}
                dataKey={valueKey}
                nameKey={nameKey}
                cx="50%"
                cy="50%"
                innerRadius={pieInnerRadius}
                outerRadius={85}
                paddingAngle={pieInnerRadius > 0 ? 2 : 0}
                label={false}
              >
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={defaultFill(entry, index)} />
                ))}
              </Pie>
              <Tooltip content={<StatsChartTooltip {...tooltipProps} />} />
              <Legend iconType="square" wrapperStyle={legendStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )
    }

    if (activeType === 'line') {
      return renderTimeSeries(LineChart, Line)
    }

    if (activeType === 'area') {
      return renderTimeSeries(AreaChart, Area)
    }

    const isVerticalBar = layout === 'vertical'
    const barMargin = isVerticalBar
      ? { top: 8, right: 16, left: 4, bottom: 0 }
      : { top: 8, right: 16, left: 8, bottom: 0 }

    return (
      <div className="stats-chart-body">
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
          <BarChart
            data={chartData}
            layout={isVerticalBar ? 'vertical' : 'horizontal'}
            margin={barMargin}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={gridStroke}
              vertical={!isVerticalBar}
              horizontal={isVerticalBar}
            />
            {isVerticalBar ? (
              <>
                <XAxis type="number" allowDecimals={false} tick={axisTick} />
                <YAxis
                  type="category"
                  dataKey={nameKey}
                  tick={axisTick}
                  width={categoryAxisWidth}
                />
              </>
            ) : (
              <>
                <XAxis dataKey={nameKey} tick={axisTick} />
                <YAxis allowDecimals={false} domain={[0, 'dataMax']} tick={axisTick} width={48} />
              </>
            )}
            <Tooltip content={<StatsChartTooltip {...tooltipProps} />} />
            <Bar
              dataKey={valueKey}
              name={seriesLabel}
              radius={isVerticalBar ? [0, 4, 4, 0] : [4, 4, 0, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell key={index} fill={defaultFill(entry, index)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    )
  }

  return (
    <div className="stats-chart-card profile-order-card">
      <div className="stats-chart-header">
        <div className="stats-chart-header-text">
          <h3 className="stats-chart-title">{title}</h3>
          {subtitle && <p className="stats-chart-subtitle">{subtitle}</p>}
        </div>
        <div className="stats-chart-header-controls">
          {headerExtra}
          {showGranularitySelect && (
            <select
              className="profile-select stats-chart-header-select"
              value={granularity}
              onChange={(e) => setGranularity(e.target.value as StatsTimeGranularity)}
              aria-label="Группировка по времени"
            >
              {(Object.keys(GRANULARITY_LABELS) as StatsTimeGranularity[]).map((g) => (
                <option key={g} value={g}>
                  {GRANULARITY_LABELS[g]}
                </option>
              ))}
            </select>
          )}
          {showTypeSelect && (
            <select
              className="profile-select stats-chart-header-select"
              value={activeType}
              onChange={(e) => setChartType(e.target.value as ChartViewType)}
              aria-label="Тип диаграммы"
            >
              {allowedTypes.map((type) => (
                <option key={type} value={type}>
                  {CHART_TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
      {renderChart()}
    </div>
  )
}
