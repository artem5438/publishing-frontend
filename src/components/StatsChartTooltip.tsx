import { STATS_CHART_COLORS } from '../utils/moderatorStats'

export interface StatsChartTooltipProps {
  active?: boolean
  payload?: ReadonlyArray<{
    name?: string | number
    value?: number | string
    payload?: Record<string, unknown>
  }>
  nameKey: string
  valueKey?: string
  seriesLabel: string
  formatValue: (value: unknown) => string
  showMonthDelta?: boolean
  monthDeltaByIndex?: Map<number, number>
  data: Record<string, unknown>[]
  /** Для pie: показать долю от суммы среза */
  showPiePercent?: boolean
}

const tooltipBoxStyle: React.CSSProperties = {
  backgroundColor: STATS_CHART_COLORS.tooltipBg,
  border: `1px solid ${STATS_CHART_COLORS.tooltipBorder}`,
  borderRadius: 4,
  fontSize: 13,
  color: STATS_CHART_COLORS.neutral,
  padding: '8px 12px',
  lineHeight: 1.45,
}

export default function StatsChartTooltip({
  active,
  payload,
  nameKey,
  seriesLabel,
  formatValue,
  showMonthDelta = false,
  monthDeltaByIndex,
  data,
  showPiePercent = false,
  valueKey = 'count',
}: StatsChartTooltipProps) {
  if (!active || !payload?.length) return null

  const item = payload[0]
  const row = item?.payload as Record<string, unknown> | undefined
  const category = String(row?.[nameKey] ?? item?.name ?? '')
  const value = item?.value
  const formatted = formatValue(value)

  const idx = row ? data.indexOf(row) : -1
  const delta = idx > 0 && monthDeltaByIndex ? monthDeltaByIndex.get(idx) : undefined

  let valueLine = `${seriesLabel}: ${formatted}`
  if (showPiePercent) {
    const total = data.reduce((sum, row) => sum + Number(row[valueKey] ?? 0), 0)
    const n = Number(value ?? 0)
    const pct = total > 0 ? Math.round((n / total) * 100) : 0
    valueLine = `${formatted} · ${pct}%`
  }

  return (
    <div className="stats-chart-tooltip" style={tooltipBoxStyle}>
      {category && <div style={{ fontWeight: 600, marginBottom: 4 }}>{category}</div>}
      <div>{valueLine}</div>
      {delta != null && showMonthDelta && (
        <div style={{ marginTop: 4, color: STATS_CHART_COLORS.axis }}>
          {`Δ к прошлому: ${delta >= 0 ? '+' : ''}${delta.toLocaleString('ru-RU')} ₽`}
        </div>
      )}
    </div>
  )
}
