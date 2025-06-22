const express = require('express');
const next = require('next');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  // Serve images from /data/uploads/products at /uploads/products
  server.use(
    '/uploads/products',
    express.static(path.join(process.cwd(), 'data', 'uploads', 'products'))
  );

  // Let Next.js handle everything else
  server.all('*', (req, res) => handle(req, res));

  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
}); 