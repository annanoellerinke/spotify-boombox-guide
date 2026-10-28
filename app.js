const $ = (id) => document.getElementById(id);
const PAGE_SIZE = 20;
const doodles = {
  heart: '<svg class="doodle" viewBox="0 0 32 32"><path d="M16 27C12 22 3 15 4 9C5 2 13 3 16 10C19 1 28 3 28 10C28 16 21 24 16 27Z"/></svg>',
  star: '<svg class="doodle" viewBox="0 0 32 32"><path d="m16 3 4 10 10-1-8 7 3 11-9-7-10 6 3-11-7-5 11-1Z"/><path d="m7 22 19-9"/></svg>',
  smile: '<svg class="doodle" viewBox="0 0 32 32"><path d="m10 5 1 6m10-7v7M3 15c3 17 22 17 26-1"/></svg>'
};
let config, playlists, selected, page = 0, activeTrack = -1;
let controller = null, ready = false, playing = false, pendingPlay = false;
let currentEntity = '', lastAnnounced = '', loadTimer, startTimer;

function announce(text) {
  if (text !== lastAnnounced) { $('announcement').textContent = text; lastAnnounced = text; }
}
function status(text) { $('deck-status').textContent = text; }
function setPlaying(value) {
  playing = value;
  $('boombox').classList.toggle('is-playing', value);
}
function playlistUrl() { return selected.url + '?theme=0'; }
// Stable, small variations give live text a handwritten rhythm without
// changing any letters, words, accessible names, or playlist data.
function writeByHand(element, text, seed = 0) {
  element.replaceChildren();
  if (element.matches('h1,h2,h3')) element.setAttribute('aria-label', text);
  else element.setAttribute('aria-hidden', 'true');
  text.split(' ').forEach((word, wordIndex) => {
    if (wordIndex) element.append(document.createTextNode(' '));
    const wordSpan = document.createElement('span');
    wordSpan.className = 'ink-word';
    wordSpan.setAttribute('aria-hidden', 'true');
    [...word].forEach((letter, index) => {
      const character = document.createElement('span');
      character.className = 'ink-letter';
      character.textContent = letter;
      const value = (letter.charCodeAt(0) * 17 + index * 13 + wordIndex * 7 + seed * 11) % 19;
      character.style.setProperty('--ink-angle', `${(value - 9) * .32}deg`);
      character.style.setProperty('--ink-lift', `${((value % 5) - 2) * .016}em`);
      character.style.setProperty('--ink-size', `${.97 + (value % 7) * .01}`);
      wordSpan.append(character);
    });
    element.append(wordSpan);
  });
}
function renderTapes() {
  $('tapes').replaceChildren();
  for (const playlist of playlists) {
    const button = document.createElement('button');
    button.className = 'tape';
    button.dataset.playlistId = playlist.id;
    button.setAttribute('aria-label', `Load ${playlist.title}, ${playlist.tracks.length} songs`);
    button.setAttribute('aria-pressed', String(playlist.id === selected.id));
    const art = document.createElement('span');
    art.className = 'tape-art';
    const img = document.createElement('img');
    img.src = 'cassette.png'; img.alt = ''; img.width = 1536; img.height = 1024; img.draggable = false;
    const label = document.createElement('span');
    label.className = 'tape-label hand' + (playlist.title.length > 9 ? ' long-title' : '');
    label.setAttribute('aria-hidden', 'true');
    const title = document.createElement('span'); title.className = 'tape-title'; writeByHand(title, playlist.title);
    const doodle = document.createElement('span'); doodle.innerHTML = doodles[playlist.doodle] || doodles.heart;
    label.append(title, doodle); art.append(img, label);
    const indicator = document.createElement('span'); indicator.className = 'tape-indicator'; indicator.textContent = 'selected'; indicator.setAttribute('aria-hidden', 'true');
    button.append(art, indicator);
    button.addEventListener('click', () => selectPlaylist(playlist.id));
    $('tapes').append(button);
  }
}
function renderSongs() {
  const start = page * PAGE_SIZE;
  for (const [side, offset] of [['side-a', 0], ['side-b', 10]]) {
    const list = $(side);
    list.replaceChildren();
    list.start = start + offset + 1;
    for (let row = 0; row < 10; row++) {
      const index = start + offset + row;
      const song = selected.tracks[index];
      const li = document.createElement('li');
      li.style.gridRow = row + 1;
      li.style.gridColumn = offset === 0 ? 1 : 2;
      if (song) {
        const button = document.createElement('button');
        button.className = 'song-button'; button.dataset.trackIndex = index;
        button.setAttribute('aria-label', `Play ${song.title} by ${song.artist}`);
        button.setAttribute('aria-current', String(index === activeTrack));
        button.title = `${song.title} — ${song.artist}`;
        const number = document.createElement('span'); number.className = 'song-number'; number.textContent = index + 1; number.setAttribute('aria-hidden','true');
        const name = document.createElement('span'); name.className = 'song-name' + (song.title.length > 24 ? ' long' : ''); writeByHand(name, song.title, index);
        button.append(number, name);
        button.addEventListener('click', () => playTrack(index));
        li.append(button);
      } else { li.setAttribute('aria-hidden', 'true'); }
      list.append(li);
    }
  }
  const count = selected.tracks.length;
  const end = Math.min(start + PAGE_SIZE, count);
  $('page-range').textContent = start + 1 === end ? `Song ${end} of ${count}` : `Songs ${start + 1}–${end} of ${count}`;
  const next = $('next-page');
  next.disabled = count <= PAGE_SIZE;
  next.querySelector('span').textContent = count <= PAGE_SIZE ? 'All songs' : end === count ? 'Back to start' : `Next ${Math.min(PAGE_SIZE, count - end)}`;
  next.setAttribute('aria-label', count <= PAGE_SIZE ? 'All songs are shown' : end === count ? 'Show the first 20 songs' : `Show songs ${end + 1} to ${Math.min(end + PAGE_SIZE, count)}`);
}
function highlightSong() {
  document.querySelectorAll('.song-button').forEach(button => button.setAttribute('aria-current', String(Number(button.dataset.trackIndex) === activeTrack)));
}
function renderSelection() {
  writeByHand($('playlist-title'), selected.title);
  writeByHand($('loaded-title'), selected.title);
  document.querySelector('.loaded-label').classList.toggle('long-title', selected.title.length > 9);
  $('loaded-doodle').innerHTML = doodles[selected.doodle] || doodles.heart;
  $('insert-doodle').innerHTML = doodles[selected.doodle] || doodles.heart;
  $('spotify-link').href = selected.url;
  $('spotify-link').setAttribute('aria-label', `Open ${selected.title} in Spotify`);
  document.querySelectorAll('.tape').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.playlistId === selected.id)));
  renderSongs();
}
function selectPlaylist(id) {
  const match = playlists.find(p => p.id === id);
  if (!match || match === selected) return;
  // Loading the new iframe stops the old tape; don't send commands to an
  // iframe that may still be loading after a quick selection change.
  selected = match; page = 0; activeTrack = -1; pendingPlay = false;
  clearTimeout(startTimer); setPlaying(false);
  renderSelection(); loadEntity(playlistUrl(), false);
  status(`${selected.title} · ready to play`);
  announce(`${selected.title} loaded. ${selected.tracks.length} songs. Showing the first ${Math.min(20, selected.tracks.length)}.`);
  $('boombox').classList.add('changing');
  setTimeout(() => $('boombox').classList.remove('changing'), 170);
}
function requestPlayback() {
  if (!controller || !ready) {
    pendingPlay = true;
    status('Spotify is loading…');
    return;
  }
  pendingPlay = false;
  controller.play();
  status('Starting in Spotify…');
  clearTimeout(startTimer);
  startTimer = setTimeout(() => {
    if (!playing) status('Press play in the Spotify player below.');
  }, 4500);
}
function loadEntity(url, autoplay) {
  pendingPlay = autoplay;
  if (url === currentEntity && ready) { if (autoplay) requestPlayback(); return; }
  currentEntity = url;
  if (!controller) return;
  ready = false;
  controller.loadEntity(url);
  armLoadTimeout();
}
function playTrack(index) {
  if (index < 0 || index >= selected.tracks.length) return;
  activeTrack = index;
  const track = selected.tracks[index];
  highlightSong();
  setPlaying(false);
  status(`Loading ${track.title}…`);
  const trackId = track.uri.split(':')[2];
  loadEntity(`https://open.spotify.com/track/${trackId}?theme=0`, true);
}
function armLoadTimeout() {
  clearTimeout(loadTimer);
  $('player-help').hidden = true;
  loadTimer = setTimeout(() => { if (!ready) $('player-help').hidden = false; }, 12000);
}
function connectSpotify() {
  currentEntity = playlistUrl();
  window.onSpotifyIframeApiReady = api => {
    api.createController($('spotify-player'), {url: currentEntity, width:'100%', height:152}, embed => {
      controller = embed;
      embed.addListener('ready', () => {
        ready = true;
        clearTimeout(loadTimer);
        $('player-help').hidden = true;
        document.querySelector('#player-shell iframe')?.setAttribute('title', 'Spotify music player');
        if (pendingPlay) requestPlayback();
      });
      embed.addListener('playback_started', event => {
        const index = selected.tracks.findIndex(t => t.uri === event.data.playingURI);
        if (index >= 0) { activeTrack = index; highlightSong(); }
      });
      embed.addListener('playback_update', event => {
        const data = event.data;
        const index = selected.tracks.findIndex(t => t.uri === data.playingURI);
        if (data.playingURI && index < 0) return; // Ignore events from a tape just unloaded.
        if (index >= 0 && index !== activeTrack) { activeTrack = index; highlightSong(); }
        setPlaying(!data.isPaused && !data.isBuffering);
        if (playing) {
          clearTimeout(startTimer);
          const track = selected.tracks[activeTrack];
          status(track ? `Playing · ${track.title}` : `Playing · ${selected.title}`);
        } else if (data.isBuffering) status('Buffering in Spotify…');
        else if (data.position > 0) status(`Paused · ${selected.title}`);
      });
    });
  };
  const script = document.createElement('script');
  script.src = 'https://open.spotify.com/embed/iframe-api/v1'; script.async = true;
  script.onerror = () => { $('player-help').hidden = false; status('Use Open in Spotify to listen.'); };
  document.body.append(script);
  armLoadTimeout();
}
async function init() {
  const responses = await Promise.all([fetch('config.json'), fetch('playlists.json')]);
  if (responses.some(r => !r.ok)) throw new Error('Playlist files could not be loaded.');
  const [settings, snapshot] = await Promise.all(responses.map(r => r.json()));
  config = settings; playlists = snapshot.playlists;
  if (!playlists?.length || playlists.some(p => !p.tracks?.length)) throw new Error('No playlist songs are available.');
  selected = playlists.find(p => p.id === config.initialPlaylist) || playlists[0];
  const owner = config.owner.trim() || 'Anna';
  $('site-title').textContent = `${owner}’s Spotify`;
  document.title = `${owner}'s Spotify`;
  document.querySelectorAll('.owner-mark').forEach(mark => mark.textContent = owner.toLocaleUpperCase());
  document.documentElement.style.setProperty('--owner-scale', Math.min(1, 4 / owner.length));
  renderTapes(); renderSelection(); connectSpotify();
  $('next-page').addEventListener('click', () => {
    page = (page + 1) % Math.ceil(selected.tracks.length / PAGE_SIZE);
    renderSongs();
    $('next-page').classList.remove('turning');
    requestAnimationFrame(() => $('next-page').classList.add('turning'));
    announce(`${selected.title}. ${$('page-range').textContent}.`);
  });
  $('play').addEventListener('click', requestPlayback);
  $('pause').addEventListener('click', () => {
    pendingPlay = false; clearTimeout(startTimer); if (ready) controller?.pause(); setPlaying(false); status(`Paused · ${selected.title}`);
  });
  $('stop').addEventListener('click', () => {
    pendingPlay = false; clearTimeout(startTimer); setPlaying(false); activeTrack = -1; highlightSong();
    // Reload the playlist to reset playback without starting it again.
    currentEntity = ''; loadEntity(playlistUrl(), false); status(`${selected.title} · stopped`);
  });
  $('previous-track').addEventListener('click', () => playTrack(Math.max(0, activeTrack - 1)));
  $('next-track').addEventListener('click', () => playTrack((Math.max(0, activeTrack) + 1) % selected.tracks.length));
}
init().catch(error => {
  $('load-error').textContent = 'The tapes couldn’t load. Please refresh this page.';
  $('load-error').hidden = false;
  console.error(error);
});
