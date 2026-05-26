import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from './routes/routes'
import { ensureSeed } from './services/db'

export function App() {
  useEffect(() => {
    ensureSeed()
  }, [])
  return <RouterProvider router={router} />
}
