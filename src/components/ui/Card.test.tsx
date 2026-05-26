import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card } from './Card'

describe('Card', () => {
  it('renders children', () => {
    render(<Card>Bench Press</Card>)
    expect(screen.getByText('Bench Press')).toBeInTheDocument()
  })

  it('sets data-raised when raised is true', () => {
    render(<Card raised>Bench Press</Card>)
    expect(screen.getByText('Bench Press').closest('div')).toHaveAttribute('data-raised', 'true')
  })

  it('does not set data-raised when raised is false', () => {
    render(<Card>Bench Press</Card>)
    expect(screen.getByText('Bench Press').closest('div')).not.toHaveAttribute('data-raised')
  })
})
