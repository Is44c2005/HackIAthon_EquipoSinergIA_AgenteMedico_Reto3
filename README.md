# MedCopay Agent

Agente conversacional de estimación de copago y cobertura médica. Construido con React + Vite, OpenAI GPT-4o-mini (function calling) y Notion como base de datos de pólizas y hospitales.

## Demo rápida

Los tres pacientes de prueba ya están cargados en Notion:

| Paciente | Plan | Copago | Deducible | Red |
|---|---|---|---|---|
| Juan Pérez | Básico | 30% | $500 | Básica |
| María López | Gold | 20% | $1,000 | Gold |
| Carlos Ruiz | Premium | 10% | $2,000 | Premium |

---

## Setup

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Copia el archivo de ejemplo y rellena tus credenciales:

```bash
cp .env.example .env
```

Edita `.env`:

```env
VITE_OPENAI_API_KEY=sk-...           # Tu API key de OpenAI
VITE_NOTION_API_KEY=secret_...       # Tu Integration Token de Notion
VITE_NOTION_POLICIES_DB_ID=be849009d843443591057961a58411bd
VITE_NOTION_HOSPITALS_DB_ID=b2575fb87d124d5f80c1fc9969ca5aae
```

### 3. Levantar el servidor de desarrollo

```bash
npm run dev
```

---

## Configuración de Notion

### Crear la Integration

1. Ve a [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Clic en **+ New integration**
3. Nombre: `MedCopay Agent`
4. Permisos: **Read content** + **Insert content** (para la demo)
5. Copia el **Internal Integration Token** → `VITE_NOTION_API_KEY`

### Conectar las bases de datos a la Integration

Las bases de datos ya fueron creadas automáticamente en tu workspace bajo la página **MedCopay Hackathon — Reto 1**. Debes compartirlas con tu integration:

1. Abre la página [MedCopay Hackathon — Reto 1](https://www.notion.so/35d90edc2b1c81578ba7d631973935e3) en Notion
2. Clic en **...** (menú superior derecho) → **Add connections**
3. Busca `MedCopay Agent` y conéctala
4. Repite para las bases de datos **Pacientes / Pólizas** y **Hospitales**

### IDs de las bases de datos (ya configurados)

| Base de datos | ID |
|---|---|
| Pacientes / Pólizas | `be849009d843443591057961a58411bd` |
| Hospitales | `b2575fb87d124d5f80c1fc9969ca5aae` |

---

## Arquitectura

```
src/
├── components/
│   ├── ChatInterface.jsx   # Lógica principal del chat + agentic loop
│   ├── MessageBubble.jsx   # Burbujas de mensaje (usuario / agente)
│   ├── TypingIndicator.jsx # Indicador animado + estado "consultando..."
│   ├── ChatInput.jsx       # Textarea con auto-resize + botón enviar
│   ├── PatientHints.jsx    # Chips de pacientes de prueba
│   └── Icons.jsx           # SVG icons (sin emojis)
├── services/
│   ├── openai.js           # Cliente OpenAI + agentic loop + tool definitions
│   └── notion.js           # get_patient_policy + get_hospitals_by_network
├── App.jsx                 # Layout principal con header
└── index.css               # Design tokens + estilos base
```

### Flujo del agente

```
Usuario escribe nombre + síntoma
        ↓
  OpenAI GPT-4o-mini
        ↓
  tool_call: get_patient_policy(nombre)
        ↓
  Notion API → póliza del paciente
        ↓
  tool_call: get_hospitals_by_network(red)
        ↓
  Notion API → hospitales disponibles
        ↓
  GPT calcula copago + recomienda hospital
        ↓
  Respuesta en lenguaje natural empático
```

### Function calling (tools)

**`get_patient_policy(patient_name)`**
- Consulta la BD Pacientes/Pólizas en Notion
- Retorna: `{ nombre, plan, copago_porcentaje, deducible, red_hospitalaria }`

**`get_hospitals_by_network(network_type)`**
- Filtra la BD Hospitales por Red
- Retorna: `[{ nombre, red, especialidades, direccion, costo_promedio }]`

---

## Datos ficticios de ejemplo

### Pacientes / Pólizas

| Nombre | Plan | Copago | Deducible | Red Hospitalaria |
|---|---|---|---|---|
| Juan Pérez | Básico | 30% | $500 | Básica |
| María López | Gold | 20% | $1,000 | Gold |
| Carlos Ruiz | Premium | 10% | $2,000 | Premium |

### Hospitales

| Nombre | Red | Especialidades | Dirección | Costo Promedio |
|---|---|---|---|---|
| Hospital General del Norte | Básica | Medicina General, Pediatría, Urgencias | Av. Reforma 123, Col. Centro | $800 |
| Clínica San José | Básica | Medicina General, Traumatología, Laboratorio | Calle Juárez 456, Col. Doctores | $700 |
| Hospital Ángeles del Valle | Gold | Cardiología, Neurología, Medicina General | Blvd. Los Ángeles 789, Zona Norte | $1,200 |
| Centro Médico Integral | Gold | Dermatología, Ginecología, Gastroenterología | Av. Insurgentes 321, Col. Nápoles | $1,100 |
| Torre Médica Premium | Premium | Oncología, Cirugía Especializada, UCI | Paseo de la Reforma 500, Col. Cuauhtémoc | $2,000 |
| Hospital Star Médica | Premium | Cardiología, Neurología, Endocrinología, Cirugía Robótica | Av. Vasco de Quiroga 3000, Santa Fe | $1,800 |

---

## Nota sobre CORS

La Notion API no permite llamadas directas desde el browser. La app usa `corsproxy.io` como proxy para el hackathon. En producción, implementa un endpoint serverless (Vercel Function, AWS Lambda, etc.) que actúe como proxy seguro y mantenga el `NOTION_API_KEY` fuera del cliente.

---

## Build para producción

```bash
npm run build
npm run preview
```
