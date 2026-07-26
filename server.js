const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 3000;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.gif': 'image/gif',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8'
};

function buildFriendlyReply(topic) {
  const trimmedTopic = (topic || '').trim();

  if (!trimmedTopic) {
    return 'I’m here and ready to help — what would you like to explore today?';
  }

  const shortTopic = trimmedTopic.replace(/\s+/g, ' ').slice(0, 90);
  return `Absolutely — “${shortTopic}” is a great topic to explore. I can break it down in a simple, friendly way and make it feel easy to follow. If you want, I can explain it step by step, give examples, or turn it into a quick study guide.`;
}

function serveStatic(req, res, filePath) {
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    res.end(content);
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/api/tutor') {
    if (req.method !== 'POST') {
      res.writeHead(405, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ result: 'Method not allowed' }));
      return;
    }

    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body || '{}');
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
          result: buildFriendlyReply(data.topic)
        }));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ result: 'Invalid JSON' }));
      }
    });
    return;
  }

  if (url.pathname === '/api/upload') {
    if (req.method !== 'POST') {
      res.writeHead(405, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: 'Method not allowed' }));
      return;
    }

    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ text: 'Upload endpoint ready' }));
    return;
  }

  const reqPath = url.pathname === '/' ? '/index.html' : url.pathname;
  const filePath = path.join(__dirname, reqPath);
  serveStatic(req, res, filePath);
});

server.listen(port, () => {
  console.log(`Server running at http://127.0.0.1:${port}`);
});
