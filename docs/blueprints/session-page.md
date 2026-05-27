---
title: Session Page
date: 2026-05-27
status: in-progress
issue: GH-20
---

## Problem Statement

The app can create Routines and start Sessions, but the Session page is a stub.
Once a user taps "Start Workout" there is nowhere to go — they cannot log a single
Set. The core loop of the app (Routine → Session → Sets) is broken at its most
important step.

## Solution

Implement the Session page at `/session`. The page displays the ActiveSession's
Exercises as a scrollable list of cards. Each card expands its Sets as inline rows
with editable fields driven by ExerciseType: reps + weight for `weighted`, reps
only for `bodyweight`, duration in seconds for `timed`. A done toggle per Set
tracks completion without gating progress. Users can add and remove Sets per
Exercise. A persistent footer carries the Complete Session action and a summary of
done Sets; Abandon Session sits as a secondary action with a confirmation step.

A new `NumberStepper` component lands in `src/components/ui/` first, providing
`−` / value / `+` controls suited to one-handed phone use mid-workout. A single new
store action — `removeSet` — is the only data-layer addition; all other session
logic is already implemented.

When no ActiveSession exists, the route redirects immediately to `/` so the page
is never seen empty.

## User Stories

1. As a user, when I tap "Start Workout" on a RoutineCard I am taken to the Session
   page and can see all the Routine's Exercises ready to log.
2. As a user, I want to see each Exercise's name and type on the Session page so I
   know what fields to fill in for each Set.
3. As a user, I want to log a Set by entering the relevant values (reps, weight, or
   duration) and marking it done, so the app records my work.
4. As a user, I want to adjust a rep count or weight with `−` and `+` buttons so I
   can make small changes without pulling up the keyboard.
5. As a user, I want to add an extra Set to any Exercise mid-session, so I can do
   more work than the default.
6. As a user, I want to remove a Set I added by mistake, so the session stays tidy.
7. As a user, I want to see how many Sets I've completed out of the total so I know
   how much of the workout is left.
8. As a user, I want to tap "Complete Session" at any time to finish the workout,
   whether or not every Set is marked done.
9. As a user, I want to Abandon the Session with a confirmation step so I don't
   accidentally lose an in-progress workout.
10. As a user, if I navigate away mid-session, I want the BottomNav indicator to
    bring me straight back to my active Session.
11. As a user, if I navigate to `/session` with no active Session, I am redirected
    to the Routines page immediately.

## Design Decisions

**NumberStepper in `src/components/ui/`.**  Gym logging involves many small
incremental adjustments (−2.5 kg, +1 rep). A stepper with `−` and `+` flanking the
value eliminates keyboard friction for the common case; tapping the value itself
still opens the keyboard for arbitrary entry. Required by ADR-0001 to live in the
component layer before use anywhere in feature code.

**Done toggle is a progress indicator, not a gate.** Complete Session is always
tappable regardless of how many Sets are marked done. Real workouts are non-linear
— users cut sets, skip exercises, or simply don't tick every box. Blocking
completion on 100% done-rate would frustrate and patronise. The summary line
("X of Y sets completed") provides feedback without gatekeeping.

**Abandon requires confirmation; Complete does not.** Completing a session is
the happy path — data is already saved Set-by-Set, so there is nothing to lose.
Abandoning discards the intent of a session in progress; a single confirmation
matches the pattern already established on the Routines page for destructive
actions.

**Scrollable list, not a step-by-step wizard.** Gym workouts are non-linear.
Users superset exercises, skip ahead, or revisit a previous exercise. A wizard
enforces an order that doesn't match reality; a scrollable list lets the user work
in whatever sequence makes sense.

**No live timer for timed exercises.** `ExerciseType.timed` records
`durationSeconds` as a plain number. A live countdown/stopwatch requires background
timer state, screen-lock resilience, and navigation-away handling — a feature scope
of its own. Users type the duration manually for now. Tracked as out of scope.

**`removeSet` is the only new store action.** `startSession`, `updateSet`,
`addSet`, `completeSession`, and `abandonSession` are all already in
`useWorkoutStore`. Adding `removeSet(sessionExerciseId, setId)` is a one-method
addition that persists the updated Session via `saveSession`, matching the existing
pattern exactly.

**Redirect on no ActiveSession.** `/session` without an ActiveSession has no
useful content. Redirecting to `/` immediately keeps the routing model simple and
means the Session page never needs to render an empty state.

## Work Items

- **`removeSet` store action**: add `removeSet(sessionExerciseId, setId)` to
  `useWorkoutStore`; filter the set from the matching `SessionExercise` and persist
  via `saveSession`
- **`NumberStepper` UI component**: `src/components/ui/NumberStepper.tsx` +
  `NumberStepper.module.css`; props: `value`, `onChange`, `min?`, `step?`,
  `label` (for accessibility); `−` and `+` buttons with tappable value display
- **`SessionPage`**: replace stub; read `activeSession` from store; redirect to `/`
  if null; render page header (Routine name) + exercise list + footer
- **`SessionExerciseCard`**: exercise name, type label, Set list, Add Set button;
  maps over `sessionExercise.sets`
- **`SetRow`**: renders fields by `exerciseType` using `NumberStepper`; done toggle;
  remove button (calls `removeSet`)
- **Session footer**: "X of Y sets completed" summary + Complete Session button
  (primary); calls `completeSession` then navigates to `/`
- **Abandon control**: secondary button in page header or above footer; opens
  `ConfirmDialog`; calls `abandonSession` then navigates to `/`

## Out of Scope

- Live countdown or stopwatch for timed exercises
- Rest timer between Sets
- Reordering Exercises within a Session
- Per-Set or per-Exercise notes
- Editing the Routine (name, exercise list) from within a Session
- History page implementation
- Cloud sync or any remote data layer

## Open Questions

None — all design decisions resolved in the grill session.

## References

- Domain vocabulary: [`CONTEXT.md`](../../CONTEXT.md)
- UI component layer: [`docs/adr/0001-ui-component-layer.md`](../adr/0001-ui-component-layer.md)
- Upstream blueprint: [`docs/blueprints/routines-page.md`](./routines-page.md)
