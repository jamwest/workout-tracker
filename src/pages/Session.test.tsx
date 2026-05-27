import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { SessionPage } from './Session'
import type { Session, SessionExercise, Set } from '../types'

// ── Store mock ────────────────────────────────────────────────────────────────

const mockCompleteSession = vi.fn().mockResolvedValue(undefined)
const mockAbandonSession = vi.fn().mockResolvedValue(undefined)

const mockStore = {
  activeSession: null as Session | null,
  completeSession: mockCompleteSession,
  abandonSession: mockAbandonSession,
}

vi.mock('../stores/useWorkoutStore', () => ({
  useWorkoutStore: vi.fn((selector: (s: typeof mockStore) => unknown) =>
    selector(mockStore),
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

// ── Helpers ───────────────────────────────────────────────────────────────────

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/session']}>
      <Routes>
        <Route path="/session" element={<SessionPage />} />
        <Route path="/" element={<div>routines page</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('SessionPage', () => {
  beforeEach(() => {
    mockStore.activeSession = null
    vi.clearAllMocks()
  })

  it('renders the Routine name in the page header when an ActiveSession exists', () => {
    mockStore.activeSession = makeSession({ routineName: 'Push Day' })
    renderPage()

    expect(screen.getByRole('heading', { name: 'Push Day' })).toBeInTheDocument()
  })

  it('redirects to / when there is no ActiveSession', () => {
    // mockStore.activeSession is already null from beforeEach
    renderPage()

    expect(screen.getByText('routines page')).toBeInTheDocument()
    expect(screen.queryByRole('heading')).not.toBeInTheDocument()
  })

  it('renders one SessionExerciseCard per exercise in the ActiveSession', () => {
    mockStore.activeSession = makeSession({
      exercises: [
        makeSessionExercise({ exerciseName: 'Squat' }),
        makeSessionExercise({ exerciseName: 'Bench Press' }),
        makeSessionExercise({ exerciseName: 'Deadlift' }),
      ],
    })
    renderPage()

    expect(screen.getAllByTestId('session-exercise-card')).toHaveLength(3)
  })

  it('renders a "Complete Session" button in the footer', () => {
    mockStore.activeSession = makeSession()
    renderPage()

    expect(
      screen.getByRole('button', { name: /complete session/i }),
    ).toBeInTheDocument()
  })

  it('shows "X of Y sets completed" with counts derived from the ActiveSession', () => {
    mockStore.activeSession = makeSession({
      exercises: [
        makeSessionExercise({
          sets: [
            makeSet({ completed: true }),
            makeSet({ completed: false }),
            makeSet({ completed: true }),
          ],
        }),
        makeSessionExercise({
          sets: [makeSet({ completed: false }), makeSet({ completed: false })],
        }),
      ],
    })
    renderPage()

    expect(screen.getByText('2 of 5 sets completed')).toBeInTheDocument()
  })

  it('"Complete Session" is never disabled regardless of how many Sets are done', () => {
    mockStore.activeSession = makeSession({
      exercises: [
        makeSessionExercise({
          sets: [makeSet({ completed: false }), makeSet({ completed: false })],
        }),
      ],
    })
    renderPage()

    expect(
      screen.getByRole('button', { name: /complete session/i }),
    ).toBeEnabled()
  })

  it('clicking "Complete Session" calls completeSession and navigates to /', async () => {
    const user = userEvent.setup()
    mockStore.activeSession = makeSession()
    renderPage()

    await user.click(screen.getByRole('button', { name: /complete session/i }))

    expect(mockCompleteSession).toHaveBeenCalledOnce()
    expect(screen.getByText('routines page')).toBeInTheDocument()
  })

  it('renders an "Abandon" button in the page header', () => {
    mockStore.activeSession = makeSession()
    renderPage()

    expect(screen.getByRole('button', { name: /abandon/i })).toBeInTheDocument()
  })

  it('clicking Abandon opens the confirmation dialog', async () => {
    const user = userEvent.setup()
    mockStore.activeSession = makeSession()
    renderPage()

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /abandon/i }))

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText(/abandon this session/i)).toBeInTheDocument()
  })

  it('confirming in the dialog calls abandonSession and navigates to /', async () => {
    const user = userEvent.setup()
    mockStore.activeSession = makeSession()
    renderPage()

    await user.click(screen.getByRole('button', { name: /abandon/i }))
    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: /abandon/i }))

    expect(mockAbandonSession).toHaveBeenCalledOnce()
    expect(screen.getByText('routines page')).toBeInTheDocument()
  })

  it('cancelling in the dialog closes it without calling abandonSession', async () => {
    const user = userEvent.setup()
    mockStore.activeSession = makeSession()
    renderPage()

    await user.click(screen.getByRole('button', { name: /abandon/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: /keep going/i }))

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(mockAbandonSession).not.toHaveBeenCalled()
  })
})
