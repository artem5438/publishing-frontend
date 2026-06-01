import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export default class StatisticsErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Statistics tab render error', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="profile-order-card" style={{ padding: 20 }}>
          <h3 className="stats-chart-title" style={{ color: '#b00020' }}>
            Не удалось загрузить статистику
          </h3>
          <p className="admin-works-toolbar-meta" style={{ marginTop: 8 }}>
            Вкладки «Заказы» и «Услуги» по-прежнему доступны. Попробуйте обновить страницу.
          </p>
          <pre
            style={{
              whiteSpace: 'pre-wrap',
              background: '#f7f7f7',
              border: '1px solid #e8e8e8',
              borderRadius: 8,
              padding: 12,
              fontSize: 13,
              marginTop: 12,
            }}
          >
            {this.state.error.message}
          </pre>
          <button
            type="button"
            className="btn-profile-filter"
            style={{ marginTop: 16 }}
            onClick={() => this.setState({ error: null })}
          >
            Попробовать снова
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
