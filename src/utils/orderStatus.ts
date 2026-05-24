export const ORDER_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft: { label: 'Черновик', color: '#999' },
  formed: { label: 'На рассмотрении', color: '#f59e0b' },
  completed: { label: 'Выполнен', color: '#22c55e' },
  rejected: { label: 'Отклонён', color: '#e53935' },
}

export function getOrderStatusLabel(status: string): string {
  return ORDER_STATUS_LABELS[status]?.label ?? status
}

export function getOrderStatusInfo(status: string): { label: string; color: string } {
  return ORDER_STATUS_LABELS[status] ?? { label: status, color: '#999' }
}
