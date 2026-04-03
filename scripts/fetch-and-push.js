const { execSync } = require('child_process');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const log = (msg) => console.log(`[${new Date().toISOString()}] ${msg}`);

function run(cmd) {
  return execSync(cmd, { cwd: ROOT, encoding: 'utf8', timeout: 120000 }).trim();
}

async function main() {
  log('Fetch started');

  // Run the fetch script
  const { fetchParkinsonsPosts } = require('../src/reddit');
  const { rankPosts } = require('../src/ranking');
  const { timeAgo } = require('../src/utils');
  const fs = require('fs');

  const start = Date.now();
  const allPosts = await fetchParkinsonsPosts();

  if (allPosts.length === 0) {
    log('Reddit returned 0 posts (blocked). Skipping.');
    process.exit(1);
  }

  const topPosts = rankPosts(allPosts).map((p) => ({
    ...p,
    timeAgo: timeAgo(p.created_utc),
  }));

  const fetchTime = Math.round((Date.now() - start) / 100) / 10;
  const result = {
    posts: topPosts,
    totalScanned: allPosts.length,
    fetchedAt: new Date().toISOString(),
    fetchTime,
  };

  const outDir = path.join(ROOT, 'public', 'data');
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, 'posts.json'), JSON.stringify(result, null, 2));
  log(`Fetched ${allPosts.length} posts, ranked ${topPosts.length}, saved (${fetchTime}s)`);

  // Git commit and push
  run('git add public/data/posts.json');
  try {
    run('git diff --staged --quiet');
    log('No changes to push');
  } catch {
    const ts = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
    run(`git commit -m "Update Reddit data ${ts}"`);
    run('git push');
    log('Pushed updated data');
  }

  log('Fetch complete');
}

main().catch((err) => {
  log(`FATAL: ${err.message}`);
  process.exit(1);
});
