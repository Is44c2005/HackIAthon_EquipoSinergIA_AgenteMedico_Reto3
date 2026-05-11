import styles from './App.module.css'
import ChatInterface from './components/ChatInterface.jsx'
import { HeartPulseIcon, HospitalIcon } from './components/Icons.jsx'

export default function App() {
  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.brand}>
            <div className={styles.logo} aria-hidden="true">
              <HeartPulseIcon size={22} />
            </div>
            <div>
              <h1 className={styles.title}>MedCopay Agent</h1>
              <p className={styles.subtitle}>Estimación de cobertura médica</p>
            </div>
          </div>
          <div className={styles.badge}>
            <HospitalIcon size={13} />
            <span>IA Médica</span>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.chatCard}>
          <ChatInterface />
        </div>
      </main>

      <footer className={styles.footer}>
        <p>MedCopay Agent · Hackathon Demo · Los datos mostrados son ficticios para propósitos de demostración</p>
      </footer>
    </div>
  )
}
