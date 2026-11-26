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

  try {
    const upstream = await fetch(`https://api.adsb.lol/v2/callsign/${encodeURIComponent(callsign)}`, {
      headers: { 'User-Agent': 'yucatan-companion-radar/1.0' }
    });
    const body = await upstream.text();
    return new Response(body, {
      status: upstream.status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=15'
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 502,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
