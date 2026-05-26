import { z } from "zod";

// ─── Exercise ────────────────────────────────────────────────────────────────

export const ExerciseTypeSchema = z.enum(["weighted", "bodyweight", "timed"]);
export type ExerciseType = z.infer<typeof ExerciseTypeSchema>;

export const ExerciseSchema = z.object({
  id: z.uuid(),
  routineId: z.uuid(),
  name: z.string().min(1),
  type: ExerciseTypeSchema,
  order: z.number().int().nonnegative(),
  createdAt: z.iso.datetime(),
});
export type Exercise = z.infer<typeof ExerciseSchema>;

// ─── Routine ─────────────────────────────────────────────────────────────────

export const RoutineSchema = z.object({
  id: z.uuid(),
  name: z.string().min(1),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export type Routine = z.infer<typeof RoutineSchema>;

// ─── Set ─────────────────────────────────────────────────────────────────────

export const SetSchema = z.object({
  id: z.uuid(),
  sessionExerciseId: z.uuid(),
  reps: z.number().int().nonnegative().nullable(), // null for timed sets
  weight: z.number().nonnegative().nullable(), // null for bodyweight
  durationSeconds: z.number().int().nonnegative().nullable(), // for timed
  completed: z.boolean(),
  order: z.number().int().nonnegative(),
});
export type Set = z.infer<typeof SetSchema>;

// ─── Session Exercise ─────────────────────────────────────────────────────────

export const SessionExerciseSchema = z.object({
  id: z.uuid(),
  sessionId: z.uuid(),
  exerciseId: z.uuid(),
  exerciseName: z.string(), // denormalised — name can change, history stays accurate
  exerciseType: ExerciseTypeSchema,
  order: z.number().int().nonnegative(),
  sets: z.array(SetSchema),
});
export type SessionExercise = z.infer<typeof SessionExerciseSchema>;

// ─── Session ─────────────────────────────────────────────────────────────────

export const SessionStatusSchema = z.enum(["active", "completed"]);
export type SessionStatus = z.infer<typeof SessionStatusSchema>;

export const SessionSchema = z.object({
  id: z.uuid(),
  routineId: z.uuid(),
  routineName: z.string(), // denormalised
  status: SessionStatusSchema,
  startedAt: z.iso.datetime(),
  completedAt: z.iso.datetime().nullable(),
  exercises: z.array(SessionExerciseSchema),
});
export type Session = z.infer<typeof SessionSchema>;

// ─── Form input types ─────────────────────────────────────────────────────────

export const NewRoutineSchema = z.object({
  name: z.string().min(1, "Name is required"),
});
export type NewRoutine = z.infer<typeof NewRoutineSchema>;

export const NewExerciseSchema = z.object({
  name: z.string().min(1, "Name is required"),
  type: ExerciseTypeSchema,
});
export type NewExercise = z.infer<typeof NewExerciseSchema>;
