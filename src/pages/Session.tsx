import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useWorkoutStore } from '../stores/useWorkoutStore'
import { SessionExerciseCard } from '../components/SessionExerciseCard'
import { Button, Dialog } from '../components/ui'
import styles from './Session.module.css'

export function SessionPage() {
  const activeSession = useWorkoutStore((s) => s.activeSession)
  const completeSession = useWorkoutStore((s) => s.completeSession)
  const abandonSession = useWorkoutStore((s) => s.abandonSession)
  const navigate = useNavigate()

  const [abandonDialogOpen, setAbandonDialogOpen] = useState(false)

  if (!activeSession) return <Navigate to="/" replace />

  const allSets = activeSession.exercises.flatMap((ex) => ex.sets)
  const completedCount = allSets.filter((s) => s.completed).length
  const totalCount = allSets.length

  async function handleComplete() {
    await completeSession()
    navigate('/')
  }

  async function handleAbandonConfirm() {
    setAbandonDialogOpen(false)
    await abandonSession()
    navigate('/')
  }

  return (
    <div className="page">
      <header className={styles.header}>
        <h1>{activeSession.routineName}</h1>
        <Button variant="danger" onClick={() => setAbandonDialogOpen(true)}>
          Abandon
        </Button>
      </header>

      <div className={styles.exerciseList}>
        {activeSession.exercises.map((ex) => (
          <SessionExerciseCard key={ex.id} sessionExercise={ex} />
        ))}
      </div>

      <footer className={styles.footer}>
        <span className={styles.summary}>
          {completedCount} of {totalCount} sets completed
        </span>
        <Button variant="primary" size="full" onClick={() => void handleComplete()}>
          Complete Session
        </Button>
      </footer>

      <Dialog
        open={abandonDialogOpen}
        title="Abandon this session?"
        description="The session will be saved as incomplete."
        confirmLabel="Abandon"
        cancelLabel="Keep going"
        onConfirm={() => void handleAbandonConfirm()}
        onCancel={() => setAbandonDialogOpen(false)}
      />
    </div>
  )
}
