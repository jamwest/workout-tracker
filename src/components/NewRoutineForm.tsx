import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Button, FieldError, Input } from './ui'

interface Props {
  onCreate: (name: string) => Promise<unknown>
}

const nameSchema = z.string().min(1, 'Routine name is required')

export function NewRoutineForm({ onCreate }: Readonly<Props>) {
  const form = useForm({
    defaultValues: { name: '' },
    onSubmit: async ({ value, formApi }) => {
      await onCreate(value.name.trim())
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
          <>
            <label htmlFor="new-routine-name">Routine name</label>
            <Input
              id="new-routine-name"
              type="text"
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(e) => field.handleChange(e.target.value)}
            />
            <FieldError errors={field.state.meta.errors} />
          </>
        )}
      </form.Field>
      <Button type="submit" disabled={form.state.isSubmitting}>
        Create
      </Button>
    </form>
  )
}
