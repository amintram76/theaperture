// netlify/functions/football.js
//
// Server-side proxy for football-data.org
// Runs on Netlify's servers — never in the browser — so CORS is not an issue.
// The API token is read from an environment variable (set in Netlify dashboard),
// so it never appears in the page source.
//
// Called by the frontend as: /api/football?path=/competitions/ELC/matches&season=2025

export default async (request, context) => {
  const url = new URL(request.url)
  const path = url.searchParams.get('path')

  if (!path) {
    return new Response(JSON.stringify({ error: 'Missing path parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Build query string from remaining params (excluding 'path')
  const params = new URLSearchParams()
  for (const [key, val] of url.searchParams.entries()) {
    if (key !== 'path') params.append(key, val)
  }

  const qs = params.toString()
  const apiUrl = `https://api.football-data.org/v4${path}${qs ? '?' + qs : ''}`

  const token = process.env.FOOTBALL_API_TOKEN || '026558baeb234743b95ddc1e99d56fdf'

  try {
    const response = await fetch(apiUrl, {
      headers: {
        'X-Auth-Token': token,
        'Accept': 'application/json',
      },
    })

    const data = await response.json()

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export const config = {
  path: '/api/football',
}
