import { useState, useRef, useEffect } from 'react'
import styles from './ChatInterface.module.css'
import MessageBubble from './MessageBubble.jsx'
import TypingIndicator from './TypingIndicator.jsx'
import ChatInput from './ChatInput.jsx'
import PatientHints from './PatientHints.jsx'
import { sendMessage } from '../services/openai.js'

const WELCOME_MESSAGE = {
  role: 'assistant',
  content:
    '¡Hola! Soy **MedBot**, tu asistente de cobertura médica. 👨‍⚕️\n\nPuedo ayudarte a conocer tu copago exacto, tu deducible y el hospital más conveniente de tu red.\n\nPara comenzar, cuéntame: **¿cuál es tu nombre y qué síntoma tienes?**',
  timestamp: Date.now(),
}

export default function ChatInterface() {
  const [messages, setMessages] = useState([WELCOME_MESSAGE])
  const [isLoading, setIsLoading] = useState(false)
  const [statusText, setStatusText] = useState('')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  async function handleSend(text) {
    const userMessage = { role: 'user', content: text, timestamp: Date.now() }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setIsLoading(true)
    setStatusText('')

    try {
      // Build the history for OpenAI (exclude the welcome msg and timestamps)
      const history = updatedMessages
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .map(({ role, content }) => ({ role, content }))

      const reply = await sendMessage(history, text => setStatusText(text))

      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: reply, timestamp: Date.now() },
      ])
    } catch (err) {
      console.error(err)
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content:
            'Lo siento, ocurrió un error al procesar tu solicitud. Por favor verifica que las variables de entorno estén configuradas correctamente e inténtalo de nuevo.',
          timestamp: Date.now(),
        },
      ])
    } finally {
      setIsLoading(false)
      setStatusText('')
    }
  }

  function handleSelectPatient(name) {
    handleSend(`Hola, soy ${name}`)
  }

  return (
    <div className={styles.container}>
      <div className={styles.messagesArea} role="log" aria-label="Conversación con el agente médico" aria-live="polite">
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}
        {isLoading && <TypingIndicator statusText={statusText} />}
        <div ref={messagesEndRef} />
      </div>

      <PatientHints onSelectPatient={handleSelectPatient} />
      <ChatInput onSend={handleSend} disabled={isLoading} />
    </div>
  )
}
