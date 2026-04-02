const { CONFIG } = require('./config');
const { delay } = require('./utils');

const USER_AGENT = 'ParkinsonsRedditScanner/1.0 (health-community-tracker)';

function normalizePost(raw) {
  const d = raw.data;
  return {
    id: d.name,
    title: d.title,
    subreddit: d.subreddit_name_prefixed,
    author: d.author,
    permalink: `https://www.reddit.com${d.permalink}`,
    created_utc: d.created_utc,
    score: d.score,
    num_comments: d.num_comments,
    upvote_ratio: d.upvote_ratio,
  };
}

async function fetchEndpoint(url) {
  console.log(`Fetching: ${url}`);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': USER_AGENT },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.warn(`  HTTP ${res.status} — ${body.slice(0, 200)}`);
      return [];
    }

    const json = await res.json();
    const posts = json?.data?.children?.map(normalizePost) || [];
    console.log(`  Got ${posts.length} posts`);
    return posts;
  } catch (err) {
    clearTimeout(timeout);
    console.warn(`  Failed: ${err.message}`);
    return [];
  }
}

async function fetchParkinsonsPosts() {
  const start = Date.now();
  const allPosts = [];

  const q = encodeURIComponent(CONFIG.SEARCH_QUERY);
  const urls = [
    `https://www.reddit.com/r/Parkinsons/new.json?limit=100`,
    `https://www.reddit.com/r/Parkinsons/hot.json?limit=100`,
    `https://www.reddit.com/search.json?q=${q}&sort=new&t=day&limit=100`,
    `https://www.reddit.com/search.json?q=${q}&sort=relevance&t=day&limit=100`,
    `https://www.reddit.com/search.json?q=${q}&sort=top&t=day&limit=100`,
  ];

  for (let i = 0; i < urls.length; i++) {
    if (i > 0) await delay(2000);
    try {
      const posts = await fetchEndpoint(urls[i]);
      allPosts.push(...posts);
    } catch (err) {
      console.error(`Skipped ${urls[i]}: ${err.message}`);
    }
  }

  const rawCount = allPosts.length;

  // Time filter: keep posts from last 24 hours
  const nowSec = Date.now() / 1000;
  const cutoff = nowSec - 24 * 3600;
  const recent = allPosts.filter((p) => p.created_utc >= cutoff);

  // Deduplicate by id
  const seen = new Set();
  const unique = [];
  for (const post of recent) {
    if (!seen.has(post.id)) {
      seen.add(post.id);
      unique.push(post);
    }
  }

  // Relevance filter: keep posts from target subreddits or with keywords in title
  const targetSubs = new Set(CONFIG.SUBREDDITS.map((s) => s.toLowerCase()));
  const keywords = CONFIG.SEARCH_QUERY.toLowerCase().replace(/"/g, '').split(/\s+or\s+/);
  const relevant = unique.filter((p) => {
    const sub = p.subreddit.replace(/^r\//, '').toLowerCase();
    if (targetSubs.has(sub)) return true;
    const titleLower = p.title.toLowerCase();
    return keywords.some((kw) => titleLower.includes(kw.trim()));
  });

  const elapsed = Math.round((Date.now() - start) / 100) / 10;
  console.log(`Fetched ${rawCount} raw → ${recent.length} after time filter → ${unique.length} after dedup → ${relevant.length} after relevance (${elapsed}s)`);

  return relevant;
}

module.exports = { fetchParkinsonsPosts };
