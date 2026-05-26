import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ExerciseTypeSelector } from './ExerciseTypeSelector'

const noop = () => {}

describe('ExerciseTypeSelector', () => {
  it('renders all three ExerciseType options', () => {
    render(<ExerciseTypeSelector value="weighted" onChange={noop} />)
    expect(screen.getByRole('radio', { name: /weighted/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /bodyweight/i })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: /timed/i })).toBeInTheDocument()
  })

  it('marks the current value as checked', () => {
    render(<ExerciseTypeSelector value="bodyweight" onChange={noop} />)
    expect(screen.getByRole('radio', { name: /bodyweight/i })).toBeChecked()
    expect(screen.getByRole('radio', { name: /weighted/i })).not.toBeChecked()
    expect(screen.getByRole('radio', { name: /timed/i })).not.toBeChecked()
  })

  it('calls onChange with the correct ExerciseType when a segment is selected', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<ExerciseTypeSelector value="weighted" onChange={onChange} />)
    await user.click(screen.getByRole('radio', { name: /timed/i }))
    expect(onChange).toHaveBeenCalledOnce()
    expect(onChange).toHaveBeenCalledWith('timed')
  })
})
