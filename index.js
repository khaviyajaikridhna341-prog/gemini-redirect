const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

app.use('/', createProxyMiddleware({
  target: 'https://use.ai',
  changeOrigin: true,
  on: {
    proxyReq: (proxyReq, req) => {
      proxyReq.setHeader('host', 'use.ai');
    },
    proxyRes: (proxyRes) => {
      // Remove security headers that block framing/proxying
      delete proxyRes.headers['x-frame-options'];
      delete proxyRes.headers['content-security-policy'];
    }
  }
}));

app.listen(process.env.PORT || 3000);
