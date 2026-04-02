const { CONFIG } = require('./config');

function minMaxNormalize(values) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (max === min) return values.map(() => 1.0);
  return values.map((v) => (v - min) / (max - min));
}

function rankPosts(posts) {
  const withMetrics = posts.map((post) => {
    const engagement = post.score + CONFIG.COMMENT_MULTIPLIER * post.num_comments;
    const ageHours = (Date.now() / 1000 - post.created_utc) / 3600;
    const momentum = engagement / Math.max(ageHours, CONFIG.MIN_AGE_HOURS);
    return { ...post, engagement, momentum: Math.round(momentum * 10) / 10 };
  });

  const filtered = withMetrics.filter((p) => p.engagement >= CONFIG.MIN_ENGAGEMENT);

  console.log(`[ranking] ${posts.length} input → ${filtered.length} passed engagement filter (min ${CONFIG.MIN_ENGAGEMENT})`);

  if (filtered.length === 0) {
    console.log('[ranking] No posts survived filtering — returning empty');
    return [];
  }

  const normEngagement = minMaxNormalize(filtered.map((p) => p.engagement));
  const normMomentum = minMaxNormalize(filtered.map((p) => p.momentum));

  const scored = filtered.map((post, i) => ({
    ...post,
    normalized_engagement: normEngagement[i],
    normalized_momentum: normMomentum[i],
    composite_score:
      Math.round(
        (CONFIG.ENGAGEMENT_WEIGHT * normEngagement[i] +
          CONFIG.MOMENTUM_WEIGHT * normMomentum[i]) *
          1000
      ) / 1000,
  }));

  scored.sort((a, b) => b.composite_score - a.composite_score);

  const topN = scored.slice(0, CONFIG.TOP_N);

  console.log(`[ranking] Top ${topN.length} posts:`);
  topN.forEach((p, i) =>
    console.log(`[ranking]   #${i + 1} score=${p.composite_score} eng=${p.engagement} mom=${p.momentum}/hr "${p.title.slice(0, 60)}"`),
  );

  return topN;
}

module.exports = { rankPosts };
