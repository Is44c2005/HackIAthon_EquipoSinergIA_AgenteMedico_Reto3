const POLICIES_DB_ID = import.meta.env.VITE_NOTION_POLICIES_DB_ID
const HOSPITALS_DB_ID = import.meta.env.VITE_NOTION_HOSPITALS_DB_ID

// All Notion calls go through Vite's dev-server proxy (/notion-api → api.notion.com).
// The proxy injects the Authorization and Notion-Version headers automatically (see vite.config.js).
async function notionPost(path, body) {
  const res = await fetch(`/notion-api${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Notion API error ${res.status}: ${err}`)
  }
  return res.json()
}

function extractText(prop) {
  if (!prop) return ''
  if (prop.type === 'title') return prop.title.map(t => t.plain_text).join('')
  if (prop.type === 'rich_text') return prop.rich_text.map(t => t.plain_text).join('')
  if (prop.type === 'number') return prop.number ?? 0
  if (prop.type === 'select') return prop.select?.name ?? ''
  if (prop.type === 'multi_select') return prop.multi_select.map(s => s.name).join(', ')
  return ''
}

export async function getPatientPolicy(patientName) {
  const data = await notionPost(`/v1/databases/${POLICIES_DB_ID}/query`, {
    filter: {
      property: 'Nombre',
      title: { contains: patientName },
    },
  })

  if (!data.results || data.results.length === 0) return null

  const props = data.results[0].properties
  return {
    nombre: extractText(props['Nombre']),
    plan: extractText(props['Plan']),
    copago_porcentaje: extractText(props['Copago']),
    deducible: extractText(props['Deducible']),
    red_hospitalaria: extractText(props['Red Hospitalaria']),
  }
}

export async function getHospitalsByNetwork(networkType) {
  const data = await notionPost(`/v1/databases/${HOSPITALS_DB_ID}/query`, {
    filter: {
      property: 'Red',
      select: { equals: networkType },
    },
  })

  if (!data.results) return []

  return data.results.map(page => {
    const props = page.properties
    return {
      nombre: extractText(props['Nombre']),
      red: extractText(props['Red']),
      especialidades: extractText(props['Especialidades']),
      direccion: extractText(props['Dirección']),
      costo_promedio: extractText(props['Costo Promedio Consulta']),
    }
  })
}
