const VALID_CODES = [
  'PROP-I1Q7-JWP8',
  'PROP-NZY4-T7WG',
  'PROP-0L77-PI74',
  'PROP-EVTM-5PDF',
  'PROP-4M2H-5JVH',
  'PROP-RLUL-SVAT',
  'PROP-RVSB-GKCD',
  'PROP-F1UZ-AAL2',
  'PROP-2NB5-TK88',
  'PROP-2ZUT-C0OK',
  'PROP-PGZA-B4NK',
  'PROP-A9KW-YPPF',
  'PROP-DHFP-3JD6',
  'PROP-8DX3-FXUC',
  'PROP-K5KM-PGZ3',
  'PROP-9I66-HWFK',
  'PROP-QO27-ORWH',
  'PROP-8H6H-2J1F',
  'PROP-3ZOK-PBKA',
  'PROP-YO0L-YIMA'
];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  if (req.method === 'POST' && req.url === '/api/verify') {
    const { code } = req.body;
    const valid = VALID_CODES.includes((code || '').toUpperCase().trim());
    res.status(200).json({ valid });
    return;
  }

  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }

  const { accessCode, ...anthropicBody } = req.body;
  if (!VALID_CODES.includes((accessCode || '').toUpperCase().trim())) {
    res.status(403).json({ error: 'Code d\'accès invalide ou expiré.' });
    return;
  }

  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) { res.status(500).json({ error: 'Clé API non configurée sur le serveur.' }); return; }
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify(anthropicBody)
    });
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
