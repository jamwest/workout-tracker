import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NewRoutineForm } from './NewRoutineForm'

const noop = async () => {}

describe('NewRoutineForm', () => {
  it('renders a routine name input and a Create button', () => {
    render(<NewRoutineForm onCreate={noop} />)
    expect(screen.getByRole('textbox', { name: /routine name/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument()
  })

  it('calls onCreate with the trimmed name on submit', async () => {
    const user = userEvent.setup()
    const onCreate = vi.fn().mockResolvedValue(undefined)
    render(<NewRoutineForm onCreate={onCreate} />)

    await user.type(screen.getByRole('textbox', { name: /routine name/i }), '  Push Day  ')
    await user.click(screen.getByRole('button', { name: /create/i }))

    expect(onCreate).toHaveBeenCalledOnce()
    expect(onCreate).toHaveBeenCalledWith('Push Day')
  })

  it('clears the input after a successful create', async () => {
    const user = userEvent.setup()
    render(<NewRoutineForm onCreate={noop} />)

    await user.type(screen.getByRole('textbox', { name: /routine name/i }), 'Pull Day')
    await user.click(screen.getByRole('button', { name: /create/i }))

    expect(screen.getByRole('textbox', { name: /routine name/i })).toHaveValue('')
  })

  it('does not call onCreate when the name is empty', async () => {
    const user = userEvent.setup()
    const onCreate = vi.fn().mockResolvedValue(undefined)
    render(<NewRoutineForm onCreate={onCreate} />)

    await user.click(screen.getByRole('button', { name: /create/i }))

    expect(onCreate).not.toHaveBeenCalled()
  })
})
