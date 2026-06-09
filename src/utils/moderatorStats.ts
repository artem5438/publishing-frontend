import type { Order, Work } from '../types'
import { getOrderStatusInfo } from './orderStatus'

export interface StatsDateRange {
  dateFrom: string
  dateTo: string
}

export type StatsPeriodPreset = 'all' | 'last30' | 'thisMonth' | 'lastMonth' | 'custom'

export type StatsTimeGranularity = 'month' | 'week'

export interface StatsFilters {
  dateFrom: string
  dateTo: string
  preset: StatsPeriodPreset
  status: StatsStatusFilter
  creatorLogin: string
}

export const STATS_PERIOD_PRESET_LABELS: Record<StatsPeriodPreset, string> = {
  all: 'За всё время',
  last30: 'Последние 30 дней',
  thisMonth: 'Этот месяц',
  lastMonth: 'Прошлый месяц',
  custom: 'Произвольный',
}

export type StatsStatusFilter = '' | 'formed' | 'completed' | 'rejected'

export const STATS_STATUS_FILTER_LABELS: Record<StatsStatusFilter, string> = {
  '': 'Все',
  formed: 'На рассмотрении',
  completed: 'Выполнен',
  rejected: 'Отклонён',
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

export interface StatusByMonthRow {
  label: string
  periodKey: string
  formed: number
  completed: number
  rejected: number
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

/** Уникальный цвет для каждого элемента на одной диаграмме (без циклического повтора). */
export function getDistinctChartColor(index: number): string {
  if (index >= 0 && index < CHART_PALETTE.length) return CHART_PALETTE[index]
  const hue = (index * 47) % 360
  return `hsl(${hue}, 55%, 42%)`
}

export type StatusGroupMode = 'all' | StatsTimeGranularity

export const STATUS_GROUP_LABELS: Record<StatusGroupMode, string> = {
  all: 'Всего',
  month: 'По месяцам',
  week: 'По неделям',
}

function orderPeriodKey(order: Order, granularity: StatsTimeGranularity): string | null {
  const ref = getOrderReferenceDate(order)
  if (!ref) return null
  return periodKeyFromDate(ref, granularity)
}

export function filterOrdersByStatsPeriod(
  orders: Order[],
  periodKey: string,
  granularity: StatsTimeGranularity,
): Order[] {
  if (!periodKey) return []
  return orders.filter((o) => orderPeriodKey(o, granularity) === periodKey)
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
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim())
  if (!m) return null
  const y = Number(m[1])
  const mo = Number(m[2]) - 1
  const d = Number(m[3])
  return endOfDay
    ? new Date(y, mo, d, 23, 59, 59, 999)
    : new Date(y, mo, d, 0, 0, 0, 0)
}

function toIsoDate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function resolvePeriodPreset(preset: StatsPeriodPreset): StatsDateRange {
  const now = new Date()
  if (preset === 'all') return { dateFrom: '', dateTo: '' }
  if (preset === 'last30') {
    const from = new Date(now)
    from.setDate(from.getDate() - 29)
    from.setHours(0, 0, 0, 0)
    return { dateFrom: toIsoDate(from), dateTo: toIsoDate(now) }
  }
  if (preset === 'thisMonth') {
    const from = new Date(now.getFullYear(), now.getMonth(), 1)
    return { dateFrom: toIsoDate(from), dateTo: toIsoDate(now) }
  }
  if (preset === 'lastMonth') {
    const from = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const to = new Date(now.getFullYear(), now.getMonth(), 0)
    return { dateFrom: toIsoDate(from), dateTo: toIsoDate(to) }
  }
  return { dateFrom: '', dateTo: '' }
}

export function isStatsDateRangeInvalid(dateFrom: string, dateTo: string): boolean {
  if (!dateFrom.trim() || !dateTo.trim()) return false
  const from = parseDateInput(dateFrom, false)
  const to = parseDateInput(dateTo, true)
  if (!from || !to) return false
  return from > to
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

export function filterOrdersForStats(orders: Order[], filters: StatsFilters): Order[] {
  let result = filterOrdersByPeriod(orders, {
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
  })
  if (filters.status) {
    result = result.filter((o) => o.status === filters.status)
  }
  const login = filters.creatorLogin.trim().toLowerCase()
  if (login) {
    result = result.filter((o) => (o.creator_login ?? '').toLowerCase().includes(login))
  }
  return result
}

/** Завершённые метрики недоступны при фильтре только formed/rejected */
export function statsCompletedMetricsBlocked(filters: StatsFilters): boolean {
  return filters.status === 'formed' || filters.status === 'rejected'
}

export function formatPeriodLabel(range: StatsDateRange): string {
  if (range.dateFrom && range.dateTo) {
    return `${formatRuDate(range.dateFrom)} — ${formatRuDate(range.dateTo)}`
  }
  if (range.dateFrom) return `с ${formatRuDate(range.dateFrom)}`
  if (range.dateTo) return `по ${formatRuDate(range.dateTo)}`
  return 'за всё время'
}

export function formatStatsContextLabel(filters: StatsFilters): string {
  const parts: string[] = []
  if (filters.preset !== 'custom' && filters.preset !== 'all') {
    parts.push(STATS_PERIOD_PRESET_LABELS[filters.preset])
  } else {
    parts.push(formatPeriodLabel({ dateFrom: filters.dateFrom, dateTo: filters.dateTo }))
  }
  if (filters.status) {
    parts.push(STATS_STATUS_FILTER_LABELS[filters.status])
  }
  const login = filters.creatorLogin.trim()
  if (login) parts.push(`создатель: ${login}`)
  return parts.join(' · ')
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

function weekKeyFromDate(d: Date): string {
  const copy = new Date(d)
  copy.setHours(0, 0, 0, 0)
  const day = copy.getDay()
  const diff = day === 0 ? -6 : 1 - day
  copy.setDate(copy.getDate() + diff)
  return toIsoDate(copy)
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

function weekLabelFromKey(key: string): string {
  const start = new Date(key)
  if (Number.isNaN(start.getTime())) return key
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  const fmt = (d: Date) =>
    d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
  return `${fmt(start)} — ${fmt(end)}`
}

function periodKeyFromDate(d: Date, granularity: StatsTimeGranularity): string {
  return granularity === 'week' ? weekKeyFromDate(d) : monthKeyFromDate(d)
}

function periodLabelFromKey(key: string, granularity: StatsTimeGranularity): string {
  return granularity === 'week' ? weekLabelFromKey(key) : monthLabelFromKey(key)
}

function aggregateByPeriod(
  orders: Order[],
  valueFn: (order: Order) => number,
  granularity: StatsTimeGranularity,
): MonthPoint[] {
  const map = new Map<string, number>()
  for (const order of orders) {
    const ref = getOrderReferenceDate(order)
    if (!ref) continue
    const key = periodKeyFromDate(ref, granularity)
    map.set(key, (map.get(key) ?? 0) + valueFn(order))
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([periodKey, value]) => ({
      monthKey: periodKey,
      label: periodLabelFromKey(periodKey, granularity),
      value,
    }))
}

export function groupOrdersByMonth(orders: Order[], granularity: StatsTimeGranularity = 'month'): MonthPoint[] {
  return aggregateByPeriod(orders, () => 1, granularity)
}

export function groupCirculationByMonth(
  orders: Order[],
  granularity: StatsTimeGranularity = 'month',
): MonthPoint[] {
  const completed = orders.filter((o) => o.status === 'completed')
  return aggregateByPeriod(completed, (o) => o.circulation ?? 0, granularity)
}

export function groupRevenueByMonth(
  orders: Order[],
  granularity: StatsTimeGranularity = 'month',
): MonthPoint[] {
  const completed = orders.filter((o) => o.status === 'completed')
  return aggregateByPeriod(completed, (o) => o.total_price ?? 0, granularity)
}

export function groupAvgCheckByMonth(
  orders: Order[],
  granularity: StatsTimeGranularity = 'month',
): MonthPoint[] {
  const completed = orders.filter((o) => o.status === 'completed')
  const revenueMap = new Map<string, number>()
  const countMap = new Map<string, number>()
  for (const order of completed) {
    const ref = getOrderReferenceDate(order)
    if (!ref) continue
    const key = periodKeyFromDate(ref, granularity)
    revenueMap.set(key, (revenueMap.get(key) ?? 0) + (order.total_price ?? 0))
    countMap.set(key, (countMap.get(key) ?? 0) + 1)
  }
  const keys = [...new Set([...revenueMap.keys(), ...countMap.keys()])].sort()
  return keys.map((periodKey) => {
    const rev = revenueMap.get(periodKey) ?? 0
    const cnt = countMap.get(periodKey) ?? 0
    const value = cnt > 0 ? Math.round(rev / cnt) : 0
    return {
      monthKey: periodKey,
      label: periodLabelFromKey(periodKey, granularity),
      value,
    }
  })
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

export function statusByMonthBreakdown(
  orders: Order[],
  granularity: StatsTimeGranularity = 'month',
): StatusByMonthRow[] {
  const map = new Map<string, StatusByMonthRow>()
  const statuses = ['formed', 'completed', 'rejected'] as const

  for (const order of orders) {
    const ref = getOrderReferenceDate(order)
    if (!ref || !statuses.includes(order.status as (typeof statuses)[number])) continue
    const key = periodKeyFromDate(ref, granularity)
    if (!map.has(key)) {
      map.set(key, {
        periodKey: key,
        label: periodLabelFromKey(key, granularity),
        formed: 0,
        completed: 0,
        rejected: 0,
      })
    }
    const row = map.get(key)!
    if (order.status === 'formed') row.formed += 1
    else if (order.status === 'completed') row.completed += 1
    else if (order.status === 'rejected') row.rejected += 1
  }

  return [...map.values()].sort((a, b) => a.periodKey.localeCompare(b.periodKey))
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

export function topCreatorsByOrders(orders: Order[], limit = 5): NamedCount[] {
  const map = new Map<string, number>()
  for (const order of orders) {
    const login = order.creator_login?.trim() || 'Без логина'
    map.set(login, (map.get(login) ?? 0) + 1)
  }
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }))
}

export function ordersHaveWorksDetail(orders: Order[]): boolean {
  return orders.some((o) => (o.works?.length ?? 0) > 0)
}

export const STATUS_STACK_SERIES = [
  { key: 'formed' as const, label: 'На рассмотрении', color: getOrderStatusInfo('formed').color },
  { key: 'completed' as const, label: 'Выполнен', color: getOrderStatusInfo('completed').color },
  { key: 'rejected' as const, label: 'Отклонён', color: getOrderStatusInfo('rejected').color },
]
