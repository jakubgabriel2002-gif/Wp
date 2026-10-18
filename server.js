const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT || 3000);
const TOKEN = process.env.GITHUB_TOKEN;
const OWNER = process.env.GITHUB_OWNER;
const REPO = process.env.GITHUB_REPO;
const BRANCH = process.env.GITHUB_BRANCH || 'main';
const FILE_PATH = process.env.GITHUB_FILE_PATH || 'test-records.jsonl';
const PUBLIC_DIR = path.join(__dirname, 'public');

function send(res, status, body, type = 'application/json; charset=utf-8') {
  res.writeHead(status, { 'Content-Type': type, 'X-Content-Type-Options': 'nosniff' });
  res.end(body);
}

async function githubRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Accept': 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const text = await response.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch {}
  if (!response.ok) {
    const error = new Error(data.message || `GitHub API returned ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return data;
}

async function appendRecord(record) {
  const base = `https://api.github.com/repos/${encodeURIComponent(OWNER)}/${encodeURIComponent(REPO)}/contents/${FILE_PATH.split('/').map(encodeURIComponent).join('/')}`;
  let sha;
  let existing = '';
  try {
    const file = await githubRequest(`${base}?ref=${encodeURIComponent(BRANCH)}`);
    sha = file.sha;
    existing = Buffer.from(file.content || '', 'base64').toString('utf8');
  } catch (error) {
    if (error.status !== 404) throw error;
  }
  const content = existing + JSON.stringify(record) + '\n';
  const body = {
    message: 'Add demo test record',
    content: Buffer.from(content, 'utf8').toString('base64'),
    branch: BRANCH
  };
  if (sha) body.sha = sha;
  await githubRequest(base, { method: 'PUT', body: JSON.stringify(body) });
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'GET' && (req.url === '/' || req.url.startsWith('/index.html'))) {
    return send(res, 200, fs.readFileSync(path.join(PUBLIC_DIR, 'index.html')), 'text/html; charset=utf-8');
  }

  if (req.method === 'POST' && req.url === '/api/record') {
    if (!TOKEN || !OWNER || !REPO) {
      return send(res, 500, JSON.stringify({ error: 'Backend configuration is incomplete. Set GITHUB_TOKEN, GITHUB_OWNER and GITHUB_REPO.' }));
    }
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 8000) req.destroy();
    });
    req.on('end', async () => {
      try {
        const input = JSON.parse(body || '{}');
        const email = typeof input.email === 'string' ? input.email.trim().slice(0, 160) : '';
        const testNote = typeof input.testNote === 'string' ? input.testNote.trim().slice(0, 300) : '';
        if (!email || !testNote || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          return send(res, 400, JSON.stringify({ error: 'Podaj poprawny testowy e-mail i notatkę.' }));
        }
        const record = {
          createdAt: new Date().toISOString(),
          email,
          testNote
        };
        await appendRecord(record);
        return send(res, 200, JSON.stringify({ ok: true, message: 'Zapisano rekord testowy w repozytorium.' }));
      } catch (error) {
        console.error('Record save failed:', error.message);
        return send(res, 500, JSON.stringify({ error: 'Nie udało się zapisać rekordu. Sprawdź konfigurację i uprawnienia tokena.' }));
      }
    });
    return;
  }

  return send(res, 404, 'Not found', 'text/plain; charset=utf-8');
});

server.listen(PORT, () => console.log(`Test app running on http://localhost:${PORT}`));
