import type { Order, Work } from '../types'
import { getOrderStatusInfo } from './orderStatus'

export interface StatsDateRange {
  dateFrom: string
  dateTo: string
}

export interface KpiMetrics {
  totalOrders: number
  formedCount: number
  completedCount: number
  rejectedCount: number
  totalCirculation: number
  totalRevenue: number
  avgCirculation: number
  activeWorksCount: number
  rejectionRatePercent: number | null
}

export interface MonthPoint {
  monthKey: string
  label: string
  value: number
}

export interface StatusSlice {
  status: string
  label: string
  count: number
  color: string
}

export interface NamedCount {
  name: string
  count: number
}

const CHART_NEUTRAL = '#1C1C1C'
const CHART_NEUTRAL_ALT = '#666666'

export const WORK_TYPE_COLORS: Record<string, string> = {
  Печать: '#1C1C1C',
  Переплёт: '#f59e0b',
  Допечать: '#22c55e',
  Дизайн: '#6366f1',
  Оформление: '#e53935',
}

export const CHART_PALETTE = ['#1C1C1C', '#f59e0b', '#22c55e', '#6366f1', '#e53935', '#0ea5e9', '#a855f7']

export const TOP_WORK_COLORS = ['#1C1C1C', '#f59e0b', '#6366f1']

export function getWorkTypeColor(name: string, index: number): string {
  return WORK_TYPE_COLORS[name] ?? CHART_PALETTE[index % CHART_PALETTE.length]
}

export const STATS_CHART_COLORS = {
  neutral: CHART_NEUTRAL,
  neutralAlt: CHART_NEUTRAL_ALT,
  grid: '#E8E8E8',
  axis: '#666666',
  tooltipBg: '#FFFFFF',
  tooltipBorder: '#E8E8E8',
}

export function getOrderReferenceDate(order: Order): Date | null {
  const raw = order.formed_at ?? order.created_at
  if (!raw) return null
  const d = new Date(raw)
  return Number.isNaN(d.getTime()) ? null : d
}

function parseDateInput(value: string, endOfDay: boolean): Date | null {
  if (!value.trim()) return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  if (endOfDay) {
    d.setHours(23, 59, 59, 999)
  } else {
    d.setHours(0, 0, 0, 0)
  }
  return d
}

export function filterOrdersByPeriod(orders: Order[], range: StatsDateRange): Order[] {
  const from = parseDateInput(range.dateFrom, false)
  const to = parseDateInput(range.dateTo, true)
  if (!from && !to) return orders

  return orders.filter((order) => {
    const ref = getOrderReferenceDate(order)
    if (!ref) return false
    if (from && ref < from) return false
    if (to && ref > to) return false
    return true
  })
}

export function formatPeriodLabel(range: StatsDateRange): string {
  if (range.dateFrom && range.dateTo) {
    return `${formatRuDate(range.dateFrom)} — ${formatRuDate(range.dateTo)}`
  }
  if (range.dateFrom) return `с ${formatRuDate(range.dateFrom)}`
  if (range.dateTo) return `по ${formatRuDate(range.dateTo)}`
  return 'за всё время'
}

function formatRuDate(isoDate: string): string {
  const d = new Date(isoDate)
  if (Number.isNaN(d.getTime())) return isoDate
  return d.toLocaleDateString('ru-RU')
}

export function computeKpis(orders: Order[], works: Work[]): KpiMetrics {
  const formedCount = orders.filter((o) => o.status === 'formed').length
  const completedCount = orders.filter((o) => o.status === 'completed').length
  const rejectedCount = orders.filter((o) => o.status === 'rejected').length
  const completed = orders.filter((o) => o.status === 'completed')

  const totalCirculation = completed.reduce((sum, o) => sum + (o.circulation ?? 0), 0)
  const totalRevenue = completed.reduce((sum, o) => sum + (o.total_price ?? 0), 0)
  const avgCirculation =
    completed.length > 0 ? Math.round(totalCirculation / completed.length) : 0

  const moderated = completedCount + rejectedCount
  const rejectionRatePercent =
    moderated > 0 ? Math.round((rejectedCount / moderated) * 100) : null

  return {
    totalOrders: orders.length,
    formedCount,
    completedCount,
    rejectedCount,
    totalCirculation,
    totalRevenue,
    avgCirculation,
    activeWorksCount: works.length,
    rejectionRatePercent,
  }
}

function monthKeyFromDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

function monthLabelFromKey(key: string): string {
  const [y, m] = key.split('-')
  const monthNames = [
    'янв',
    'фев',
    'мар',
    'апр',
    'май',
    'июн',
    'июл',
    'авг',
    'сен',
    'окт',
    'ноя',
    'дек',
  ]
  const idx = Number(m) - 1
  return `${monthNames[idx] ?? m} ${y}`
}

function aggregateByMonth(
  orders: Order[],
  valueFn: (order: Order) => number,
): MonthPoint[] {
  const map = new Map<string, number>()
  for (const order of orders) {
    const ref = getOrderReferenceDate(order)
    if (!ref) continue
    const key = monthKeyFromDate(ref)
    map.set(key, (map.get(key) ?? 0) + valueFn(order))
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([monthKey, value]) => ({
      monthKey,
      label: monthLabelFromKey(monthKey),
      value,
    }))
}

export function groupOrdersByMonth(orders: Order[]): MonthPoint[] {
  return aggregateByMonth(orders, () => 1)
}

export function groupCirculationByMonth(orders: Order[]): MonthPoint[] {
  const completed = orders.filter((o) => o.status === 'completed')
  return aggregateByMonth(completed, (o) => o.circulation ?? 0)
}

export function groupRevenueByMonth(orders: Order[]): MonthPoint[] {
  const completed = orders.filter((o) => o.status === 'completed')
  return aggregateByMonth(completed, (o) => o.total_price ?? 0)
}

export function statusBreakdown(orders: Order[]): StatusSlice[] {
  const statuses = ['formed', 'completed', 'rejected'] as const
  return statuses.map((status) => {
    const info = getOrderStatusInfo(status)
    return {
      status,
      label: info.label,
      count: orders.filter((o) => o.status === status).length,
      color: info.color,
    }
  })
}

export function workTypeBreakdown(works: Work[]): NamedCount[] {
  const map = new Map<string, number>()
  for (const work of works) {
    const type = work.work_type?.trim() || 'Без типа'
    map.set(type, (map.get(type) ?? 0) + 1)
  }
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }))
}

export function topWorksByQuantity(orders: Order[], limit = 3): NamedCount[] {
  const map = new Map<string, number>()
  let hasWorks = false
  for (const order of orders) {
    if (!order.works?.length) continue
    hasWorks = true
    for (const line of order.works) {
      const name = line.work_name?.trim() || `Услуга #${line.work_id}`
      map.set(name, (map.get(name) ?? 0) + (line.quantity ?? 1))
    }
  }
  if (!hasWorks) return []
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }))
}

export function ordersHaveWorksDetail(orders: Order[]): boolean {
  return orders.some((o) => (o.works?.length ?? 0) > 0)
}
