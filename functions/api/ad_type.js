/**
 * GET /api/ad_type
 * Mirip https://ads-api.videy.co/api/ad_type
 *
 * Setiap request → random salah satu dari 3 iklan (seperti videy.co)
 * Format response sama persis:
 * {
 *   "type": "exo",
 *   "code": "",
 *   "banner_300x250": "..."
 * }
 */

const ADS = [
  // 1. Banner 300x250 (atOptions + biomanos)
  {
    type: 'exo',
    code: '',
    banner_300x250: `<script>
  atOptions = {
    'key' : 'e3390cf0a8cdf953ded85bdaaf3046a5',
    'format' : 'iframe',
    'height' : 250,
    'width' : 300,
    'params' : {}
  };
</script>
<script src="https://biomanos.org/22/e3390cf0a8cdf953ded85bdaaf3046a5"></script>`,
  },

  // 2. Container style (biomanos 21)
  {
    type: 'exo',
    code: '',
    banner_300x250: `<script async="async" data-cfasync="false" src="https://biomanos.org/21/d3e082d534e1581e0f78d3cfe456f0d9"></script>
<div id="container-d3e082d534e1581e0f78d3cfe456f0d9"></div>`,
  },

  // 3. Popunder / script (ahuramazda)
  {
    type: 'exo',
    code: '',
    banner_300x250: `<script data-cfasync="false" src="https://ahuramazda.org/1/d4b3da13003ae6d27d4378a79cb4332d"></script>`,
  },
]

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept',
    'Content-Type': 'application/json; charset=utf-8',
    // Penting: jangan cache lama supaya setiap refresh bisa beda iklan (seperti videy)
    'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
    'Pragma': 'no-cache',
  }
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders() })
}

export async function onRequestGet({ request }) {
  try {
    // Pure random setiap request → mirip perilaku ads-api.videy.co
    // (mereka juga ganti-ganti iklan setiap beberapa kali refresh)
    const index = Math.floor(Math.random() * ADS.length)
    const ad = ADS[index]

    return new Response(JSON.stringify(ad), {
      status: 200,
      headers: corsHeaders(),
    })
  } catch (err) {
    // Fallback aman
    return new Response(
      JSON.stringify(ADS[0]),
      { status: 200, headers: corsHeaders() }
    )
  }
}
