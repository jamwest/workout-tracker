import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RoutinesPage } from './Routines'
import type { Routine } from '../types'

// ── Store mock ────────────────────────────────────────────────────────────────

const mockRoutines: Routine[] = []

const mockStore = {
  routines: mockRoutines,
  activeSession: null,
  createRoutine: vi.fn().mockResolvedValue({}),
  startSession: vi.fn().mockResolvedValue({}),
  abandonSession: vi.fn().mockResolvedValue(undefined),
  removeRoutine: vi.fn().mockResolvedValue(undefined),
  addExercise: vi.fn().mockResolvedValue({}),
  removeExercise: vi.fn().mockResolvedValue(undefined),
  getExercisesForRoutine: vi.fn().mockResolvedValue([]),
}

vi.mock('../stores/useWorkoutStore', () => ({
  useWorkoutStore: vi.fn((selector: (s: typeof mockStore) => unknown) =>
    selector(mockStore),
  ),
}))

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

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('RoutinesPage', () => {
  beforeEach(() => {
    mockRoutines.length = 0
  })

  it('renders the page heading', () => {
    render(<RoutinesPage />)
    expect(screen.getByRole('heading', { name: /routines/i })).toBeInTheDocument()
  })

  it('renders one RoutineCard per routine in the store', () => {
    mockRoutines.push(makeRoutine({ name: 'Push Day' }), makeRoutine({ name: 'Pull Day' }))
    render(<RoutinesPage />)
    expect(screen.getAllByTestId('routine-card')).toHaveLength(2)
  })

  it('shows the empty-state prompt when there are no routines', () => {
    render(<RoutinesPage />)
    expect(screen.getByText(/no routines yet/i)).toBeInTheDocument()
  })

  it('hides the empty-state prompt when routines exist', () => {
    mockRoutines.push(makeRoutine({ name: 'Push Day' }))
    render(<RoutinesPage />)
    expect(screen.queryByText(/no routines yet/i)).not.toBeInTheDocument()
  })

  it('always shows NewRoutineForm regardless of whether routines exist', () => {
    render(<RoutinesPage />)
    expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument()
  })
})
