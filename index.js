const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

app.use('/', createProxyMiddleware({
  target: 'https://gemini.google.com',
  changeOrigin: true,
  followRedirects: true,
  ws: true,
  cookieDomainRewrite: '',
  pathRewrite: { '^/': '/' },
  on: {
    proxyReq: (proxyReq) => {
      proxyReq.setHeader('Host', 'gemini.google.com');
      proxyReq.setHeader('Origin', 'https://gemini.google.com');
      proxyReq.setHeader('Referer', 'https://gemini.google.com/');
      proxyReq.removeHeader('x-forwarded-for');
      proxyReq.removeHeader('x-forwarded-host');
      proxyReq.removeHeader('x-forwarded-proto');
      proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36');
      proxyReq.setHeader('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8');
      proxyReq.setHeader('Accept-Language', 'en-US,en;q=0.5');
      proxyReq.setHeader('Accept-Encoding', 'gzip, deflate, br');
      proxyReq.setHeader('Connection', 'keep-alive');
      proxyReq.setHeader('Upgrade-Insecure-Requests', '1');
    },
    proxyRes: (proxyRes) => {
      delete proxyRes.headers['x-frame-options'];
      delete proxyRes.headers['content-security-policy'];
      delete proxyRes.headers['x-content-type-options'];
      delete proxyRes.headers['strict-transport-security'];

      const cookies = proxyRes.headers['set-cookie'];
      if (cookies) {
        proxyRes.headers['set-cookie'] = cookies.map(c =>
          c.replace(/Domain=[^;]+;?/gi, '').replace(/Secure;?/gi, '')
        );
      }
    },
    error: (err, req, res) => {
      console.error('Proxy error:', err);
      res.status(500).send(`Proxy error: ${err.message}`);
    }
  }
}));

app.listen(process.env.PORT || 3000, () => {
  console.log('Proxy running on port', process.env.PORT || 3000);
});
