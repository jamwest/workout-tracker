import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SetRow } from './SetRow'
import type { Set } from '../types'

// ── Store mock ────────────────────────────────────────────────────────────────

const mockUpdateSet = vi.fn().mockResolvedValue(undefined)
const mockRemoveSet = vi.fn().mockResolvedValue(undefined)

vi.mock('../stores/useWorkoutStore', () => ({
  useWorkoutStore: vi.fn(
    (selector: (s: {
      updateSet: typeof mockUpdateSet
      removeSet: typeof mockRemoveSet
    }) => unknown) => selector({ updateSet: mockUpdateSet, removeSet: mockRemoveSet }),
  ),
}))

// ── Factory ───────────────────────────────────────────────────────────────────

function makeSet(overrides: Partial<Set> = {}): Set {
  return {
    id: crypto.randomUUID(),
    sessionExerciseId: crypto.randomUUID(),
    reps: 8,
    weight: 60,
    durationSeconds: null,
    completed: false,
    order: 0,
    ...overrides,
  }
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('SetRow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders Reps and Weight steppers for a weighted Set', () => {
    render(
      <SetRow
        set={makeSet({ reps: 8, weight: 60 })}
        exerciseType="weighted"
        sessionExerciseId="se-1"
      />,
    )

    expect(screen.getByRole('spinbutton', { name: /reps/i })).toBeInTheDocument()
    expect(screen.getByRole('spinbutton', { name: /weight/i })).toBeInTheDocument()
  })

  it('renders a Reps stepper only for a bodyweight Set', () => {
    render(
      <SetRow
        set={makeSet({ reps: 12, weight: null })}
        exerciseType="bodyweight"
        sessionExerciseId="se-1"
      />,
    )

    expect(screen.getByRole('spinbutton', { name: /reps/i })).toBeInTheDocument()
    expect(screen.queryByRole('spinbutton', { name: /weight/i })).not.toBeInTheDocument()
  })

  it('renders a Seconds stepper only for a timed Set', () => {
    render(
      <SetRow
        set={makeSet({ reps: null, weight: null, durationSeconds: 45 })}
        exerciseType="timed"
        sessionExerciseId="se-1"
      />,
    )

    expect(screen.getByRole('spinbutton', { name: /seconds/i })).toBeInTheDocument()
    expect(screen.queryByRole('spinbutton', { name: /reps/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('spinbutton', { name: /weight/i })).not.toBeInTheDocument()
  })

  it('clicking Done calls updateSet with completed toggled to true when Set is not done', async () => {
    const user = userEvent.setup()
    const set = makeSet({ completed: false })
    render(<SetRow set={set} exerciseType="weighted" sessionExerciseId="se-1" />)

    await user.click(screen.getByRole('button', { name: /done/i }))

    expect(mockUpdateSet).toHaveBeenCalledOnce()
    expect(mockUpdateSet).toHaveBeenCalledWith('se-1', set.id, { completed: true })
  })

  it('clicking Done calls updateSet with completed toggled to false when Set is already done', async () => {
    const user = userEvent.setup()
    const set = makeSet({ completed: true })
    render(<SetRow set={set} exerciseType="weighted" sessionExerciseId="se-1" />)

    await user.click(screen.getByRole('button', { name: /done/i }))

    expect(mockUpdateSet).toHaveBeenCalledOnce()
    expect(mockUpdateSet).toHaveBeenCalledWith('se-1', set.id, { completed: false })
  })

  it('clicking Remove calls removeSet with sessionExerciseId and set id', async () => {
    const user = userEvent.setup()
    const set = makeSet()
    render(<SetRow set={set} exerciseType="weighted" sessionExerciseId="se-1" />)

    await user.click(screen.getByRole('button', { name: /remove/i }))

    expect(mockRemoveSet).toHaveBeenCalledOnce()
    expect(mockRemoveSet).toHaveBeenCalledWith('se-1', set.id)
  })

  it('changing the Reps field calls updateSet with the new reps value', () => {
    const set = makeSet({ reps: 8 })
    render(<SetRow set={set} exerciseType="weighted" sessionExerciseId="se-1" />)

    fireEvent.change(screen.getByRole('spinbutton', { name: /reps/i }), {
      target: { value: '10' },
    })

    expect(mockUpdateSet).toHaveBeenCalledWith('se-1', set.id, { reps: 10 })
  })
})
