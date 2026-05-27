import type { Set, ExerciseType } from '../types'
import { Button, NumberStepper } from './ui'
import { useWorkoutStore } from '../stores/useWorkoutStore'
import styles from './SetRow.module.css'

interface Props {
  set: Set
  exerciseType: ExerciseType
  sessionExerciseId: string
}

export function SetRow({ set, exerciseType, sessionExerciseId }: Readonly<Props>) {
  const updateSet = useWorkoutStore((s) => s.updateSet)
  const removeSet = useWorkoutStore((s) => s.removeSet)

  return (
    <div className={styles.row} data-testid="set-row">
      <div className={styles.fields}>
        {(exerciseType === 'weighted' || exerciseType === 'bodyweight') && (
          <NumberStepper
            value={set.reps ?? 0}
            min={0}
            label="Reps"
            onChange={(v) => void updateSet(sessionExerciseId, set.id, { reps: v })}
          />
        )}
        {exerciseType === 'weighted' && (
          <NumberStepper
            value={set.weight ?? 0}
            min={0}
            step={2.5}
            label="Weight"
            onChange={(v) => void updateSet(sessionExerciseId, set.id, { weight: v })}
          />
        )}
        {exerciseType === 'timed' && (
          <NumberStepper
            value={set.durationSeconds ?? 0}
            min={0}
            step={1}
            label="Seconds"
            onChange={(v) => void updateSet(sessionExerciseId, set.id, { durationSeconds: v })}
          />
        )}
      </div>

      <div className={styles.actions}>
        <Button
          variant={set.completed ? 'primary' : 'ghost'}
          aria-pressed={set.completed}
          onClick={() => void updateSet(sessionExerciseId, set.id, { completed: !set.completed })}
        >
          Done
        </Button>
        <Button
          variant="danger"
          onClick={() => void removeSet(sessionExerciseId, set.id)}
        >
          Remove
        </Button>
      </div>
    </div>
  )
}
