"""Refresh the demo's title/track snapshot from Spotify's public embed pages.

Uses only public playlist metadata, not cookies, credentials or audio files.
Spotify can change this page format; an incomplete fetch leaves the old file intact.
"""
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import Request, urlopen
import json
import re

ROOT = Path(__file__).resolve().parent


def read_playlist(item):
    pid = item['id']
    if not re.fullmatch(r'[A-Za-z0-9]{22}', pid):
        raise ValueError('Invalid Spotify playlist ID')
    request = Request('https://open.spotify.com/embed/playlist/' + pid,
                      headers={'User-Agent': 'Mozilla/5.0'})
    with urlopen(request, timeout=30) as response:
        html = response.read().decode()
    match = re.search(r'<script id="__NEXT_DATA__"[^>]*>(.*?)</script>', html)
    if not match:
        raise ValueError('Spotify embed metadata format changed')
    entity = json.loads(match[1])['props']['pageProps']['state']['data']['entity']
    tracks = entity.get('trackList', [])
    if not entity.get('title') or not tracks:
        raise ValueError('No title or tracks returned for ' + pid)
    return {
        'id': pid,
        'title': entity['title'],
        'url': 'https://open.spotify.com/playlist/' + pid,
        'doodle': item.get('doodle', 'heart'),
        'tracks': [{'title': t['title'], 'artist': t.get('subtitle', ''),
                    'uri': t['uri'], 'duration': t.get('duration', 0)} for t in tracks]
    }


if __name__ == '__main__':
    config = json.loads((ROOT / 'config.json').read_text())
    with ThreadPoolExecutor(max_workers=3) as pool:
        playlists = list(pool.map(read_playlist, config['playlists']))
    payload = {'updatedAt': datetime.now(timezone.utc).isoformat(), 'playlists': playlists}
    target = ROOT / 'playlists.json'
    temporary = target.with_suffix('.tmp')
    temporary.write_text(json.dumps(payload, indent=2, ensure_ascii=False) + '\n')
    temporary.replace(target)
    for playlist in playlists:
        print(f"{playlist['title']}: {len(playlist['tracks'])} tracks")
