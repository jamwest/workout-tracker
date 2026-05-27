import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useWorkoutStore } from './useWorkoutStore'
import type { Session, SessionExercise, Set } from '../types'

// ── DB mock ───────────────────────────────────────────────────────────────────

const mockSaveSession = vi.fn().mockResolvedValue(undefined)

vi.mock('../db', () => ({
  getRoutines: vi.fn().mockResolvedValue([]),
  saveRoutine: vi.fn().mockResolvedValue(undefined),
  deleteRoutine: vi.fn().mockResolvedValue(undefined),
  getExercisesForRoutine: vi.fn().mockResolvedValue([]),
  saveExercise: vi.fn().mockResolvedValue(undefined),
  deleteExercise: vi.fn().mockResolvedValue(undefined),
  getLastCompletedSession: vi.fn().mockResolvedValue(null),
  getActiveSession: vi.fn().mockResolvedValue(null),
  saveSession: (...args: unknown[]) => mockSaveSession(...args),
  getSessions: vi.fn().mockResolvedValue([]),
}))

// ── Factories ─────────────────────────────────────────────────────────────────

function makeSet(overrides: Partial<Set> = {}): Set {
  return {
    id: crypto.randomUUID(),
    sessionExerciseId: crypto.randomUUID(),
    reps: 8,
    weight: null,
    durationSeconds: null,
    completed: false,
    order: 0,
    ...overrides,
  }
}

function makeSessionExercise(
  overrides: Partial<SessionExercise> = {},
): SessionExercise {
  return {
    id: crypto.randomUUID(),
    sessionId: crypto.randomUUID(),
    exerciseId: crypto.randomUUID(),
    exerciseName: 'Squat',
    exerciseType: 'weighted',
    order: 0,
    sets: [],
    ...overrides,
  }
}

function makeSession(overrides: Partial<Session> = {}): Session {
  return {
    id: crypto.randomUUID(),
    routineId: crypto.randomUUID(),
    routineName: 'Push Day',
    status: 'active',
    startedAt: new Date().toISOString(),
    completedAt: null,
    exercises: [],
    ...overrides,
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useWorkoutStore — removeSet', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useWorkoutStore.setState({ activeSession: null })
  })

  it('removes the target Set from the matching SessionExercise', async () => {
    const targetSet = makeSet()
    const otherSet = makeSet({ order: 1 })
    const sessionExercise = makeSessionExercise({ sets: [targetSet, otherSet] })
    const session = makeSession({ exercises: [sessionExercise] })

    useWorkoutStore.setState({ activeSession: session })

    await useWorkoutStore.getState().removeSet(sessionExercise.id, targetSet.id)

    const updated = useWorkoutStore.getState().activeSession
    expect(updated?.exercises[0].sets).toHaveLength(1)
    expect(updated?.exercises[0].sets[0].id).toBe(otherSet.id)
  })

  it('persists the updated Session via saveSession', async () => {
    const targetSet = makeSet()
    const sessionExercise = makeSessionExercise({ sets: [targetSet] })
    const session = makeSession({ exercises: [sessionExercise] })

    useWorkoutStore.setState({ activeSession: session })

    await useWorkoutStore.getState().removeSet(sessionExercise.id, targetSet.id)

    expect(mockSaveSession).toHaveBeenCalledOnce()
    const saved = mockSaveSession.mock.calls[0][0]
    expect(saved.exercises[0].sets).toHaveLength(0)
  })

  it('does nothing when there is no ActiveSession', async () => {
    await useWorkoutStore.getState().removeSet('any-se-id', 'any-set-id')

    expect(mockSaveSession).not.toHaveBeenCalled()
    expect(useWorkoutStore.getState().activeSession).toBeNull()
  })

  it('leaves Sets in other SessionExercises untouched', async () => {
    const targetSet = makeSet()
    const unrelatedSet = makeSet()
    const targetExercise = makeSessionExercise({ order: 0, sets: [targetSet] })
    const otherExercise = makeSessionExercise({ order: 1, sets: [unrelatedSet] })
    const session = makeSession({ exercises: [targetExercise, otherExercise] })

    useWorkoutStore.setState({ activeSession: session })

    await useWorkoutStore.getState().removeSet(targetExercise.id, targetSet.id)

    const updated = useWorkoutStore.getState().activeSession
    expect(updated?.exercises[1].sets).toHaveLength(1)
    expect(updated?.exercises[1].sets[0].id).toBe(unrelatedSet.id)
  })
})
