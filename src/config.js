const CONFIG = {
  SUBREDDITS: ['Parkinsons'],

  SEARCH_QUERY: 'Parkinsons OR "Parkinson disease" OR levodopa OR "deep brain stimulation"',

  TOP_N: 4,
  ENGAGEMENT_WEIGHT: 0.5,
  MOMENTUM_WEIGHT: 0.5,
  COMMENT_MULTIPLIER: 2,
  MIN_ENGAGEMENT: 2,
  MIN_AGE_HOURS: 0.5,

  REQUEST_DELAY_MS: 2000,
  REQUEST_TIMEOUT_MS: 10000,
  OVERALL_TIMEOUT_MS: 45000,
  TIME_WINDOW_HOURS: 24,

  PORT: 3000,
};

module.exports = { CONFIG };
