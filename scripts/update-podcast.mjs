// GitHub Actions checks Spotify and saves new podcast episodes, never music.
import { readFile, writeFile } from 'node:fs/promises';

const clientId = process.env.SPOTIFY_CLIENT_ID;
const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;
const output = 'data/last-podcast.json';
if (!clientId || !refreshToken) {
  console.log('Spotify credentials are not configured yet; skipping.');
  process.exit(0);
}

async function requestJson(url, options) {
  const response = await fetch(url, options);
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Spotify request failed (${response.status}): ${body.slice(0, 200)}`);
  }
  if (response.status === 204) return null;
  return response.json();
}

const token = await requestJson('https://accounts.spotify.com/api/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: clientId
  })
});
if (!token.access_token) throw new Error('Spotify returned no access token.');

const playing = await requestJson(
  'https://api.spotify.com/v1/me/player/currently-playing?additional_types=episode',
  { headers: { Authorization: `Bearer ${token.access_token}` } }
);
const item = playing?.item;
if (!playing?.is_playing || item?.type !== 'episode') {
  console.log('No podcast playing: music, ads, and silence do not overwrite the last episode.');
  process.exit(0);
}
const url = item.external_urls?.spotify;
if (!item.id || !item.name || !url?.startsWith('https://open.spotify.com/episode/')) {
  console.log('Episode details incomplete; preserving existing record.');
  process.exit(0);
}
const saved = JSON.parse(await readFile(output, 'utf8'));
if (saved.episode?.id === item.id) {
  console.log('Same episode; nothing to update.');
  process.exit(0);
}
const artwork = item.images?.[0]?.url || item.show?.images?.[0]?.url || '';
const episode = {
  id: item.id,
  title: item.name,
  show: item.show?.name || 'Podcast',
  artwork_url: artwork.startsWith('https://') ? artwork : null,
  url,
  detected_at: new Date().toISOString()
};
await writeFile(output, JSON.stringify({ episode }, null, 2) + '\n');
console.log('Saved new podcast episode:', episode.title);
