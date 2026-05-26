import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Dialog } from './Dialog'

const baseProps = {
  title: 'Delete Routine',
  description: 'This cannot be undone.',
  onConfirm: vi.fn(),
  onCancel: vi.fn(),
}

describe('Dialog', () => {
  it('renders nothing when open is false', () => {
    render(<Dialog {...baseProps} open={false} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders title and description when open', () => {
    render(<Dialog {...baseProps} open />)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Delete Routine')).toBeInTheDocument()
    expect(screen.getByText('This cannot be undone.')).toBeInTheDocument()
  })

  it('calls onConfirm when the confirm button is clicked', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(<Dialog {...baseProps} open onConfirm={onConfirm} />)
    await user.click(screen.getByRole('button', { name: 'Confirm' }))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it('calls onCancel when the cancel button is clicked', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    render(<Dialog {...baseProps} open onCancel={onCancel} />)
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('uses custom confirm and cancel labels when provided', () => {
    render(
      <Dialog
        {...baseProps}
        open
        confirmLabel="Yes, delete"
        cancelLabel="Keep it"
      />,
    )
    expect(screen.getByRole('button', { name: 'Yes, delete' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Keep it' })).toBeInTheDocument()
  })
})
