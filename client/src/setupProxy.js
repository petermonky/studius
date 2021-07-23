const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = (app) => {
  app.use(
    createProxyMiddleware(["/api/**"], {
      target: "https://studius-server-v2.vercel.app/",
      changeOrigin: true,
    })
  );
};
