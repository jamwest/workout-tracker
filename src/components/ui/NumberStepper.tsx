import styles from './NumberStepper.module.css'

export interface NumberStepperProps {
  value: number
  onChange: (v: number) => void
  min?: number
  step?: number
  label: string
}

export function NumberStepper({
  value,
  onChange,
  min,
  step = 1,
  label,
}: Readonly<NumberStepperProps>) {
  const atMin = min !== undefined && value <= min

  return (
    <div className={styles.stepper}>
      <button
        type="button"
        aria-label={`Decrease ${label}`}
        disabled={atMin}
        onClick={() => onChange(value - step)}
        className={styles.btn}
      >
        −
      </button>
      <input
        type="number"
        aria-label={label}
        value={value}
        onChange={(e) =>
          onChange(isNaN(e.target.valueAsNumber) ? value : e.target.valueAsNumber)
        }
        className={styles.valueInput}
      />
      <button
        type="button"
        aria-label={`Increase ${label}`}
        onClick={() => onChange(value + step)}
        className={styles.btn}
      >
        +
      </button>
    </div>
  )
}
