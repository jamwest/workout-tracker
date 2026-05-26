import styles from './Card.module.css'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  raised?: boolean
}

export function Card({ raised, className, children, ...props }: Readonly<CardProps>) {
  return (
    <div
      className={[styles.card, raised ? styles.raised : '', className ?? '']
        .filter(Boolean)
        .join(' ')}
      data-raised={raised ? 'true' : undefined}
      {...props}
    >
      {children}
    </div>
  )
}
