import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { NumberStepper } from './NumberStepper'

describe('NumberStepper', () => {
  it('renders a decrement button, value input, and increment button', () => {
    render(<NumberStepper value={5} onChange={vi.fn()} label="Reps" />)

    expect(screen.getByRole('button', { name: /decrease reps/i })).toBeInTheDocument()
    expect(screen.getByRole('spinbutton', { name: /reps/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /increase reps/i })).toBeInTheDocument()
  })

  it('calls onChange with value + 1 when the increment button is clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<NumberStepper value={5} onChange={onChange} label="Reps" />)

    await user.click(screen.getByRole('button', { name: /increase reps/i }))

    expect(onChange).toHaveBeenCalledOnce()
    expect(onChange).toHaveBeenCalledWith(6)
  })

  it('calls onChange with value - 1 when the decrement button is clicked', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<NumberStepper value={5} onChange={onChange} label="Reps" />)

    await user.click(screen.getByRole('button', { name: /decrease reps/i }))

    expect(onChange).toHaveBeenCalledOnce()
    expect(onChange).toHaveBeenCalledWith(4)
  })

  it('uses the step prop to control increment and decrement amount', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<NumberStepper value={80} onChange={onChange} step={2.5} label="Weight" />)

    await user.click(screen.getByRole('button', { name: /increase weight/i }))
    expect(onChange).toHaveBeenCalledWith(82.5)

    onChange.mockClear()

    await user.click(screen.getByRole('button', { name: /decrease weight/i }))
    expect(onChange).toHaveBeenCalledWith(77.5)
  })

  it('disables the decrement button when value equals min', () => {
    render(<NumberStepper value={0} onChange={vi.fn()} min={0} label="Reps" />)

    expect(screen.getByRole('button', { name: /decrease reps/i })).toBeDisabled()
  })

  it('keeps the decrement button enabled when value is above min', () => {
    render(<NumberStepper value={1} onChange={vi.fn()} min={0} label="Reps" />)

    expect(screen.getByRole('button', { name: /decrease reps/i })).toBeEnabled()
  })

  it('calls onChange with the typed number when the value input changes', () => {
    const onChange = vi.fn()
    render(<NumberStepper value={5} onChange={onChange} label="Reps" />)

    fireEvent.change(screen.getByRole('spinbutton', { name: /reps/i }), {
      target: { value: '12' },
    })

    expect(onChange).toHaveBeenCalledWith(12)
  })
})
