import { Component, type ErrorInfo, type ReactNode } from 'react'

interface State {
  hasError: boolean
}

/**
 * Last line of defense: a render crash anywhere in the tree shows a friendly
 * recovery screen instead of a blank page. Progress is safe — it lives in
 * localStorage and the cloud backup.
 */
export default class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('App crash:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          dir="rtl"
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            padding: 24,
            textAlign: 'center',
            fontFamily: 'Assistant, sans-serif',
            background: '#FBFBFD',
            color: '#2B2D42',
          }}
        >
          <div style={{ fontSize: 56 }}>🛠️</div>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0 }}>משהו השתבש</h1>
          <p style={{ margin: 0, color: '#5C6072', maxWidth: 320 }}>
            אל דאגה — ההתקדמות שלכם שמורה. רעננו את הדף כדי להמשיך.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: 8,
              padding: '14px 28px',
              borderRadius: 16,
              border: 'none',
              background: '#58CC02',
              color: '#fff',
              fontSize: 17,
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            רענון הדף
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
