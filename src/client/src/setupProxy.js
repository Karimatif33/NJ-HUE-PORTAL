const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://knj.horus.edu.eg',
      changeOrigin: true,
      secure: false, // Ignore SSL certificate errors
    })
  );
};
