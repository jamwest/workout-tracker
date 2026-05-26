import { useEffect, useState, useCallback } from 'react'
import type { Exercise } from '../types'
import { useWorkoutStore } from '../stores/useWorkoutStore'
import { RoutineCard } from '../components/RoutineCard'
import { NewRoutineForm } from '../components/NewRoutineForm'

export function RoutinesPage() {
  const routines = useWorkoutStore((s) => s.routines)
  const activeSession = useWorkoutStore((s) => s.activeSession)
  const createRoutine = useWorkoutStore((s) => s.createRoutine)
  const startSession = useWorkoutStore((s) => s.startSession)
  const abandonSession = useWorkoutStore((s) => s.abandonSession)
  const removeRoutine = useWorkoutStore((s) => s.removeRoutine)
  const addExercise = useWorkoutStore((s) => s.addExercise)
  const removeExercise = useWorkoutStore((s) => s.removeExercise)
  const getExercisesForRoutine = useWorkoutStore((s) => s.getExercisesForRoutine)

  const [exercisesMap, setExercisesMap] = useState<Record<string, Exercise[]>>({})

  const refreshExercises = useCallback(
    async (routineId: string) => {
      const exercises = await getExercisesForRoutine(routineId)
      setExercisesMap((prev) => ({ ...prev, [routineId]: exercises }))
    },
    [getExercisesForRoutine],
  )

  useEffect(() => {
    routines.forEach((r) => { void refreshExercises(r.id) })
  }, [routines, refreshExercises])

  return (
    <div className="page">
      <div className="row-between">
        <h1>Routines</h1>
      </div>
      {routines.length === 0 ? (
        <p>No routines yet — create your first one below.</p>
      ) : (
        routines.map((routine) => {
          const exercises = exercisesMap[routine.id] ?? []
          return (
            <RoutineCard
              key={routine.id}
              routine={routine}
              exerciseCount={exercises.length}
              exercises={exercises}
              onStartSession={() => startSession(routine).then(() => {})}
              onAbandonSession={activeSession ? () => abandonSession() : undefined}
              onRemoveRoutine={() => removeRoutine(routine.id)}
              onAddExercise={async (name, type) => {
                await addExercise(routine.id, name, type)
                await refreshExercises(routine.id)
              }}
              onRemoveExercise={async (exercise) => {
                await removeExercise(exercise)
                await refreshExercises(routine.id)
              }}
            />
          )
        })
      )}
      <NewRoutineForm onCreate={createRoutine} />
    </div>
  )
}
