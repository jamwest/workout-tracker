import { useState } from 'react'

interface Props {
  onCreate: (name: string) => Promise<unknown>
}

export function NewRoutineForm({ onCreate }: Readonly<Props>) {
  const [name, setName] = useState('')

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault()
    if (!name.trim()) return
    await onCreate(name.trim())
    setName('')
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="new-routine-name">Routine name</label>
      <input
        id="new-routine-name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <button type="submit">Create</button>
    </form>
  )
}
