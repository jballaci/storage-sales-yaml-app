const http = require('http');
const crypto = require('crypto');

const secret = process.env.STRIPE_WEBHOOK_SECRET || '';

const server = http.createServer((req, res) => {
  if(req.method === 'POST' && req.url === '/webhook') {
    let body = [];
    req.on('data', chunk => body.push(chunk));
    req.on('end', () => {
      body = Buffer.concat(body);
      console.log('webhook received', body.toString());
      res.writeHead(200); res.end();
    });
  } else {
    res.writeHead(404); res.end();
  }
});
server.listen(4000, () => console.log('stripe-listener on 4000'));
