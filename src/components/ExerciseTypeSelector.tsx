import type { ExerciseType } from '../types'

const OPTIONS: { value: ExerciseType; label: string }[] = [
  { value: 'weighted', label: 'Weighted' },
  { value: 'bodyweight', label: 'Bodyweight' },
  { value: 'timed', label: 'Timed' },
]

interface Props {
  value: ExerciseType
  onChange: (type: ExerciseType) => void
}

export function ExerciseTypeSelector({ value, onChange }: Readonly<Props>) {
  return (
    <fieldset>
      <legend>Exercise type</legend>
      {OPTIONS.map((opt) => (
        <label key={opt.value}>
          <input
            type="radio"
            name="exercise-type"
            value={opt.value}
            checked={value === opt.value}
            onChange={() => onChange(opt.value)}
          />
          {opt.label}
        </label>
      ))}
    </fieldset>
  )
}
