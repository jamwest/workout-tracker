import { useState } from 'react'
import type { Routine, Exercise, ExerciseType } from '../types'
import { Button, Card } from './ui'
import { AddExerciseForm } from './AddExerciseForm'
import { ConfirmDialog } from './ConfirmDialog'

const TYPE_LABELS: Record<ExerciseType, string> = {
  weighted: 'Weighted',
  bodyweight: 'Bodyweight',
  timed: 'Timed',
}

interface Props {
  routine: Routine
  exerciseCount: number
  exercises?: Exercise[]
  onStartSession?: () => Promise<void>
  /** Provided only when an ActiveSession exists — its presence triggers the abandon confirmation. */
  onAbandonSession?: () => Promise<void>
  onRemoveRoutine?: () => Promise<void>
  onAddExercise?: (name: string, type: ExerciseType) => Promise<void>
  onRemoveExercise?: (exercise: Exercise) => Promise<void>
}

export function RoutineCard({
  routine,
  exerciseCount,
  exercises = [],
  onStartSession,
  onAbandonSession,
  onRemoveRoutine,
  onAddExercise,
  onRemoveExercise,
}: Readonly<Props>) {
  const [expanded, setExpanded] = useState(false)
  const [abandonDialogOpen, setAbandonDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const countLabel = exerciseCount === 1 ? '1 exercise' : `${exerciseCount} exercises`

  async function handleStartWorkout() {
    if (onAbandonSession) {
      setAbandonDialogOpen(true)
    } else {
      await onStartSession?.()
    }
  }

  async function handleAbandonConfirm() {
    setAbandonDialogOpen(false)
    await onAbandonSession?.()
    await onStartSession?.()
  }

  function handleAbandonCancel() {
    setAbandonDialogOpen(false)
  }

  async function handleDeleteConfirm() {
    setDeleteDialogOpen(false)
    await onRemoveRoutine?.()
  }

  function handleDeleteCancel() {
    setDeleteDialogOpen(false)
  }

  return (
    <Card data-testid="routine-card">
      <Button
        variant="ghost"
        aria-expanded={expanded}
        onClick={() => setExpanded((prev) => !prev)}
      >
        <span>{routine.name}</span>
        <span>{countLabel}</span>
        <span aria-hidden className={`chevron${expanded ? ' chevron--open' : ''}`}>›</span>
      </Button>

      {expanded && (
        <div>
          <ul>
            {exercises.map((ex) => (
              <li key={ex.id}>
                <span>{ex.name}</span>
                <span>{TYPE_LABELS[ex.type]}</span>
                {onRemoveExercise && (
                  <Button variant="ghost" onClick={() => onRemoveExercise(ex)}>
                    Delete exercise
                  </Button>
                )}
              </li>
            ))}
          </ul>
          {onAddExercise && (
            <AddExerciseForm routineId={routine.id} onAdd={onAddExercise} />
          )}
          <Button variant="primary" onClick={handleStartWorkout}>Start Workout</Button>
          <Button variant="danger" onClick={() => setDeleteDialogOpen(true)}>Delete Routine</Button>
        </div>
      )}

      <ConfirmDialog
        open={abandonDialogOpen}
        title="Abandon current session?"
        message="Your current session will be saved as incomplete."
        onConfirm={handleAbandonConfirm}
        onCancel={handleAbandonCancel}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete routine?"
        message="This will permanently remove the routine and all its exercises."
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </Card>
  )
}
