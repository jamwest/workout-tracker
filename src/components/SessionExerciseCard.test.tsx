import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SessionExerciseCard } from './SessionExerciseCard'
import type { SessionExercise, Set } from '../types'

// ── Store mock ────────────────────────────────────────────────────────────────

const mockAddSet = vi.fn()

vi.mock('../stores/useWorkoutStore', () => ({
  useWorkoutStore: vi.fn((selector: (s: { addSet: typeof mockAddSet }) => unknown) =>
    selector({ addSet: mockAddSet }),
  ),
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

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('SessionExerciseCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('displays the exercise name', () => {
    render(<SessionExerciseCard sessionExercise={makeSessionExercise({ exerciseName: 'Bench Press' })} />)

    expect(screen.getByText('Bench Press')).toBeInTheDocument()
  })

  it('displays the exercise type label', () => {
    render(
      <SessionExerciseCard
        sessionExercise={makeSessionExercise({ exerciseType: 'weighted' })}
      />,
    )

    expect(screen.getByText('Weighted')).toBeInTheDocument()
  })

  it('renders one SetRow per Set in the SessionExercise', () => {
    const sets = [makeSet({ order: 0 }), makeSet({ order: 1 }), makeSet({ order: 2 })]
    render(
      <SessionExerciseCard
        sessionExercise={makeSessionExercise({ sets })}
      />,
    )

    expect(screen.getAllByTestId('set-row')).toHaveLength(3)
  })

  it('renders an "Add Set" button', () => {
    render(<SessionExerciseCard sessionExercise={makeSessionExercise()} />)

    expect(screen.getByRole('button', { name: /add set/i })).toBeInTheDocument()
  })

  it('calls addSet with the SessionExercise id when "Add Set" is clicked', async () => {
    const user = userEvent.setup()
    const sessionExercise = makeSessionExercise()
    render(<SessionExerciseCard sessionExercise={sessionExercise} />)

    await user.click(screen.getByRole('button', { name: /add set/i }))

    expect(mockAddSet).toHaveBeenCalledOnce()
    expect(mockAddSet).toHaveBeenCalledWith(sessionExercise.id)
  })
})
