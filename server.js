const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

app.use('/', createProxyMiddleware({
  target: 'https://use.ai',
  changeOrigin: true,
  secure: true,
  ws: true, // WebSocket support (needed for chat UIs)
  on: {
    proxyReq: (proxyReq, req) => {
      // Forward host so use.ai thinks it's a direct visit
      proxyReq.setHeader('host', 'use.ai');
    },
    proxyRes: (proxyRes) => {
      // Remove security headers that block framing/cookie sharing
      delete proxyRes.headers['x-frame-options'];
      delete proxyRes.headers['content-security-policy'];
      // Make cookies work cross-domain
      const cookies = proxyRes.headers['set-cookie'];
      if (cookies) {
        proxyRes.headers['set-cookie'] = cookies.map(c =>
          c.replace(/;\s*SameSite=\w+/i, '')
            .replace(/;\s*Secure/i, '')
        );
      }
    }
  }
}));

app.listen(process.env.PORT || 3000, () =>
  console.log('Proxy running!')
);
