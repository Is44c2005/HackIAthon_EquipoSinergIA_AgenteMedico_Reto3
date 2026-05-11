import OpenAI from 'openai'
import { getPatientPolicy, getHospitalsByNetwork } from './notion.js'

let _client = null
function getClient() {
  if (!_client) {
    _client = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY || 'missing-key',
      dangerouslyAllowBrowser: true,
    })
  }
  return _client
}

const TOOLS = [
  {
    type: 'function',
    function: {
      name: 'get_patient_policy',
      description:
        'Consulta la póliza de seguro médico de un paciente en la base de datos Notion. Retorna plan, copago, deducible y red hospitalaria.',
      parameters: {
        type: 'object',
        properties: {
          patient_name: {
            type: 'string',
            description: 'Nombre completo o parcial del paciente a buscar',
          },
        },
        required: ['patient_name'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_hospitals_by_network',
      description:
        'Retorna la lista de hospitales disponibles para un tipo de red hospitalaria. Incluye nombre, dirección, especialidades y costo promedio de consulta.',
      parameters: {
        type: 'object',
        properties: {
          network_type: {
            type: 'string',
            description:
              'Tipo de red hospitalaria del paciente (ej: Básica, Gold, Premium)',
          },
        },
        required: ['network_type'],
      },
    },
  },
]

const SYSTEM_PROMPT = `Eres MedBot, un agente conversacional empático y profesional especializado en seguros médicos.
Tu función es ayudar a los pacientes a entender su cobertura médica, calcular su copago y recomendar el hospital más conveniente.

Cuando un paciente te diga su nombre y síntoma:
1. Busca su póliza usando get_patient_policy con el nombre del paciente
2. Identifica la especialidad médica necesaria según el síntoma
3. Busca hospitales disponibles usando get_hospitals_by_network con su red hospitalaria
4. Calcula el copago exacto: si el costo promedio de consulta es $X y el copago es Y%, el paciente paga $X * Y/100
5. Recomienda el hospital más conveniente que tenga la especialidad requerida
6. Responde de forma clara, empática y en español

IMPORTANTE: Si el paciente ya te dio su nombre en mensajes anteriores y solo pregunta por un nuevo síntoma,
NO necesitas volver a buscar su póliza (ya la tienes en el historial). Solo busca los hospitales si necesitas actualizarlos.
Reutiliza la información de póliza que ya obtuviste para responder más rápido.

Si el paciente no está en la base de datos, infórmalo amablemente.
Siempre incluye:
- Plan del paciente
- Especialidad recomendada para el síntoma
- Hospital recomendado y su dirección
- Monto exacto de copago a pagar (costo_promedio * copago_porcentaje / 100)
- Deducible restante si aplica

Usa un tono cálido, profesional y tranquilizador.`

async function executeTool(name, args, onStatus) {
  if (name === 'get_patient_policy') {
    onStatus?.(`Consultando póliza de "${args.patient_name}"...`)
    const result = await getPatientPolicy(args.patient_name)
    return result
      ? JSON.stringify(result)
      : JSON.stringify({ error: 'Paciente no encontrado en la base de datos' })
  }

  if (name === 'get_hospitals_by_network') {
    onStatus?.(`Buscando hospitales de la red "${args.network_type}"...`)
    const result = await getHospitalsByNetwork(args.network_type)
    return JSON.stringify(result)
  }

  return JSON.stringify({ error: 'Herramienta no encontrada' })
}

export async function sendMessage(messages, onStatus) {
  const response = await getClient().chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
    tools: TOOLS,
    tool_choice: 'auto',
  })

  let message = response.choices[0].message
  let runningMessages = [...messages]
  const MAX_ITERATIONS = 5

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    if (!message.tool_calls || message.tool_calls.length === 0) break

    const toolMessages = []

    for (const toolCall of message.tool_calls) {
      const args = JSON.parse(toolCall.function.arguments)
      const result = await executeTool(toolCall.function.name, args, onStatus)
      toolMessages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: result,
      })
    }

    runningMessages = [...runningMessages, message, ...toolMessages]

    const nextResponse = await getClient().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...runningMessages],
      tools: TOOLS,
      tool_choice: 'auto',
    })

    message = nextResponse.choices[0].message
  }

  return message.content ?? 'Lo siento, no pude generar una respuesta. Por favor intenta de nuevo.'
}
