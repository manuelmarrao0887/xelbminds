import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './routes/routes'
import { ensureSeed } from './services/db'
import { ErrorBoundary } from './components/layout/ErrorBoundary'

export function App() {
  useEffect(() => {
    ensureSeed()
  }, [])
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  )
}
