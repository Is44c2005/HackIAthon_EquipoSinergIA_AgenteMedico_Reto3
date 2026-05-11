import styles from './MessageBubble.module.css'
import { BotIcon, UserIcon } from './Icons.jsx'

function formatMessage(text) {
  // Convert **bold**, newlines, and basic markdown to HTML-safe spans
  return text
    .split('\n')
    .map((line, i) => {
      const formatted = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      return `<span key="${i}">${formatted}</span>`
    })
    .join('<br/>')
}

export default function MessageBubble({ message }) {
  const isUser = message.role === 'user'

  return (
    <div className={`${styles.wrapper} ${isUser ? styles.userWrapper : styles.agentWrapper}`}>
      {!isUser && (
        <div className={styles.avatar} aria-hidden="true">
          <BotIcon size={18} />
        </div>
      )}

      <div
        className={`${styles.bubble} ${isUser ? styles.userBubble : styles.agentBubble}`}
        role="article"
        aria-label={isUser ? 'Tu mensaje' : 'Respuesta del agente'}
      >
        <p
          className={styles.text}
          dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
        />
        <span className={styles.time}>
          {new Date(message.timestamp).toLocaleTimeString('es-MX', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>

      {isUser && (
        <div className={`${styles.avatar} ${styles.userAvatar}`} aria-hidden="true">
          <UserIcon size={18} />
        </div>
      )}
    </div>
  )
}
