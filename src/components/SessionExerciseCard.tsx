import type { ExerciseType, SessionExercise } from '../types'
import { Card, Button } from './ui'
import { SetRow } from './SetRow'
import { useWorkoutStore } from '../stores/useWorkoutStore'
import styles from './SessionExerciseCard.module.css'

const TYPE_LABELS: Record<ExerciseType, string> = {
  weighted: 'Weighted',
  bodyweight: 'Bodyweight',
  timed: 'Timed',
}

interface Props {
  sessionExercise: SessionExercise
}

export function SessionExerciseCard({ sessionExercise }: Readonly<Props>) {
  const addSet = useWorkoutStore((s) => s.addSet)

  return (
    <Card data-testid="session-exercise-card" className={styles.card}>
      <div className={styles.header}>
        <span className={styles.name}>{sessionExercise.exerciseName}</span>
        <span className={styles.typeLabel}>
          {TYPE_LABELS[sessionExercise.exerciseType]}
        </span>
      </div>

      <div className={styles.sets}>
        {sessionExercise.sets.map((set) => (
          <SetRow
            key={set.id}
            set={set}
            exerciseType={sessionExercise.exerciseType}
            sessionExerciseId={sessionExercise.id}
          />
        ))}
      </div>

      <Button
        variant="ghost"
        onClick={() => void addSet(sessionExercise.id)}
      >
        Add Set
      </Button>
    </Card>
  )
}
