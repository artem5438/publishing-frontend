import { useMemo, useState } from 'react'
import {
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
import { STATS_CHART_COLORS } from '../utils/moderatorStats'

export type ChartViewType = 'pie' | 'bar' | 'line'

export interface StatsChartDatum {
  [key: string]: string | number | null | undefined
}

const CHART_HEIGHT = 260

const CHART_TYPE_LABELS: Record<ChartViewType, string> = {
  pie: 'Круговая',
  bar: 'Столбцы',
  line: 'Линия',
}

const tooltipStyle = {
  backgroundColor: STATS_CHART_COLORS.tooltipBg,
  border: `1px solid ${STATS_CHART_COLORS.tooltipBorder}`,
  borderRadius: 4,
  fontSize: 13,
  color: STATS_CHART_COLORS.neutral,
}

const axisTick = { fill: STATS_CHART_COLORS.axis, fontSize: 12 }
const gridStroke = STATS_CHART_COLORS.grid

const legendStyle = { fontSize: 13, paddingTop: 8 }

interface StatsChartCardProps {
  title: string
  subtitle?: string
  data: StatsChartDatum[]
  nameKey: string
  valueKey: string
  allowedTypes: ChartViewType[]
  defaultType: ChartViewType
  layout?: 'vertical' | 'horizontal'
  pieInnerRadius?: number
  /** Ширина оси категорий для горизонтальных bar (топ-услуги) */
  categoryAxisWidth?: number
  getFill?: (entry: StatsChartDatum, index: number) => string
  valueFormatter?: (value: number) => string
  emptyMessage?: string
  /** Показать Δ к прошлому месяцу в tooltip (для помесячных рядов) */
  showMonthDelta?: boolean
}

export default function StatsChartCard({
  title,
  subtitle,
  data,
  nameKey,
  valueKey,
  allowedTypes,
  defaultType,
  layout = 'horizontal',
  pieInnerRadius = 0,
  categoryAxisWidth = 140,
  getFill,
  valueFormatter,
  emptyMessage = 'Нет данных',
  showMonthDelta = false,
}: StatsChartCardProps) {
  const initialType = allowedTypes.includes(defaultType) ? defaultType : allowedTypes[0]
  const [chartType, setChartType] = useState<ChartViewType>(initialType)

  const activeType = allowedTypes.includes(chartType) ? chartType : allowedTypes[0]
  const showTypeSelect = allowedTypes.length > 1

  const defaultFill = useMemo(
    () => (entry: StatsChartDatum, index: number) =>
      getFill?.(entry, index) ?? STATS_CHART_COLORS.neutral,
    [getFill],
  )

  const formatValue = (value: unknown) => {
    const n = Number(value ?? 0)
    return valueFormatter ? valueFormatter(n) : String(n)
  }

  const monthDeltaByIndex = useMemo(() => {
    if (!showMonthDelta) return new Map<number, number>()
    const map = new Map<number, number>()
    for (let i = 1; i < data.length; i++) {
      const prev = Number(data[i - 1]?.[valueKey] ?? 0)
      const cur = Number(data[i]?.[valueKey] ?? 0)
      map.set(i, cur - prev)
    }
    return map
  }, [data, showMonthDelta, valueKey])

  const renderChart = () => {
    if (data.length === 0) {
      return <p className="stats-chart-empty">{emptyMessage}</p>
    }

    if (activeType === 'pie') {
      return (
        <div className="stats-chart-body">
          <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
            <PieChart>
              <Pie
                data={data}
                dataKey={valueKey}
                nameKey={nameKey}
                cx="50%"
                cy="50%"
                innerRadius={pieInnerRadius}
                outerRadius={85}
                paddingAngle={pieInnerRadius > 0 ? 2 : 0}
                label={false}
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={defaultFill(entry, index)} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value, name) => [formatValue(value), String(name ?? '')]}
              />
              <Legend iconType="square" wrapperStyle={legendStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )
    }

    if (activeType === 'line') {
      return (
        <div className="stats-chart-body">
          <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
            <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
              <XAxis dataKey={nameKey} tick={axisTick} />
              <YAxis allowDecimals={false} domain={[0, 'dataMax']} tick={axisTick} width={48} />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value) => formatValue(value)}
              />
              <Line
                type="monotone"
                dataKey={valueKey}
                stroke={STATS_CHART_COLORS.neutral}
                strokeWidth={2}
                dot={{ r: 3, fill: STATS_CHART_COLORS.neutral }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )
    }

    const isVerticalBar = layout === 'vertical'
    const barMargin = isVerticalBar
      ? { top: 8, right: 16, left: 4, bottom: 0 }
      : { top: 8, right: 16, left: 8, bottom: 0 }

    return (
      <div className="stats-chart-body">
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
          <BarChart
            data={data}
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
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value, _name, item) => {
                const label = String(item?.payload?.[nameKey] ?? '')
                const formatted = formatValue(value)
                const idx = data.indexOf(item?.payload as StatsChartDatum)
                const delta = idx > 0 ? monthDeltaByIndex.get(idx) : undefined
                if (delta != null && showMonthDelta) {
                  const sign = delta >= 0 ? '+' : ''
                  return [
                    `${formatted} · ${label}`,
                    `Δ к прошлому: ${sign}${delta.toLocaleString('ru-RU')} ₽`,
                  ]
                }
                if (showMonthDelta && label) {
                  return [`${formatted} · ${label}`, '']
                }
                return formatted
              }}
            />
            <Bar
              dataKey={valueKey}
              radius={isVerticalBar ? [0, 4, 4, 0] : [4, 4, 0, 0]}
            >
              {data.map((entry, index) => (
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
        {showTypeSelect && (
          <select
            className="profile-select stats-chart-type-select"
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
      {renderChart()}
    </div>
  )
}
