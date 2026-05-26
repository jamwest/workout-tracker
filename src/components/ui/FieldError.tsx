import styles from './FieldError.module.css'

/** Renders validation errors emitted by a TanStack Form field. */
export interface FieldErrorProps {
  /** Array of errors from `field.state.meta.errors`. May contain Standard
   *  Schema issue objects `{ message: string }` or plain strings. */
  errors: Array<unknown>
}

function toMessage(error: unknown): string {
  if (typeof error === 'string') return error
  if (error !== null && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message)
  }
  return String(error)
}

export function FieldError({ errors }: Readonly<FieldErrorProps>) {
  if (errors.length === 0) return null
  return (
    <ul className={styles.list} role="alert" aria-live="polite">
      {errors.map((error, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: error list is stable within a render
        <li key={i} className={styles.item}>
          {toMessage(error)}
        </li>
      ))}
    </ul>
  )
}
