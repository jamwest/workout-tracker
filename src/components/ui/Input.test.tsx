import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from './Input'

describe('Input', () => {
  it('renders a textbox', () => {
    render(<Input aria-label="Name" />)
    expect(screen.getByRole('textbox', { name: 'Name' })).toBeInTheDocument()
  })

  it('calls onChange when the user types', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Input aria-label="Name" onChange={onChange} />)
    await user.type(screen.getByRole('textbox', { name: 'Name' }), 'hi')
    expect(onChange).toHaveBeenCalled()
  })

  it('shows placeholder text', () => {
    render(<Input aria-label="Name" placeholder="Enter a name" />)
    expect(screen.getByPlaceholderText('Enter a name')).toBeInTheDocument()
  })

  it('renders a spinbutton when type is "number"', () => {
    render(<Input aria-label="Weight" type="number" />)
    expect(screen.getByRole('spinbutton', { name: 'Weight' })).toBeInTheDocument()
  })
})
