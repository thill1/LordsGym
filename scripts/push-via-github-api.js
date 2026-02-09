#!/usr/bin/env node
/**
 * Push a local commit to GitHub via the REST API (no git push needed).
 * Requires: GITHUB_TOKEN env var (Fine-grained or Classic PAT with repo scope)
 * Usage: GITHUB_TOKEN=ghp_xxx node scripts/push-via-github-api.js
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const OWNER = 'thill1';
const REPO = 'LordsGym';
const BRANCH = 'main';

const token = process.env.GITHUB_TOKEN;
if (!token) {
  console.error('Error: GITHUB_TOKEN environment variable is required.');
  console.error('Create a token at: https://github.com/settings/tokens');
  process.exit(1);
}

async function api(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = https.request(
      {
        hostname: 'api.github.com',
        path,
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'User-Agent': 'LordsGym-Push-Script',
          'Content-Type': 'application/json',
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
        },
      },
      (res) => {
        let buf = '';
        res.on('data', (c) => (buf += c));
        res.on('end', () => {
          try {
            const json = buf ? JSON.parse(buf) : null;
            if (res.statusCode >= 400) {
              reject(new Error(json?.message || `HTTP ${res.statusCode}`));
            } else {
              resolve(json);
            }
          } catch {
            reject(new Error(`HTTP ${res.statusCode}: ${buf}`));
          }
        });
      }
    );
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function main() {
  const root = path.resolve(__dirname, '..');
  const filePath = path.join(root, 'ADMIN_LOGIN_SETUP.md');
  const content = fs.readFileSync(filePath, 'utf8');
  const contentBase64 = Buffer.from(content, 'utf8').toString('base64');

  // 1. Get current ref
  const ref = await api('GET', `/repos/${OWNER}/${REPO}/git/ref/heads/${BRANCH}`);
  const baseSha = ref.object.sha;

  // 2. Create blob
  const blob = await api('POST', `/repos/${OWNER}/${REPO}/git/blobs`, {
    content: contentBase64,
    encoding: 'base64',
  });

  // 3. Get base commit tree
  const baseCommit = await api('GET', `/repos/${OWNER}/${REPO}/git/commits/${baseSha}`);
  const baseTreeSha = baseCommit.tree.sha;

  // 4. Create tree with our file
  const tree = await api('POST', `/repos/${OWNER}/${REPO}/git/trees`, {
    base_tree: baseTreeSha,
    tree: [{ path: 'ADMIN_LOGIN_SETUP.md', mode: '100644', type: 'blob', sha: blob.sha }],
  });

  // 5. Create commit
  const commit = await api('POST', `/repos/${OWNER}/${REPO}/git/commits`, {
    message: 'Add troubleshoot for admin login invalid credentials\n\nCo-authored-by: Cursor <cursoragent@cursor.com>',
    tree: tree.sha,
    parents: [baseSha],
    author: { name: 'Troy Hill', email: 'thill@Troys-Mac-mini.local' },
    committer: { name: 'Troy Hill', email: 'thill@Troys-Mac-mini.local' },
  });

  // 6. Update ref
  await api('PATCH', `/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`, {
    sha: commit.sha,
    force: false,
  });

  console.log('Pushed successfully via GitHub API');
  console.log('Commit:', commit.sha);
}

main().catch((err) => {
  console.error('Push failed:', err.message);
  process.exit(1);
});
