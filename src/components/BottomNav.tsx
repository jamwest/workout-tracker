import { NavLink } from 'react-router-dom'
import { useWorkoutStore } from '../stores/useWorkoutStore'
import styles from './BottomNav.module.css'

export function BottomNav() {
  const activeSession = useWorkoutStore((s) => s.activeSession)

  return (
    <nav className={styles.nav}>
      <NavLink to="/" end className={({ isActive }) => `${styles.tab} ${isActive ? styles.active : ''}`}>
        <span className={styles.icon}>◈</span>
        <span className={styles.label}>Routines</span>
      </NavLink>

      <NavLink
        to={activeSession ? `/session/${activeSession.id}` : '/session'}
        className={({ isActive }) => `${styles.tab} ${isActive ? styles.active : ''}`}
      >
        <span className={styles.icon}>
          {activeSession ? <span className={styles.activeDot} /> : null}
          ◉
        </span>
        <span className={styles.label}>Workout</span>
      </NavLink>

      <NavLink to="/history" className={({ isActive }) => `${styles.tab} ${isActive ? styles.active : ''}`}>
        <span className={styles.icon}>◎</span>
        <span className={styles.label}>History</span>
      </NavLink>
    </nav>
  )
}
