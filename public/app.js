function escapeHtml(str) {
  var div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function timeAgo(utcTimestamp) {
  var seconds = Math.floor(Date.now() / 1000 - utcTimestamp);
  if (seconds < 60) return 'just now';
  var minutes = Math.floor(seconds / 60);
  if (minutes < 60) return minutes + ' minute' + (minutes === 1 ? '' : 's') + ' ago';
  var hours = Math.floor(minutes / 60);
  return hours + ' hour' + (hours === 1 ? '' : 's') + ' ago';
}

function timeAgoFromISO(isoString) {
  var ms = Date.now() - new Date(isoString).getTime();
  var minutes = Math.floor(ms / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return minutes + ' minute' + (minutes === 1 ? '' : 's') + ' ago';
  var hours = Math.floor(minutes / 60);
  return hours + ' hour' + (hours === 1 ? '' : 's') + ' ago';
}

document.addEventListener('DOMContentLoaded', function() {
  var postsEl = document.getElementById('posts');
  var metaEl = document.getElementById('metadata');

  fetch('data/posts.json')
    .then(function(r) { return r.json(); })
    .then(function(data) {
      if (!data.fetchedAt || !data.posts || data.posts.length === 0) {
        postsEl.innerHTML = '<div class="notice">No data yet \u2014 data updates automatically every 15 minutes. If you just deployed, trigger the GitHub Action manually.</div>';
        return;
      }

      metaEl.textContent = 'Scanned ' + data.totalScanned + ' posts \u00B7 Last updated ' +
        timeAgoFromISO(data.fetchedAt) + ' \u00B7 Data refreshes every 15 min';

      var html = '';
      if (data.posts.length < 4) {
        html += '<p class="notice notice--info">Only ' + data.posts.length +
          ' post' + (data.posts.length === 1 ? '' : 's') + ' met the engagement threshold.</p>';
      }

      html += '<div class="grid">';
      for (var i = 0; i < data.posts.length; i++) {
        var post = data.posts[i];
        var topClass = i === 0 ? ' card--top' : '';
        html += '<article class="card' + topClass + '">' +
          '<span class="rank">#' + (i + 1) + '</span>' +
          '<h2 class="card__title"><a href="' + escapeHtml(post.permalink) +
            '" target="_blank" rel="noopener noreferrer">' + escapeHtml(post.title) + '</a></h2>' +
          '<div class="card__meta">' +
            '<span class="pill">' + escapeHtml(post.subreddit) + '</span>' +
            '<span class="author">u/' + escapeHtml(post.author) + '</span>' +
            '<span class="age">' + timeAgo(post.created_utc) + '</span>' +
          '</div>' +
          '<div class="card__metrics">' +
            '<span title="Upvotes">\u2191 ' + post.score + '</span>' +
            '<span title="Comments">\uD83D\uDCAC ' + post.num_comments + '</span>' +
            '<span title="Upvote ratio">' + Math.round(post.upvote_ratio * 100) + '%</span>' +
          '</div>' +
          '<div class="card__bottom">' +
            '<span class="momentum" title="Engagements per hour">\u26A1 ' + post.momentum + '/hr</span>' +
            '<span class="composite">Score: ' + post.composite_score + '</span>' +
          '</div>' +
          '</article>';
      }
      html += '</div>';
      postsEl.innerHTML = html;
    })
    .catch(function() {
      postsEl.innerHTML = '<div class="notice notice--error">Failed to load post data.</div>';
    });
});
