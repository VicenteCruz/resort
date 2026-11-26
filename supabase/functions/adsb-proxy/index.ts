const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS'
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const callsign = (url.searchParams.get('callsign') || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');

  if (!callsign) {
    return new Response(JSON.stringify({ error: 'Missing callsign' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const sources = [
    `https://opendata.adsb.fi/api/v2/callsign/${encodeURIComponent(callsign)}`,
    `https://api.adsb.lol/v2/callsign/${encodeURIComponent(callsign)}`,
    `https://api.airplanes.live/v2/callsign/${encodeURIComponent(callsign)}`
  ];

  for (const target of sources) {
    try {
      const upstream = await fetch(target, {
        headers: { 'User-Agent': 'yucatan-companion-radar/1.0' }
      });
      if (upstream.ok) {
        const body = await upstream.text();
        return new Response(body, {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=15'
          }
        });
      }
    } catch (_) {
      // Try next ADS-B source
    }
  }

  return new Response(JSON.stringify({ ac: [], msg: 'All ADS-B sources busy' }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
});
