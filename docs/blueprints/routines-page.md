---
title: Routines Page
date: 2026-05-26
status: in-progress
issue: GH-1
---

## Problem Statement

The app has a complete data layer — Routines, Exercises, Sessions, and Sets are all
modelled, stored, and managed in the Zustand store — but every page is a stub that
renders placeholder text. There is no way to create or manage Routines, which means
there is also no way to start a Session or see any History. The app is currently
non-functional for its primary purpose: logging gym workouts.

## Solution

Implement the Routines page at the root route (`/`). The page lists all Routines as
expandable cards. Tapping a card reveals its Exercises inline, along with controls to
add/delete Exercises and start a Session. A persistent "New Routine" form at the bottom
of the list lets users create Routines without navigating away.

No new store actions, DB operations, or dependencies are required — all business logic
is already wired up. This feature is purely UI work against an existing, complete
data layer.

## User Stories

1. As a user, I want to see all my Routines listed on the home screen, so I know at
   a glance what workouts I have set up.
2. As a user, I want to tap a Routine card to expand it inline and see its Exercises,
   so I can review what's in a Routine without leaving the page.
3. As a user, I want to see each Exercise's name and type (Weighted / Bodyweight /
   Timed) in the expanded card, so I know what kind of Sets each Exercise expects.
4. As a user, I want to create a new Routine by entering a name and pressing Create,
   so I can set up a new workout template.
5. As a user, I want to add an Exercise to a Routine from the expanded card, so I can
   build out the Routine's Exercise list.
6. As a user, I want to choose an ExerciseType (Weighted / Bodyweight / Timed) when
   adding an Exercise, so the Session knows which fields to capture.
7. As a user, I want to delete an Exercise from a Routine immediately (no
   confirmation), so I can quickly fix mistakes.
8. As a user, I want to delete a Routine with a confirmation step, so I don't
   accidentally destroy a Routine I've been using.
9. As a user, I want to tap "Start Workout" on a Routine card to begin a Session,
   so I can start logging sets immediately.
10. As a user, if I tap "Start Workout" while an ActiveSession already exists, I want
    to see a confirmation dialog before the current Session is Abandoned, so I don't
    accidentally lose in-progress workout data.
11. As a user, I want the Routines page to show an empty state with a prompt to create
    my first Routine, so the app doesn't feel broken on first launch.

## Design Decisions

**Inline expand, not a detail route.** Routines are shallow (name → flat Exercise
list), so a full navigation push adds friction without adding clarity. Inline expand
keeps the interaction on one screen, which is appropriate for a PWA installed on a
phone. Revisit if nested config (e.g. Exercise ordering, per-exercise notes) is added
later.

**No rename or reorder in this iteration.** The store has no `updateRoutine` or
`updateExercise` action yet. Both would require inline edit UX and additional store
work. Deliberate omission — delete-and-recreate is sufficient for a personal app with
a small number of Routines. Tracked as out of scope.

**Abandon confirmation on Start Workout.** The store allows only one ActiveSession.
Silently overwriting an in-progress Session would be a data-loss bug from the user's
perspective. A single confirmation dialog is the cheapest safeguard.

**Routine delete requires confirmation; Exercise delete does not.** Deleting a Routine
cascades to all its Exercises and is irreversible. Exercises are cheap to recreate.
Applying confirmation symmetrically to both would be friction without benefit.

**All store actions are pre-built.** `createRoutine`, `removeRoutine`, `addExercise`,
`removeExercise`, `startSession`, `abandonSession`, `getExercisesForRoutine` are all
in `useWorkoutStore`. This feature introduces no new data-layer work.

## Work Items

- **RoutinesPage:** scaffold component, replace stub
- **RoutineCard:** collapsed state (name + exercise count + expand chevron)
- **RoutineCard expanded state:** Exercise list, add-exercise form, Start Workout button, delete Routine button
- **ExerciseTypeSelector:** segmented control for Weighted / Bodyweight / Timed
- **AddExerciseForm:** name input + ExerciseTypeSelector + Add button, inline in expanded card
- **NewRoutineForm:** name input + Create button, persistent at bottom of list
- **Empty state:** shown when `routines.length === 0`
- **ConfirmDialog:** reusable confirmation dialog component
- **Abandon confirmation:** shown when Start Workout is tapped with an ActiveSession present; uses ConfirmDialog
- **Routine delete confirmation:** uses ConfirmDialog

## Out of Scope

- Rename or reorder Routines
- Rename, reorder, or edit Exercise type after creation
- Session page implementation
- History page implementation
- Cloud sync or any remote data layer
- PWA install prompt or service worker configuration
- Exercise library / search (all Exercises are entered manually per Routine)

## Open Questions

None — all design decisions were resolved in the grill session.

## References

- Domain vocabulary: [`CONTEXT.md`](../../CONTEXT.md)
