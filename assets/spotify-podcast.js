(function () {
  'use strict';
  const anchor = document.querySelector('.currently-reading');
  if (!anchor) return;

  const style = document.createElement('style');
  style.textContent = `
    .podcast-widget { margin-top:28px; padding-top:21px; border-top:1px solid var(--line,#d9d9d4); max-width:630px; }
    .podcast-widget .podcast-kicker { margin:0 0 17px!important; color:var(--secondary,#646761); font-size:11px!important; font-weight:650; letter-spacing:.095em; text-transform:uppercase; }
    .podcast-widget .podcast-content { display:flex; align-items:flex-start; gap:20px; }
    .podcast-widget .podcast-art { width:92px; height:92px; object-fit:cover; border:1px solid var(--line,#d9d9d4); border-radius:3px; background:#f0e9da; flex:none; }
    .podcast-widget .podcast-title { margin:0 0 5px; font-size:16px; font-weight:620; line-height:1.4; letter-spacing:-.02em; }
    .podcast-widget .podcast-title a { text-decoration:none; }
    .podcast-widget .podcast-title a:hover { text-decoration:underline; }
    .podcast-widget .podcast-show { margin:0!important; color:var(--secondary,#646761); font-size:13px!important; }
    .podcast-widget .podcast-note { margin:9px 0 0!important; color:var(--secondary,#646761); font-size:12px!important; }
    @media(max-width:430px){.podcast-widget .podcast-art{width:78px;height:78px}.podcast-widget .podcast-content{gap:15px}}
  `;
  document.head.appendChild(style);

  const section = document.createElement('section');
  section.className = 'podcast-widget';
  section.setAttribute('aria-label', 'Latest podcast listened to');
  section.hidden = true;
  section.innerHTML = '<p class="podcast-kicker">Latest podcast I’ve listened to</p><div class="podcast-content"><img class="podcast-art" alt="Podcast cover" width="92" height="92" loading="lazy"><div><h3 class="podcast-title"><a target="_blank" rel="noopener noreferrer"></a></h3><p class="podcast-show"></p><p class="podcast-note">Listen on Spotify ↗</p></div></div>';
  anchor.insertAdjacentElement('afterend', section);
  const img = section.querySelector('img');
  const title = section.querySelector('a');
  const show = section.querySelector('.podcast-show');

  async function refresh() {
    try {
      const response = await fetch('/data/last-podcast.json?t=' + Date.now(), { cache: 'no-store' });
      if (!response.ok) return;
      const data = await response.json();
      const episode = data.episode;
      if (!episode || typeof episode.title !== 'string' || typeof episode.show !== 'string' ||
          !/^https:\/\/open\.spotify\.com\/episode\/[a-zA-Z0-9]+/.test(episode.url || '')) return;
      title.textContent = episode.title;
      title.href = episode.url;
      section.querySelector('.podcast-note').innerHTML = '<a href="' + episode.url + '" target="_blank" rel="noopener noreferrer">Listen on Spotify ↗</a>';
      show.textContent = episode.show;
      if (typeof episode.artwork_url === 'string' && /^https:\/\//.test(episode.artwork_url)) {
        img.src = episode.artwork_url;
        img.style.display = '';
      } else {
        img.removeAttribute('src');
        img.style.display = 'none';
      }
      section.hidden = false;
    } catch (e) { /* Site should still work if podcast data is unavailable. */ }
  }
  refresh();
  setInterval(refresh, 5 * 60 * 1000);
})();
