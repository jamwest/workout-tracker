import styles from './Input.module.css'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  type?: 'text' | 'number' | 'radio'
}

export function Input({ type = 'text', className, ...props }: Readonly<InputProps>) {
  return (
    <input
      type={type}
      className={[styles.input, className ?? ''].filter(Boolean).join(' ')}
      {...props}
    />
  )
}
