const fs = require('fs');
const path = require('path');
const { fetchParkinsonsPosts } = require('../src/reddit');
const { rankPosts } = require('../src/ranking');
const { timeAgo } = require('../src/utils');

const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'data');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'posts.json');

async function main() {
  try {
    const start = Date.now();

    const allPosts = await fetchParkinsonsPosts();

    if (allPosts.length === 0) {
      console.error('FATAL ERROR: Reddit returned 0 posts (all requests likely blocked with 403).');
      console.error('This usually means the runner IP is blocked by Reddit.');
      console.error('Keeping existing data file unchanged.');
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

    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2));

    console.log(`Fetched ${allPosts.length} raw posts → ${topPosts.length} ranked → saved to public/data/posts.json (${fetchTime}s)`);
  } catch (err) {
    console.error('FATAL ERROR:', err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

main();
