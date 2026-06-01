import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export default class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('App render error', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div
          className="profile-page-wrapper"
          style={{ paddingTop: 32, paddingBottom: 32 }}
        >
          <h2 style={{ color: '#b00020', marginBottom: 12 }}>Ошибка интерфейса</h2>
          <p style={{ marginBottom: 12 }}>
            Страница не загрузилась. Попробуйте обновить вкладку или открыть сайт в режиме
            инкогнито (особенно после перезапуска демо-туннеля).
          </p>
          <pre
            style={{
              whiteSpace: 'pre-wrap',
              background: '#f7f7f7',
              border: '1px solid #e8e8e8',
              borderRadius: 8,
              padding: 12,
              fontSize: 13,
            }}
          >
            {this.state.error.message}
          </pre>
          <button
            type="button"
            className="btn-profile-filter"
            style={{ marginTop: 16 }}
            onClick={() => window.location.reload()}
          >
            Обновить страницу
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
