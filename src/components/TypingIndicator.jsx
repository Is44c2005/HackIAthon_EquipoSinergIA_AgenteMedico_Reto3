import styles from './TypingIndicator.module.css'
import { SpinnerIcon } from './Icons.jsx'

export default function TypingIndicator({ statusText }) {
  return (
    <div className={styles.wrapper} role="status" aria-live="polite">
      <div className={styles.avatar}>
        <SpinnerIcon size={16} />
      </div>
      <div className={styles.bubble}>
        {statusText ? (
          <span className={styles.statusText}>{statusText}</span>
        ) : (
          <div className={styles.dots}>
            <span className={styles.dot} />
            <span className={styles.dot} />
            <span className={styles.dot} />
          </div>
        )}
      </div>
    </div>
  )
}
