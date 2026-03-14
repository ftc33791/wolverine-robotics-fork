// api/ignite.js
// Vercel serverless function — proxies https://ftc.ignitepathways.org
// to bypass CORS restrictions from the browser.
//
// Matches the exact path your original serve.ps1 used:
//   /api/ignite/teams/12345?season=2024
// → https://ftc.ignitepathways.org/api/public/teams/12345?season=2024

export default async function handler(req, res) {
  // Build the upstream path by stripping the /api/ignite prefix
  const path = req.url.replace(/^\/api\/ignite/, '');
  const upstream = `https://ftc.ignitepathways.org/api/public${path}`;

  try {
    const response = await fetch(upstream, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'WolverineRobotics/1.0',
      },
    });

    // Forward the status code
    res.status(response.status);

    // Forward CORS headers so browser won't block
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');

    if (!response.ok) {
      res.json({ error: `Upstream returned ${response.status}` });
      return;
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: 'Proxy error', detail: err.message });
  }
}
