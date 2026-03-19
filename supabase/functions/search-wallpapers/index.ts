const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query = 'abstract background' } = await req.json();

    const unsplashKey = Deno.env.get('UNSPLASH_ACCESS_KEY');
    const pexelsKey = Deno.env.get('PEXELS_API_KEY');

    const results: { id: string; url: string; thumb: string; source: string; photographer?: string }[] = [];

    // Fetch from both APIs in parallel
    const promises: Promise<void>[] = [];

    if (unsplashKey) {
      promises.push(
        fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=15&orientation=landscape`, {
          headers: { Authorization: `Client-ID ${unsplashKey}` },
        })
          .then(r => r.json())
          .then(data => {
            if (data.results) {
              for (const img of data.results) {
                results.push({
                  id: `unsplash-${img.id}`,
                  url: img.urls.regular,
                  thumb: img.urls.small,
                  source: 'Unsplash',
                  photographer: img.user?.name,
                });
              }
            }
          })
          .catch(e => console.error('Unsplash error:', e))
      );
    }

    if (pexelsKey) {
      promises.push(
        fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=15&orientation=landscape`, {
          headers: { Authorization: pexelsKey },
        })
          .then(r => r.json())
          .then(data => {
            if (data.photos) {
              for (const img of data.photos) {
                results.push({
                  id: `pexels-${img.id}`,
                  url: img.src.large,
                  thumb: img.src.medium,
                  source: 'Pexels',
                  photographer: img.photographer,
                });
              }
            }
          })
          .catch(e => console.error('Pexels error:', e))
      );
    }

    await Promise.all(promises);

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to search wallpapers' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
