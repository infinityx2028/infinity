// Vercel Serverless API Proxy (CommonJS)
// Proxies all /api/* requests to Render using whitelisted Origin to eliminate CORS blocks
module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    let subpath = req.query.subpath;
    if (Array.isArray(subpath)) subpath = subpath.join('/');
    
    // Parse from URL if subpath query parameter was not extracted
    if (!subpath) {
      const parsedUrl = new URL(req.url, 'http://localhost');
      subpath = parsedUrl.searchParams.get('subpath') || '';
      if (!subpath) {
        subpath = parsedUrl.pathname.replace(/^\/api\/proxy\/?/, '').replace(/^\/api\/?/, '');
      }
    }

    // Strip leading slashes
    subpath = String(subpath || '').replace(/^\/+/, '');

    const targetUrl = `https://infinity-customizations.onrender.com/api/${subpath}`;

    const headers = {
      'Content-Type': req.headers['content-type'] || 'application/json',
      // Send the whitelisted production domain allowed by Render's CORS configuration
      'Origin': 'https://infinitycustomizations.com'
    };

    if (req.headers['authorization']) {
      headers['Authorization'] = req.headers['authorization'];
    }

    const fetchOptions = {
      method: req.method,
      headers
    };

    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      fetchOptions.body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }

    const upstream = await fetch(targetUrl, fetchOptions);
    const contentType = upstream.headers.get('content-type') || 'application/json';
    const data = await upstream.text();

    res.status(upstream.status);
    res.setHeader('Content-Type', contentType);
    return res.send(data);
  } catch (err) {
    console.error('API Proxy Error:', err);
    return res.status(502).json({ error: 'Gateway Error', message: err.message });
  }
};
