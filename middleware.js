// Vercel Edge Middleware
// Intercepts /api/* requests and forwards them to Render with an allowed Origin header
export const config = {
  matcher: '/api/:path*'
};

export default async function middleware(request) {
  const url = new URL(request.url);
  const targetUrl = 'https://infinity-customizations.onrender.com' + url.pathname + url.search;

  // Build request headers with an origin that Render's active CORS configuration explicitly allows
  const headers = new Headers(request.headers);
  headers.set('Origin', 'https://infinitycustomizationss.vercel.app');
  headers.set('Host', 'infinity-customizations.onrender.com');

  const fetchOptions = {
    method: request.method,
    headers: headers,
    redirect: 'follow'
  };

  if (request.method !== 'GET' && request.method !== 'HEAD') {
    fetchOptions.body = request.body;
    fetchOptions.duplex = 'half';
  }

  try {
    const upstreamResponse = await fetch(targetUrl, fetchOptions);
    const respHeaders = new Headers(upstreamResponse.headers);
    respHeaders.set('Access-Control-Allow-Origin', '*');
    respHeaders.set('Access-Control-Allow-Credentials', 'true');

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: respHeaders
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Proxy Gateway Error', message: err.message }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
