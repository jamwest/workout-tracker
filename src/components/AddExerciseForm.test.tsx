import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddExerciseForm } from './AddExerciseForm'

const noop = async () => {}
const routineId = crypto.randomUUID()

describe('AddExerciseForm', () => {
  it('renders a name input, ExerciseTypeSelector, and Add button', () => {
    render(<AddExerciseForm routineId={routineId} onAdd={noop} />)
    expect(screen.getByRole('textbox', { name: /exercise name/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /weighted/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument()
  })

  it('calls onAdd with the entered name and selected ExerciseType on submit', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn().mockResolvedValue(undefined)
    render(<AddExerciseForm routineId={routineId} onAdd={onAdd} />)

    await user.type(screen.getByRole('textbox', { name: /exercise name/i }), 'Bench Press')
    await user.click(screen.getByRole('radio', { name: /bodyweight/i }))
    await user.click(screen.getByRole('button', { name: /add/i }))

    expect(onAdd).toHaveBeenCalledOnce()
    expect(onAdd).toHaveBeenCalledWith('Bench Press', 'bodyweight')
  })

  it('clears the name input and resets the type after a successful add', async () => {
    const user = userEvent.setup()
    render(<AddExerciseForm routineId={routineId} onAdd={noop} />)

    await user.type(screen.getByRole('textbox', { name: /exercise name/i }), 'Squat')
    await user.click(screen.getByRole('radio', { name: /timed/i }))
    await user.click(screen.getByRole('button', { name: /add/i }))

    expect(screen.getByRole('textbox', { name: /exercise name/i })).toHaveValue('')
    expect(screen.getByRole('radio', { name: /weighted/i })).toBeChecked()
  })

  it('does not call onAdd when the name is empty', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn().mockResolvedValue(undefined)
    render(<AddExerciseForm routineId={routineId} onAdd={onAdd} />)

    await user.click(screen.getByRole('button', { name: /add/i }))

    expect(onAdd).not.toHaveBeenCalled()
  })
})
