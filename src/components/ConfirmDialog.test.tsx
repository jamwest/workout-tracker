import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { ConfirmDialog } from './ConfirmDialog'

// ── Helpers ───────────────────────────────────────────────────────────────────

const noop = () => {}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('ConfirmDialog', () => {
  it('renders the title when open', () => {
    render(
      <ConfirmDialog
        open
        title="Abandon session?"
        message="Your current session will be saved as incomplete."
        onConfirm={noop}
        onCancel={noop}
      />,
    )
    expect(screen.getByText('Abandon session?')).toBeInTheDocument()
  })

  it('renders the message when open', () => {
    render(
      <ConfirmDialog
        open
        title="Abandon session?"
        message="Your current session will be saved as incomplete."
        onConfirm={noop}
        onCancel={noop}
      />,
    )
    expect(screen.getByText('Your current session will be saved as incomplete.')).toBeInTheDocument()
  })

  it('renders nothing when closed', () => {
    render(
      <ConfirmDialog
        open={false}
        title="Abandon session?"
        message="Your current session will be saved as incomplete."
        onConfirm={noop}
        onCancel={noop}
      />,
    )
    expect(screen.queryByText('Abandon session?')).not.toBeInTheDocument()
  })

  it('calls onConfirm when the Confirm button is clicked', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    render(
      <ConfirmDialog
        open
        title="Delete routine?"
        message="This cannot be undone."
        onConfirm={onConfirm}
        onCancel={noop}
      />,
    )
    await user.click(screen.getByRole('button', { name: /confirm/i }))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it('calls onCancel when the Cancel button is clicked', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    render(
      <ConfirmDialog
        open
        title="Delete routine?"
        message="This cannot be undone."
        onConfirm={noop}
        onCancel={onCancel}
      />,
    )
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onCancel).toHaveBeenCalledOnce()
  })
})
