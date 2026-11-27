import type { Handler, HandlerEvent } from '@netlify/functions'

const {
  KOBO_BASE_URL = 'https://kf.kobotoolbox.org',
  KOBO_API_TOKEN,
  KOBO_FACILITY_ASSET_UID,
  KOBO_CAREGIVER_ASSET_UID,
} = process.env

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

function json(statusCode: number, body: unknown) {
  return {
    statusCode,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }
}

const ALLOWED_ASSETS = new Set(['facility', 'caregiver'])

const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod === 'OPTIONS') return json(204, '')

  if (!KOBO_API_TOKEN) return json(503, { error: 'KoboToolbox API token not configured' })

  const asset = event.queryStringParameters?.asset
  if (!asset || !ALLOWED_ASSETS.has(asset)) {
    return json(400, { error: 'Missing or invalid "asset" parameter. Use "facility" or "caregiver".' })
  }

  const uid = asset === 'facility' ? KOBO_FACILITY_ASSET_UID : KOBO_CAREGIVER_ASSET_UID
  if (!uid) return json(503, { error: `${asset} asset UID not configured` })

  const limit = Math.min(Number(event.queryStringParameters?.limit) || 3000, 10000)
  const start = Number(event.queryStringParameters?.start) || 0

  const url = `${KOBO_BASE_URL}/api/v2/assets/${uid}/data.json?format=json&limit=${limit}&start=${start}`

  try {
    const res = await fetch(url, {
      headers: { Authorization: `Token ${KOBO_API_TOKEN}` },
    })

    if (!res.ok) {
      return json(res.status, { error: `KoboToolbox API returned ${res.status}` })
    }

    const data = await res.json()
    return json(200, {
      count: data.count,
      next: data.next,
      results: data.results,
    })
  } catch (err) {
    return json(502, { error: 'Failed to reach KoboToolbox API' })
  }
}

export { handler }
