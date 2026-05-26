interface Props {
  open: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({ open, title, message, onConfirm, onCancel }: Readonly<Props>) {
  if (!open) return null

  return (
    <dialog open aria-modal aria-labelledby="confirm-dialog-title">
      <h2 id="confirm-dialog-title">{title}</h2>
      <p>{message}</p>
      <button onClick={onConfirm}>Confirm</button>
      <button onClick={onCancel}>Cancel</button>
    </dialog>
  )
}
