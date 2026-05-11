import styles from './PatientHints.module.css'
import { ShieldIcon } from './Icons.jsx'

const SAMPLE_PATIENTS = [
  { name: 'Juan Pérez', plan: 'Plan Básico', color: '#0891B2' },
  { name: 'María López', plan: 'Plan Gold', color: '#D97706' },
  { name: 'Carlos Ruiz', plan: 'Plan Premium', color: '#7C3AED' },
]

export default function PatientHints({ onSelectPatient }) {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <ShieldIcon size={14} />
        <span>Pacientes de prueba</span>
      </div>
      <div className={styles.list}>
        {SAMPLE_PATIENTS.map(p => (
          <button
            key={p.name}
            className={styles.chip}
            onClick={() => onSelectPatient(p.name)}
            aria-label={`Usar paciente de prueba: ${p.name}, ${p.plan}`}
            style={{ '--chip-accent': p.color }}
          >
            <span className={styles.dot} style={{ background: p.color }} />
            <span className={styles.chipName}>{p.name}</span>
            <span className={styles.chipPlan}>{p.plan}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
