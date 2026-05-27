import { create } from "zustand";
import { v4 as uuid } from "uuid";
import {
  type Routine,
  type Exercise,
  type Session,
  type SessionExercise,
  type Set,
  type ExerciseType,
} from "../types";
import {
  getRoutines,
  saveRoutine,
  deleteRoutine as dbDeleteRoutine,
  getExercisesForRoutine,
  saveExercise,
  deleteExercise as dbDeleteExercise,
  getLastCompletedSession,
  getActiveSession,
  saveSession,
  getSessions,
} from "../db";

// ─── State shape ──────────────────────────────────────────────────────────────

interface WorkoutState {
  // Data
  routines: Routine[];
  sessions: Session[];
  activeSession: Session | null;

  // UI
  isLoading: boolean;
  error: string | null;

  // Bootstrap
  init: () => Promise<void>;

  // Routines
  createRoutine: (name: string) => Promise<Routine>;
  removeRoutine: (id: string) => Promise<void>;

  // Exercises
  addExercise: (
    routineId: string,
    name: string,
    type: ExerciseType,
  ) => Promise<Exercise>;
  removeExercise: (exercise: Exercise) => Promise<void>;
  getExercisesForRoutine: (routineId: string) => Promise<Exercise[]>;

  // Sessions
  startSession: (routine: Routine) => Promise<Session>;
  updateSet: (
    sessionExerciseId: string,
    setId: string,
    updates: Partial<Set>,
  ) => Promise<void>;
  addSet: (sessionExerciseId: string) => Promise<void>;
  removeSet: (sessionExerciseId: string, setId: string) => Promise<void>;
  completeSession: () => Promise<void>;
  abandonSession: () => Promise<void>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function now(): string {
  return new Date().toISOString();
}

function buildDefaultSets(type: ExerciseType, count = 3): Set[] {
  return Array.from({ length: count }, (_, i) => ({
    id: uuid(),
    sessionExerciseId: "", // filled in after sessionExercise is created
    reps: type === "timed" ? null : 8,
    weight: type === "weighted" ? 0 : null,
    durationSeconds: type === "timed" ? 30 : null,
    completed: false,
    order: i,
  }));
}

function buildSessionFromLast(
  routine: Routine,
  exercises: Exercise[],
  lastSession: Session | null,
): Session {
  const sessionId = uuid();

  const sessionExercises: SessionExercise[] = exercises.map(
    (exercise, exerciseIdx) => {
      const sessionExerciseId = uuid();

      // Find matching exercise in last session to carry forward sets
      const lastExercise = lastSession?.exercises.find(
        (e) => e.exerciseId === exercise.id,
      );

      const sets: Set[] = lastExercise
        ? lastExercise.sets.map((s, i) => ({
            ...s,
            id: uuid(),
            sessionExerciseId,
            completed: false, // always start fresh
            order: i,
          }))
        : buildDefaultSets(exercise.type).map((s) => ({
            ...s,
            sessionExerciseId,
          }));

      return {
        id: sessionExerciseId,
        sessionId,
        exerciseId: exercise.id,
        exerciseName: exercise.name,
        exerciseType: exercise.type,
        order: exerciseIdx,
        sets,
      };
    },
  );

  return {
    id: sessionId,
    routineId: routine.id,
    routineName: routine.name,
    status: "active",
    startedAt: now(),
    completedAt: null,
    exercises: sessionExercises,
  };
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  routines: [],
  sessions: [],
  activeSession: null,
  isLoading: false,
  error: null,

  init: async () => {
    set({ isLoading: true, error: null });
    try {
      const [routines, sessions, activeSession] = await Promise.all([
        getRoutines(),
        getSessions(),
        getActiveSession(),
      ]);
      set({ routines, sessions, activeSession, isLoading: false });
    } catch (e) {
      set({ error: String(e), isLoading: false });
    }
  },

  // ── Routines ──

  createRoutine: async (name) => {
    const routine: Routine = {
      id: uuid(),
      name,
      createdAt: now(),
      updatedAt: now(),
    };
    await saveRoutine(routine);
    set((s) => ({ routines: [...s.routines, routine] }));
    return routine;
  },

  removeRoutine: async (id) => {
    await dbDeleteRoutine(id);
    set((s) => ({ routines: s.routines.filter((r) => r.id !== id) }));
  },

  // ── Exercises ──

  getExercisesForRoutine,

  addExercise: async (routineId, name, type) => {
    const exercises = await getExercisesForRoutine(routineId);
    const exercise: Exercise = {
      id: uuid(),
      routineId,
      name,
      type,
      order: exercises.length,
      createdAt: now(),
    };
    await saveExercise(exercise);
    return exercise;
  },

  removeExercise: async (exercise) => {
    await dbDeleteExercise(exercise.id);
  },

  // ── Sessions ──

  startSession: async (routine) => {
    const [exercises, lastSession] = await Promise.all([
      getExercisesForRoutine(routine.id),
      getLastCompletedSession(routine.id),
    ]);

    const session = buildSessionFromLast(routine, exercises, lastSession);
    await saveSession(session);
    set({ activeSession: session });
    return session;
  },

  updateSet: async (sessionExerciseId, setId, updates) => {
    const { activeSession } = get();
    if (!activeSession) return;

    const updatedSession: Session = {
      ...activeSession,
      exercises: activeSession.exercises.map((ex) =>
        ex.id === sessionExerciseId
          ? {
              ...ex,
              sets: ex.sets.map((s) =>
                s.id === setId ? { ...s, ...updates } : s,
              ),
            }
          : ex,
      ),
    };

    await saveSession(updatedSession);
    set({ activeSession: updatedSession });
  },

  addSet: async (sessionExerciseId) => {
    const { activeSession } = get();
    if (!activeSession) return;

    const exercise = activeSession.exercises.find(
      (e) => e.id === sessionExerciseId,
    );
    if (!exercise) return;

    const lastSet = exercise.sets.at(-1);
    const newSet: Set = {
      id: uuid(),
      sessionExerciseId,
      reps: lastSet?.reps ?? 8,
      weight: lastSet?.weight ?? null,
      durationSeconds: lastSet?.durationSeconds ?? null,
      completed: false,
      order: exercise.sets.length,
    };

    const updatedSession: Session = {
      ...activeSession,
      exercises: activeSession.exercises.map((ex) =>
        ex.id === sessionExerciseId
          ? { ...ex, sets: [...ex.sets, newSet] }
          : ex,
      ),
    };

    await saveSession(updatedSession);
    set({ activeSession: updatedSession });
  },

  removeSet: async (sessionExerciseId, setId) => {
    const { activeSession } = get();
    if (!activeSession) return;

    const updatedSession: Session = {
      ...activeSession,
      exercises: activeSession.exercises.map((ex) =>
        ex.id === sessionExerciseId
          ? { ...ex, sets: ex.sets.filter((s) => s.id !== setId) }
          : ex,
      ),
    };

    await saveSession(updatedSession);
    set({ activeSession: updatedSession });
  },

  completeSession: async () => {
    const { activeSession } = get();
    if (!activeSession) return;

    const completed: Session = {
      ...activeSession,
      status: "completed",
      completedAt: now(),
    };

    await saveSession(completed);
    set((s) => ({
      activeSession: null,
      sessions: [completed, ...s.sessions.filter((s) => s.id !== completed.id)],
    }));
  },

  abandonSession: async () => {
    const { activeSession } = get();
    if (!activeSession) return;
    // Keep it in history as-is but mark completed so it doesn't re-surface as active
    const abandoned: Session = {
      ...activeSession,
      status: "completed",
      completedAt: now(),
    };
    await saveSession(abandoned);
    set((s) => ({
      activeSession: null,
      sessions: [abandoned, ...s.sessions.filter((s) => s.id !== abandoned.id)],
    }));
  },
}));
