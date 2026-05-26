import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useWorkoutStore } from './stores/useWorkoutStore'
import { BottomNav } from './components/BottomNav'
import { RoutinesPage } from './pages/Routines'
import { SessionPage } from './pages/Session'
import { HistoryPage } from './pages/History'

export function App() {
  const init = useWorkoutStore((s) => s.init)
  const isLoading = useWorkoutStore((s) => s.isLoading)
  const error = useWorkoutStore((s) => s.error)

  useEffect(() => {
    init()
  }, [init])

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <span style={{ color: 'var(--text-3)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
          loading...
        </span>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <p style={{ color: 'var(--danger)' }}>Failed to open database: {error}</p>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RoutinesPage />} />
        <Route path="/session" element={<SessionPage />} />
        <Route path="/session/:sessionId" element={<SessionPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <BottomNav />
    </BrowserRouter>
  )
}
