# Workout Tracker

A personal PWA for logging gym workouts. Users build Routines of Exercises, then start Sessions to record Sets in real time. All data lives in IndexedDB on-device; cloud sync is a future consideration.

## Language

### Templates

**Routine**:
A named, reusable template that defines which Exercises to perform. Created once and used to start many Sessions.
_Avoid_: Workout plan, program, template

**Exercise**:
A named movement within a Routine, with a fixed type (weighted, bodyweight, or timed). Order within the Routine is tracked via `order`.
_Avoid_: Movement, lift, activity

**ExerciseType**:
An enum that determines which fields a Set captures. `weighted` → reps + weight; `bodyweight` → reps only; `timed` → duration only.
_Avoid_: Category, modality

### In-session

**Session**:
A single workout instance started from a Routine. Captures a snapshot of the Routine's Exercises at start time and records Sets against them. Status is either `active` (in progress) or `completed`.
_Avoid_: Workout, log entry, record

**SessionExercise**:
A denormalised copy of an Exercise within a Session. `exerciseName` and `exerciseType` are frozen at session-start so history stays accurate even if the Routine is later edited.
_Avoid_: Exercise instance, exercise entry

**Set**:
One instance of work for a SessionExercise — e.g. "3 reps at 80 kg" or "45 seconds". Fields not relevant to the ExerciseType are `null`.
_Avoid_: Rep, round, work set

**ActiveSession**:
The single Session with status `active`. Only one can exist at a time. Starting a new Session while one is active requires explicitly abandoning the current one.
_Avoid_: Current session, open session, live session

### Actions

**Start Workout**:
The action of creating a new Session from a Routine. Carries forward Set values from the last completed Session for the same Routine as defaults.
_Avoid_: Begin session, open session

**Complete Session**:
Marking an ActiveSession as done. Sets `status = completed` and records `completedAt`.
_Avoid_: Finish workout, end session, save session

**Abandon Session**:
Ending an ActiveSession without explicitly finishing it — e.g. when starting a different Routine mid-session. The Session is saved as `completed` in history but treated as incomplete.
_Avoid_: Cancel, discard, delete session

## Example dialogue

> **Dev:** "If I rename an Exercise in a Routine, does the history change?"
>
> **Domain expert:** "No — the SessionExercise stores `exerciseName` directly, so past Sessions show the name as it was when the workout happened."

> **Dev:** "What if I tap 'Start Workout' while I'm mid-session on a different Routine?"
>
> **Domain expert:** "You'll be asked to confirm. If you proceed, the current ActiveSession is Abandoned and a new Session starts from the chosen Routine."

> **Dev:** "Can I have two active Sessions?"
>
> **Domain expert:** "No. There's exactly one ActiveSession at any time, or none."
