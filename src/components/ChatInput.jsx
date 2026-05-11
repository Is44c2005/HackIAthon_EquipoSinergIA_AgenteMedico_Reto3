import { useState, useRef, useEffect } from 'react'
import styles from './ChatInput.module.css'
import { SendIcon } from './Icons.jsx'

export default function ChatInput({ onSend, disabled }) {
  const [value, setValue] = useState('')
  const textareaRef = useRef(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [value])

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSend(trimmed)
    setValue('')
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} aria-label="Enviar mensaje">
      <textarea
        ref={textareaRef}
        className={styles.textarea}
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Escribe tu nombre y síntoma... (Ej: Soy Juan Pérez y tengo dolor de cabeza intenso)"
        disabled={disabled}
        rows={1}
        aria-label="Mensaje al agente médico"
      />
      <button
        type="submit"
        className={styles.sendBtn}
        disabled={disabled || !value.trim()}
        aria-label="Enviar mensaje"
      >
        <SendIcon size={18} />
      </button>
    </form>
  )
}
