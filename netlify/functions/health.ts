import type { Handler } from '@netlify/functions'

const handler: Handler = async () => ({
  statusCode: 200,
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    status: 'ok',
    service: 'givewell-sam-assessment',
    timestamp: new Date().toISOString(),
  }),
})

export { handler }
