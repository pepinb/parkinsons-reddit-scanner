# Parkinson's Reddit Scanner

A static site that displays the top trending Parkinson's-related Reddit posts from the last 24 hours, ranked by engagement and momentum.

## How it works

1. A **GitHub Action** runs every 15 minutes and fetches posts from Reddit's public JSON API
2. Posts are ranked by a composite score combining **engagement** (upvotes + 2x comments) and **momentum** (engagement per hour)
3. The top 4 posts are saved to `public/data/posts.json`
4. **Vercel** serves the static site, which reads and displays the JSON data

Reddit blocks requests from cloud provider IPs (like Vercel's), so data fetching happens in GitHub Actions (which use different IP ranges) and the results are committed to the repo.

## Reddit endpoints used

- `r/Parkinsons/new.json` — latest posts
- `r/Parkinsons/hot.json` — trending posts
- `search.json` — cross-Reddit search for Parkinson's keywords (levodopa, DBS, etc.)

No API key or OAuth required. Only a `User-Agent` header is needed.

## Setup

1. Push this repo to GitHub
2. Connect the repo to [Vercel](https://vercel.com) — it will auto-detect the static site config
3. Go to your GitHub repo → **Actions** tab → **Fetch Reddit Data** → **Run workflow** to seed initial data
4. Subsequent updates happen automatically every 15 minutes

## Local development

```bash
# Fetch fresh data from Reddit
node scripts/fetch-and-save.js

# Serve the static site
npx serve public
```

Then open [http://localhost:3000](http://localhost:3000).

## Project structure

```
├── .github/workflows/fetch-reddit.yml   # Scheduled GitHub Action
├── scripts/fetch-and-save.js            # Fetches, ranks, saves to JSON
├── src/
│   ├── config.js                        # Subreddits, search query, thresholds
│   ├── reddit.js                        # Reddit API fetcher
│   ├── ranking.js                       # Engagement + momentum scoring
│   └── utils.js                         # delay(), timeAgo()
├── public/
│   ├── data/posts.json                  # Generated data (committed to repo)
│   ├── index.html                       # Static HTML page
│   ├── styles.css                       # Styles
│   └── app.js                           # Client-side rendering
├── vercel.json                          # Vercel static site config
└── package.json
```
