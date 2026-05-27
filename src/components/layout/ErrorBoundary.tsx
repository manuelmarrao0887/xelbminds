import { Component, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

type Props = { children: ReactNode }
type State = { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: { componentStack?: string | null }): void {
    console.error('App error boundary caught:', error, info.componentStack)
  }

  render(): ReactNode {
    if (!this.state.error) return this.props.children
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-50 p-6">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-pop p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={26} />
          </div>
          <h1 className="text-xl font-display font-bold text-ink-900 mb-2">Algo correu mal</h1>
          <p className="text-sm text-ink-500 mb-1">{this.state.error.message}</p>
          <p className="text-xs text-ink-400 mb-6">Tente recarregar a página. Se persistir, abra Definições → Reset Demo.</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-5 h-10 rounded-xl bg-teal-600 text-white font-semibold hover:bg-teal-700 cursor-pointer"
          >
            <RefreshCw size={16} /> Recarregar
          </button>
        </div>
      </div>
    )
  }
}
