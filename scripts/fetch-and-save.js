const fs = require('fs');
const path = require('path');
const { fetchParkinsonsPosts } = require('../src/reddit');
const { rankPosts } = require('../src/ranking');
const { timeAgo } = require('../src/utils');

const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'data');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'posts.json');

async function main() {
  const start = Date.now();

  const allPosts = await fetchParkinsonsPosts();

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

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2));

  console.log(`Fetched ${allPosts.length} raw posts → ${topPosts.length} ranked → saved to public/data/posts.json (${fetchTime}s)`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
