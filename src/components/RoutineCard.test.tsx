import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { RoutineCard } from './RoutineCard'
import type { Routine, Exercise } from '../types'

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeRoutine(overrides: Partial<Routine> = {}): Routine {
  return {
    id: crypto.randomUUID(),
    name: 'Push Day',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }
}

function makeExercise(overrides: Partial<Exercise> = {}): Exercise {
  return {
    id: crypto.randomUUID(),
    routineId: crypto.randomUUID(),
    name: 'Bench Press',
    type: 'weighted',
    order: 0,
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

const noop = async () => {}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('RoutineCard', () => {
  it('renders the routine name', () => {
    render(<RoutineCard routine={makeRoutine({ name: 'Push Day' })} exerciseCount={3} />)
    expect(screen.getByText('Push Day')).toBeInTheDocument()
  })

  it('renders the exercise count', () => {
    render(<RoutineCard routine={makeRoutine()} exerciseCount={4} />)
    expect(screen.getByText(/4 exercises/i)).toBeInTheDocument()
  })

  it('renders "1 exercise" (singular) when count is 1', () => {
    render(<RoutineCard routine={makeRoutine()} exerciseCount={1} />)
    expect(screen.getByText(/1 exercise/i)).toBeInTheDocument()
  })

  it('is collapsed by default', () => {
    render(<RoutineCard routine={makeRoutine()} exerciseCount={2} />)
    expect(screen.getByRole('button')).toHaveAttribute('aria-expanded', 'false')
  })

  it('expands when the header button is clicked', async () => {
    const user = userEvent.setup()
    render(<RoutineCard routine={makeRoutine()} exerciseCount={2} />)
    const toggle = screen.getByRole('button', { name: /push day/i })
    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
  })

  it('collapses again on a second click', async () => {
    const user = userEvent.setup()
    render(<RoutineCard routine={makeRoutine()} exerciseCount={2} />)
    const toggle = screen.getByRole('button', { name: /push day/i })
    await user.click(toggle)
    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
  })

  // ── Expanded state ────────────────────────────────────────────────────────

  it('lists exercise names when expanded', async () => {
    const user = userEvent.setup()
    const exercises = [
      makeExercise({ name: 'Bench Press' }),
      makeExercise({ name: 'Overhead Press' }),
    ]
    render(
      <RoutineCard
        routine={makeRoutine()}
        exerciseCount={2}
        exercises={exercises}
        onStartSession={noop}
        onRemoveRoutine={noop}
      />,
    )
    await user.click(screen.getByRole('button', { name: /push day/i }))
    expect(screen.getByText('Bench Press')).toBeInTheDocument()
    expect(screen.getByText('Overhead Press')).toBeInTheDocument()
  })

  it('shows the ExerciseType label for each exercise when expanded', async () => {
    const user = userEvent.setup()
    const exercises = [
      makeExercise({ name: 'Squat', type: 'weighted' }),
      makeExercise({ name: 'Pull-up', type: 'bodyweight' }),
      makeExercise({ name: 'Plank', type: 'timed' }),
    ]
    render(
      <RoutineCard
        routine={makeRoutine()}
        exerciseCount={3}
        exercises={exercises}
        onStartSession={noop}
        onRemoveRoutine={noop}
      />,
    )
    await user.click(screen.getByRole('button', { name: /push day/i }))
    expect(screen.getByText('Weighted')).toBeInTheDocument()
    expect(screen.getByText('Bodyweight')).toBeInTheDocument()
    expect(screen.getByText('Timed')).toBeInTheDocument()
  })

  it('shows Start Workout and Delete Routine buttons when expanded', async () => {
    const user = userEvent.setup()
    render(
      <RoutineCard
        routine={makeRoutine()}
        exerciseCount={0}
        exercises={[]}
        onStartSession={noop}
        onRemoveRoutine={noop}
      />,
    )
    await user.click(screen.getByRole('button', { name: /push day/i }))
    expect(screen.getByRole('button', { name: /start workout/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /delete routine/i })).toBeInTheDocument()
  })

  it('calls onStartSession when Start Workout is clicked', async () => {
    const user = userEvent.setup()
    const onStartSession = vi.fn().mockResolvedValue(undefined)
    render(
      <RoutineCard
        routine={makeRoutine()}
        exerciseCount={0}
        exercises={[]}
        onStartSession={onStartSession}
        onRemoveRoutine={noop}
      />,
    )
    await user.click(screen.getByRole('button', { name: /push day/i }))
    await user.click(screen.getByRole('button', { name: /start workout/i }))
    expect(onStartSession).toHaveBeenCalledOnce()
  })

  it('calls onRemoveRoutine after confirming the delete dialog', async () => {
    const user = userEvent.setup()
    const onRemoveRoutine = vi.fn().mockResolvedValue(undefined)
    render(
      <RoutineCard
        routine={makeRoutine()}
        exerciseCount={0}
        exercises={[]}
        onStartSession={noop}
        onRemoveRoutine={onRemoveRoutine}
      />,
    )
    await user.click(screen.getByRole('button', { name: /push day/i }))
    await user.click(screen.getByRole('button', { name: /delete routine/i }))
    await user.click(screen.getByRole('button', { name: /confirm/i }))
    expect(onRemoveRoutine).toHaveBeenCalledOnce()
  })

  // ── Abandon-session confirmation ──────────────────────────────────────────

  it('shows the abandon-session dialog when Start Workout is tapped with an active session', async () => {
    const user = userEvent.setup()
    render(
      <RoutineCard
        routine={makeRoutine()}
        exerciseCount={0}
        exercises={[]}
        onStartSession={noop}
        onAbandonSession={noop}
        onRemoveRoutine={noop}
      />,
    )
    await user.click(screen.getByRole('button', { name: /push day/i }))
    await user.click(screen.getByRole('button', { name: /start workout/i }))
    expect(screen.getByText(/abandon/i)).toBeInTheDocument()
  })

  it('calls onStartSession directly when there is no active session', async () => {
    const user = userEvent.setup()
    const onStartSession = vi.fn().mockResolvedValue(undefined)
    render(
      <RoutineCard
        routine={makeRoutine()}
        exerciseCount={0}
        exercises={[]}
        onStartSession={onStartSession}
        onRemoveRoutine={noop}
      />,
    )
    await user.click(screen.getByRole('button', { name: /push day/i }))
    await user.click(screen.getByRole('button', { name: /start workout/i }))
    expect(onStartSession).toHaveBeenCalledOnce()
  })

  it('calls onAbandonSession then onStartSession when the dialog is confirmed', async () => {
    const user = userEvent.setup()
    const calls: string[] = []
    const onAbandonSession = vi.fn().mockImplementation(async () => { calls.push('abandon') })
    const onStartSession = vi.fn().mockImplementation(async () => { calls.push('start') })
    render(
      <RoutineCard
        routine={makeRoutine()}
        exerciseCount={0}
        exercises={[]}
        onStartSession={onStartSession}
        onAbandonSession={onAbandonSession}
        onRemoveRoutine={noop}
      />,
    )
    await user.click(screen.getByRole('button', { name: /push day/i }))
    await user.click(screen.getByRole('button', { name: /start workout/i }))
    await user.click(screen.getByRole('button', { name: /confirm/i }))
    expect(calls).toEqual(['abandon', 'start'])
  })

  it('does not call onAbandonSession or onStartSession when the dialog is cancelled', async () => {
    const user = userEvent.setup()
    const onAbandonSession = vi.fn()
    const onStartSession = vi.fn()
    render(
      <RoutineCard
        routine={makeRoutine()}
        exerciseCount={0}
        exercises={[]}
        onStartSession={onStartSession}
        onAbandonSession={onAbandonSession}
        onRemoveRoutine={noop}
      />,
    )
    await user.click(screen.getByRole('button', { name: /push day/i }))
    await user.click(screen.getByRole('button', { name: /start workout/i }))
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onAbandonSession).not.toHaveBeenCalled()
    expect(onStartSession).not.toHaveBeenCalled()
  })

  // ── Routine-delete confirmation ───────────────────────────────────────────

  it('shows the delete-routine dialog when Delete Routine is tapped', async () => {
    const user = userEvent.setup()
    render(
      <RoutineCard
        routine={makeRoutine()}
        exerciseCount={0}
        exercises={[]}
        onStartSession={noop}
        onRemoveRoutine={noop}
      />,
    )
    await user.click(screen.getByRole('button', { name: /push day/i }))
    await user.click(screen.getByRole('button', { name: /delete routine/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('does not call onRemoveRoutine when the delete dialog is cancelled', async () => {
    const user = userEvent.setup()
    const onRemoveRoutine = vi.fn()
    render(
      <RoutineCard
        routine={makeRoutine()}
        exerciseCount={0}
        exercises={[]}
        onStartSession={noop}
        onRemoveRoutine={onRemoveRoutine}
      />,
    )
    await user.click(screen.getByRole('button', { name: /push day/i }))
    await user.click(screen.getByRole('button', { name: /delete routine/i }))
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onRemoveRoutine).not.toHaveBeenCalled()
  })
})
