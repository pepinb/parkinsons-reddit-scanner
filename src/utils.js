function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function timeAgo(utcTimestamp) {
  const seconds = Math.floor(Date.now() / 1000 - utcTimestamp);
  if (seconds < 60) return 'just now';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;

  const hours = Math.floor(minutes / 60);
  return `${hours} hour${hours === 1 ? '' : 's'} ago`;
}

module.exports = { delay, timeAgo };
