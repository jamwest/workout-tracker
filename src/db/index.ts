import { openDB as idbOpen, type IDBPDatabase, type IDBPTransaction } from 'idb'
import {
  RoutineSchema,
  ExerciseSchema,
  SessionSchema,
  type Routine,
  type Exercise,
  type Session,
} from '../types'

// ─── Constants ────────────────────────────────────────────────────────────────

const DB_NAME = 'workout-pwa'
const DB_VERSION = 1

// ─── Store names ──────────────────────────────────────────────────────────────

export const STORES = {
  ROUTINES: 'routines',
  EXERCISES: 'exercises',
  SESSIONS: 'sessions',
} as const

// ─── Migrations ───────────────────────────────────────────────────────────────

type AnyTransaction = IDBPTransaction<unknown, string[], 'versionchange'>
type Migration = (db: IDBPDatabase, tx: AnyTransaction) => void

const v1: Migration = (db) => {
  // routines
  db.createObjectStore(STORES.ROUTINES, { keyPath: 'id' })

  // exercises — indexed by routineId so we can fetch all exercises for a routine
  const exerciseStore = db.createObjectStore(STORES.EXERCISES, { keyPath: 'id' })
  exerciseStore.createIndex('by-routine', 'routineId')

  // sessions — indexed by routineId (history per routine) and status (find active)
  const sessionStore = db.createObjectStore(STORES.SESSIONS, { keyPath: 'id' })
  sessionStore.createIndex('by-routine', 'routineId')
  sessionStore.createIndex('by-status', 'status')
  sessionStore.createIndex('by-started', 'startedAt')
}

// Add future migrations here:
// const v2: Migration = (db, tx) => { ... }

const migrations: Migration[] = [v1]

// ─── DB singleton ─────────────────────────────────────────────────────────────

let dbInstance: IDBPDatabase | null = null

export async function getDB(): Promise<IDBPDatabase> {
  if (dbInstance) return dbInstance

  dbInstance = await idbOpen(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, _newVersion, transaction) {
      migrations.forEach((migrate, i) => {
        if (oldVersion < i + 1) {
          migrate(db, transaction)
        }
      })
    },
    blocked() {
      console.warn('[DB] Upgrade blocked — close other tabs')
    },
    blocking() {
      // Another tab wants to upgrade — release our connection
      dbInstance?.close()
      dbInstance = null
    },
  })

  return dbInstance
}

// ─── Routines ─────────────────────────────────────────────────────────────────

export async function getRoutines(): Promise<Routine[]> {
  const db = await getDB()
  const raw = await db.getAll(STORES.ROUTINES)
  return raw.map((r) => RoutineSchema.parse(r))
}

export async function getRoutine(id: string): Promise<Routine | null> {
  const db = await getDB()
  const raw = await db.get(STORES.ROUTINES, id)
  if (!raw) return null
  return RoutineSchema.parse(raw)
}

export async function saveRoutine(routine: Routine): Promise<void> {
  const db = await getDB()
  await db.put(STORES.ROUTINES, RoutineSchema.parse(routine))
}

export async function deleteRoutine(id: string): Promise<void> {
  const db = await getDB()
  const tx = db.transaction([STORES.ROUTINES, STORES.EXERCISES], 'readwrite')
  await tx.objectStore(STORES.ROUTINES).delete(id)
  // Also clean up exercises
  const exerciseIndex = tx.objectStore(STORES.EXERCISES).index('by-routine')
  const exerciseKeys = await exerciseIndex.getAllKeys(id)
  await Promise.all(exerciseKeys.map((k) => tx.objectStore(STORES.EXERCISES).delete(k)))
  await tx.done
}

// ─── Exercises ────────────────────────────────────────────────────────────────

export async function getExercisesForRoutine(routineId: string): Promise<Exercise[]> {
  const db = await getDB()
  const raw = await db.getAllFromIndex(STORES.EXERCISES, 'by-routine', routineId)
  return raw.map((r) => ExerciseSchema.parse(r)).sort((a, b) => a.order - b.order)
}

export async function saveExercise(exercise: Exercise): Promise<void> {
  const db = await getDB()
  await db.put(STORES.EXERCISES, ExerciseSchema.parse(exercise))
}

export async function deleteExercise(id: string): Promise<void> {
  const db = await getDB()
  await db.delete(STORES.EXERCISES, id)
}

// ─── Sessions ─────────────────────────────────────────────────────────────────

export async function getSessions(): Promise<Session[]> {
  const db = await getDB()
  const raw = await db.getAllFromIndex(STORES.SESSIONS, 'by-started')
  return raw
    .map((r) => SessionSchema.parse(r))
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
}

export async function getSessionsForRoutine(routineId: string): Promise<Session[]> {
  const db = await getDB()
  const raw = await db.getAllFromIndex(STORES.SESSIONS, 'by-routine', routineId)
  return raw
    .map((r) => SessionSchema.parse(r))
    .sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime())
}

export async function getLastCompletedSession(routineId: string): Promise<Session | null> {
  const sessions = await getSessionsForRoutine(routineId)
  return sessions.find((s) => s.status === 'completed') ?? null
}

export async function getActiveSession(): Promise<Session | null> {
  const db = await getDB()
  const raw = await db.getAllFromIndex(STORES.SESSIONS, 'by-status', 'active')
  if (!raw.length) return null
  return SessionSchema.parse(raw[0])
}

export async function saveSession(session: Session): Promise<void> {
  const db = await getDB()
  await db.put(STORES.SESSIONS, SessionSchema.parse(session))
}

export async function deleteSession(id: string): Promise<void> {
  const db = await getDB()
  await db.delete(STORES.SESSIONS, id)
}
