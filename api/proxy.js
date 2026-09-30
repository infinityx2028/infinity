// Vercel Serverless API Proxy (CommonJS)
// Proxies all /api/* requests to Render using whitelisted Origin to eliminate CORS blocks
// Also provides backward-compatible fallback for auth endpoints if Render is running an older commit

const KNOWN_EMAIL_DIRECTORY = {
  'infinitycustomizations@gmail.com': '9632588855',
  'jashwanthreddysingireddy@gmail.com': '8525852855',
  'sjashwanthreddy948@gmail.com': '9585568248',
  'h@gmail.com': '7777786474',
  'velgasnehareddy@gmail.com': '9177631176',
  'karriveeraveni3@gmail.com': '7893391748',
  'sriniketh2002@gmail.com': '8688912605',
  'sanjana3646@gmail.com': '9059673704',
  'kosuriomkar@gmail.com': '9505317596',
  'pulimamidipreetham@gmail.com': '6300376157',
  'gudururishika08@gmail.com': '9110576243',
  'mythri347@gmail.com': '6281816611',
  'sourabhi.manu.potti948@gmail.com': '8019312948',
  'vaggusowmyasri2005@gmail.com': '9392505765',
  'bharathgopavaram2005@gmail.com': '7995732446',
  'vyshali13neela@gmail.com': '9553763852',
  'test@infinity.com': '9123456780'
};

module.exports = async (req, res) => {
  // Always set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    let subpath = req.query.subpath;
    if (Array.isArray(subpath)) subpath = subpath.join('/');

    const parsedUrl = new URL(req.url, 'http://localhost');
    if (!subpath) {
      subpath = parsedUrl.searchParams.get('subpath') || '';
      if (!subpath) {
        subpath = parsedUrl.pathname.replace(/^\/api\/proxy\/?/, '').replace(/^\/api\/?/, '');
      }
    }

    subpath = String(subpath || '').replace(/^\/+/, '');

    // Reconstruct query parameters (stripping 'subpath' which is our rewrite param)
    const searchParams = new URLSearchParams(parsedUrl.searchParams);
    searchParams.delete('subpath');
    const queryString = searchParams.toString();
    const querySuffix = queryString ? `?${queryString}` : '';

    const targetUrl = `https://infinity-customizations.onrender.com/api/${subpath}${querySuffix}`;

    const headers = {
      'Content-Type': req.headers['content-type'] || 'application/json',
      'Origin': 'https://infinitycustomizations.com'
    };

    if (req.headers['authorization']) {
      headers['Authorization'] = req.headers['authorization'];
    }

    const fetchOptions = {
      method: req.method,
      headers
    };

    let parsedBody = req.body;
    if (typeof parsedBody === 'string') {
      try {
        parsedBody = JSON.parse(parsedBody);
      } catch (e) {}
    }

    if (req.method !== 'GET' && req.method !== 'HEAD' && parsedBody) {
      fetchOptions.body = JSON.stringify(parsedBody);
    }

    let upstream = await fetch(targetUrl, fetchOptions);

    // If upstream returns 404 on dedicated auth routes (because Render is running commit 67d0016),
    // provide smart server-side fallback to verify-credentials
    if (upstream.status === 404 && (subpath === 'auth/user/login' || subpath === 'auth/user/signup' || subpath === 'auth/user/register')) {
      const isSignup = subpath.includes('signup') || subpath.includes('register');
      const body = parsedBody || {};
      let cleanPhone = '';

      if (isSignup) {
        cleanPhone = String(body.phoneNumber || '').replace(/\D/g, '').slice(-10);
      } else {
        const identifier = String(body.emailOrPhone || body.email || body.phoneNumber || '').trim();
        const digits = identifier.replace(/\D/g, '').slice(-10);
        if (/^[6-9]\d{9}$/.test(digits)) {
          cleanPhone = digits;
        } else if (identifier.includes('@')) {
          cleanPhone = KNOWN_EMAIL_DIRECTORY[identifier.toLowerCase()] || '';
        }
      }

      if (cleanPhone && /^[6-9]\d{9}$/.test(cleanPhone)) {
        const verifyPayload = {
          phoneNumber: cleanPhone,
          password: body.password || '',
          name: isSignup ? (body.name || 'Customer').trim() : 'Customer'
        };

        const verifyRes = await fetch('https://infinity-customizations.onrender.com/api/auth/user/verify-credentials', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Origin': 'https://infinitycustomizations.com'
          },
          body: JSON.stringify(verifyPayload)
        });

        const verifyData = await verifyRes.json().catch(() => null);

        if (verifyRes.ok && verifyData && verifyData.success) {
          // If signup and email was provided, update profile email in the background
          if (isSignup && body.email && verifyData.token) {
            fetch('https://infinity-customizations.onrender.com/api/auth/user/profile', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${verifyData.token}`,
                'Origin': 'https://infinitycustomizations.com'
              },
              body: JSON.stringify({ email: body.email.trim() })
            }).catch(() => {});
            if (verifyData.user) verifyData.user.email = body.email.trim();
          }

          res.status(200);
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          return res.json(verifyData);
        }

        // If signup failed with 'Invalid password', phone number already exists!
        if (isSignup && verifyData && (verifyData.error === 'Invalid password' || verifyRes.status === 401)) {
          res.status(409);
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          return res.json({
            success: false,
            error: `An account with mobile number ${cleanPhone} already exists. Please sign in with your password, or click Forgot Password.`
          });
        }

        // If login failed
        if (!isSignup) {
          if (verifyData && verifyData.error === 'Invalid password') {
            res.status(401);
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            return res.json({
              success: false,
              error: 'Incorrect password. Please verify your credentials or click Forgot Password.'
            });
          }
        }

        if (verifyData) {
          res.status(verifyRes.status);
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          return res.json(verifyData);
        }
      }
    }

    const contentType = upstream.headers.get('content-type') || 'application/json';
    let data = await upstream.text();
    if (data && data.includes('upi://pay')) {
      // Remove unauthenticated parameters (tr, mc, mode, purpose) which trigger bank rejection
      data = data.replace(/[&?](tr|mc|mode|purpose)=[^&"]+/g, '');
      // Ensure the store's primary merchant UPI ID Q489570312@ybl is strictly used
      data = data.replace(/pa=[^&"]+/g, 'pa=Q489570312@ybl');
    }

    res.status(upstream.status);
    res.setHeader('Content-Type', contentType);
    return res.send(data);
  } catch (err) {
    console.error('API Proxy Error:', err);
    return res.status(502).json({ error: 'Gateway Error', message: err.message });
  }
};
