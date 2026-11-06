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

(function () {
  const widget = document.querySelector('.podcast-widget');
  if (!widget || widget.querySelector('.spotify-story')) return;

  const css = document.createElement('style');
  css.textContent = `
    .spotify-story { margin-top:12px; padding-top:0; border-top:0; }    
    .spotify-story summary { display:block; list-style:none; cursor:pointer; color:var(--secondary,#646761); font-size:13px; line-height:1.65; font-weight:400; }
    .spotify-story summary::-webkit-details-marker { display:none; }
    .spotify-story summary:focus-visible { outline:2px solid var(--ink,#222321); outline-offset:4px; }
    .spotify-story .story-link { color:var(--ink,#222321); text-decoration:underline; text-underline-offset:3px; font-weight:400; }
    .spotify-story .story-body { padding:22px 0 2px; font-size:14px; }
    .spotify-story .story-body p { margin:0 0 16px; font-size:14px; line-height:1.75; font-weight:400; }
    .spotify-story .story-title { margin:0 0 14px; font-size:18px; font-weight:400; letter-spacing:-.02em; }
    .spotify-story .story-timeline { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); border:1px solid var(--line,#d9d9d4); border-radius:3px; margin:19px 0 22px; }
    .spotify-story .story-step { padding:12px; border-right:1px solid var(--line,#d9d9d4); font-size:12px; line-height:1.5; color:var(--secondary,#646761); }
    .spotify-story .story-step:last-child { border-right:0; }
    .spotify-story .story-time { display:block; margin-bottom:4px; color:var(--ink,#222321); font-weight:400; }
    .spotify-story .story-insight { margin:23px 0; padding-left:16px; border-left:2px solid var(--line,#d9d9d4); font-size:19px; font-weight:400; line-height:1.4; }
    .spotify-story .story-footer { margin-top:18px; padding-top:12px; border-top:1px solid var(--line,#d9d9d4); font-size:12px; color:var(--secondary,#646761); }
    @media(max-width:430px) {
      .spotify-story .story-timeline { grid-template-columns:repeat(2,minmax(0,1fr)); }
      .spotify-story .story-step:nth-child(2) { border-right:0; }
      .spotify-story .story-step:nth-child(-n+2) { border-bottom:1px solid var(--line,#d9d9d4); }
    }
  `;
  document.head.appendChild(css);

  const details = document.createElement('details');
  details.className = 'spotify-story';
  details.innerHTML = `
    <summary>Yes, it updates automatically :)  <span class="story-link">Here's how.</span></summary>
    <div class="story-body">
      <h3 class="story-title">How I built this</h3>
      <p>I wanted my portfolio to show the most recent podcast I'd listened to, without having to update it myself. I started by creating a Spotify developer app and connecting it to a GitHub Actions workflow that checked Spotify every 30 minutes.</p>
      <p>It worked, but I realized how easy it was to miss something. Say I started a podcast at 12:05 and switched to music at 12:20. When GitHub checked at 12:30, it would see the music instead.</p>
      <div class="story-timeline" aria-label="Example of a missed podcast">
        <div class="story-step"><span class="story-time">12:00</span>GitHub checks</div>
        <div class="story-step"><span class="story-time">12:05</span>I start a podcast</div>
        <div class="story-step"><span class="story-time">12:20</span>I switch to music</div>
        <div class="story-step"><span class="story-time">12:30</span>The podcast gets missed</div>
      </div>
      <p>I could have made GitHub check more often, but that still meant choosing an arbitrary interval and hoping for the best.</p>
      <p>Then I thought about what I actually do when I listen to a podcast: I open Spotify, pick an episode, and leave the app while it plays.</p>
      <div class="story-insight">What if I just made it check whenever I closed Spotify?</div>
      <p>I used Apple's Shortcuts app to trigger the GitHub workflow whenever I leave Spotify. The workflow checks what's playing, saves a new episode if it finds one, and ignores music so it doesn't replace the last podcast. I kept scheduled checks as a backup, too.</p>
      <p>Now the check happens when I'm most likely to have just started listening to something new, rather than only when a timer happens to go off.</p>
      <div class="story-footer">Spotify API · GitHub Actions · Apple Shortcuts</div>
    </div>
  `;
  widget.appendChild(details);
})();
