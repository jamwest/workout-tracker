import { Dialog } from './ui'

interface Props {
  open: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({ open, title, message, onConfirm, onCancel }: Readonly<Props>) {
  return (
    <Dialog
      open={open}
      title={title}
      description={message}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  )
}
