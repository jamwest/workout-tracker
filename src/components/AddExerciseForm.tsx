import { useState } from 'react'
import type { ExerciseType } from '../types'
import { ExerciseTypeSelector } from './ExerciseTypeSelector'

interface Props {
  routineId: string
  onAdd: (name: string, type: ExerciseType) => Promise<void>
}

export function AddExerciseForm({ onAdd }: Readonly<Props>) {
  const [name, setName] = useState('')
  const [type, setType] = useState<ExerciseType>('weighted')

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault()
    if (!name.trim()) return
    await onAdd(name.trim(), type)
    setName('')
    setType('weighted')
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Exercise name
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>
      <ExerciseTypeSelector value={type} onChange={setType} />
      <button type="submit">Add</button>
    </form>
  )
}
