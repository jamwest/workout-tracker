import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import type { ExerciseType } from '../types'
import { Button, FieldError, Input } from './ui'
import { ExerciseTypeSelector } from './ExerciseTypeSelector'

interface Props {
  routineId: string
  onAdd: (name: string, type: ExerciseType) => Promise<void>
}

const nameSchema = z.string().min(1, 'Exercise name is required')

export function AddExerciseForm({ onAdd }: Readonly<Props>) {
  const form = useForm({
    defaultValues: { name: '', type: 'weighted' as ExerciseType },
    onSubmit: async ({ value, formApi }) => {
      await onAdd(value.name.trim(), value.type)
      formApi.reset()
    },
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        void form.handleSubmit()
      }}
    >
      <form.Field
        name="name"
        validators={{ onChange: nameSchema, onBlur: nameSchema }}
      >
        {(field) => (
          <label>
            Exercise name
            <Input
              type="text"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            <FieldError errors={field.state.meta.errors} />
          </label>
        )}
      </form.Field>
      <form.Field name="type">
        {(field) => (
          <ExerciseTypeSelector
            value={field.state.value}
            onChange={(type) => field.handleChange(type)}
          />
        )}
      </form.Field>
      <Button type="submit" disabled={form.state.isSubmitting}>
        Add
      </Button>
    </form>
  )
}
