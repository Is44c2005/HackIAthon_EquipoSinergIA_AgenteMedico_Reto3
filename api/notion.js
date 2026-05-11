export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const notionPath = req.query.path
  if (!notionPath) {
    return res.status(400).json({ error: 'Missing path parameter' })
  }

  const response = await fetch(`https://api.notion.com${notionPath}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.VITE_NOTION_API_KEY}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req.body),
  })

  const data = await response.json()
  res.status(response.status).json(data)
}
