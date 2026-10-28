# Spotify boombox: build brief

Use this with [README.md](README.md) and [PERSONALIZE.md](PERSONALIZE.md). Build a separate, personalized website. [Anna's live example](https://anna-spotify-boombox.vercel.app/) shows the intended interaction and photographic style.

## Start with the person and the aesthetic

Ask for their name, exact public playlist URLs, initial selection, and visual references. Start with three tapes unless they request a different number. Collect missing preferences in small groups. Verify the playlist titles and song order instead of inventing them.

Explain the proposed layout and interaction. Show an aesthetic mockup and get feedback before implementing a new visual direction. Save approved versions before making large changes. The user can keep the included look or replace the object, materials, labels, handwriting, and background.

Keep the beginner's workflow simple: create the files, manage the local preview, and explain only the choices they need to make. Do not require a manual GitHub upload or terminal setup just to begin.

## Use the working example

The repository is a buildless HTML, CSS, and JavaScript site. All required files are at the repository root. Download or clone it into a new project; do not copy Anna's deployment identity. No `.vercel` directory, environment files, credentials, or private reference images are included.

Run a local HTTP server from that directory. For example, if Python is available:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Open `http://127.0.0.1:4173/`. Use another available port if needed. Opening `index.html` directly as a file can prevent the JSON data from loading.

`styles.css` establishes the layout. `character.css` adds the approved paper treatment, live handwriting, printed branding, and Bevan heading. `app.js` manages selection, pagination, and the Spotify iframe. Preserve those layers when changing a small aesthetic detail.

## Personalize the content

Edit `config.json`:

```json
{
  "owner": "YOUR NAME",
  "initialPlaylist": "FIRST_PLAYLIST_ID",
  "playlists": [
    { "id": "FIRST_PLAYLIST_ID", "doodle": "star" },
    { "id": "SECOND_PLAYLIST_ID", "doodle": "heart" },
    { "id": "THIRD_PLAYLIST_ID", "doodle": "smile" }
  ]
}
```

The ID is the part after `/playlist/` in the user's Spotify link, before any `?` query. The values above are placeholders, not working IDs. Match `initialPlaylist` to one of the configured playlists. The included working config uses Anna's real public examples.

Update `playlists.json` to contain the same playlists and their actual metadata. **The browser renders the playlists from this snapshot; changing only the IDs in `config.json` does not replace the song lists.** The config is the input to the optional importer:

```sh
python3 sync-playlists.py
```

This helper reads public Spotify embed-page metadata, without cookies, credentials, or audio files. It is an unofficial convenience, not a guaranteed or complete Spotify data API. Spotify may change the page format, omit tracks, or block a request. The script preserves the old snapshot if a request fails, but a successful request alone does not prove the playlist is complete.

Compare the result with the user's playlist: title, total count, order, first tracks, and last tracks. If anything is missing, tell the user. Use a user-supplied track list, or an appropriately authorized Spotify Web API integration with pagination if available. Do not claim automatic sync, bypass access restrictions, or silently keep Anna's data when a personal import fails. Keep any credentials out of public files. [Spotify Web API documentation](https://developer.spotify.com/documentation/web-api).

A snapshot contains `updatedAt` and a `playlists` array. Each playlist has `id`, `title`, `url`, `doodle`, and `tracks`. Each track has its exact `title`, `artist`, Spotify `uri`, and `duration` in milliseconds. Retain the playlist order. Refreshing this file and redeploying updates the handwritten list; the embedded Spotify player can change independently.

Also review the page description, initial HTML text and link, favicon, small captions, and any sharing metadata added during customization. The live app updates the main name and playlist display after loading, but source fallbacks should match the new owner too.

## Preserve the interaction

- Each tape is a real button with its playlist name and selected state. Selecting it updates the loaded label, insert, songs, official player, and Open in Spotify destination. Selection starts on page one and does not autoplay.
- Show up to 20 tracks per page: the first ten on side A, the next ten on side B. Keep numbering continuous across pages and keep each row tall enough for the longer title on either side.
- The refresh-style button advances to the next batch. Label a partial batch accurately, then let the final page return to the start. Disable paging for playlists with 20 or fewer tracks. This is pagination, not a Spotify refresh.
- Clicking a handwritten song requests that exact Spotify track. Previous and Next use the selected playlist's saved order. Play, Pause, and Stop are accessible controls aligned with the boombox artwork. Do not imply decorative volume or tuner knobs work unless implemented.
- Keep a visible official player and a separate Open in Spotify link for every selected playlist. The latter must use the user's exact playlist destination.

## Let Spotify handle the audio

Use the [official Spotify embed](https://developer.spotify.com/documentation/embeds) and its [iframe API](https://developer.spotify.com/documentation/embeds/references/iframe-api). The example uses `createController`, `loadEntity`, `play`, and `pause`, plus ready and playback events. Follow current documentation if the API changes.

Do not download, proxy, or re-host music. Do not promise full tracks or universal playback. Spotify controls the available preview or listening experience, sign-in, and account requirements. A browser may require the first Play action inside the native Spotify player. Keep that control usable and show a helpful fallback when a decorative control cannot start it. A visible Pause icon alone is not proof that audio has started; confirm a playback event when testing.

The paper insert should remain usable if Spotify loads slowly. Don't autoplay on page load or tape selection. Stop or pause audio after tests.

## Keep the photographic character

Read [ASSETS.md](ASSETS.md). The boombox and cassette are transparent images. Their playlist labels, doodles, controls, and the entire paper insert are live HTML/CSS. This is what allows real playlists to retain the mockup's character.

Keep tapes flat, horizontal, and front-facing when preserving Anna's direction. Use clean cream plastic, convincing chrome, soft light, and restrained shadows. Handwriting should feel playful without sacrificing legibility. Use real web fonts with their licenses rather than baking songs into an image.

The control positions and label overlays fit the included artwork. If the composition, cropping, or object changes, realign every overlay and check at several sizes. More tapes, long playlist titles, longer owner names, or different fonts may require layout changes; do not assume they will fit unchanged.

## Check the personalized site

Test every playlist and every page, including the final partial page and return to start. Check a short playlist, the longest titles, exact Spotify links, and that no previous tape keeps playing after a switch. Confirm playback and pause with the official player as well as the boombox controls, and state any browser limits you encounter.

Check desktop and 320–390 px phone widths: no sideways scrolling, title overlap, clipped songs, or misplaced controls. The tapes must remain distinguishable. Check keyboard access, visible focus, readable accessible names, selected-state announcements, and reduced-motion behavior. Request testing on the user's own phone too; emulated widths do not prove every device works.

## Publish the approved version

After the user asks to publish, use their Vercel account and a separate project for their version. Resolve the intended account/project before deploying. Guide any sign-in through the service, not by asking for passwords or tokens in chat. Disclose any required cost before proceeding.

For this static example, use Framework Preset **Other**, the project root as the output directory (`.`), and no build command. The included `.vercelignore` excludes local credentials, guide documents, the importer, and the preview screenshot. Retain font license files. Never upload an existing `.vercel` project identity from another person's site.

Use the deployment route available in the session: an authenticated Vercel CLI or the user's GitHub/Vercel integration. [Vercel's deployment documentation](https://vercel.com/docs/deployments) describes the supported options. A GitHub account is useful for saving source, but is not required for every CLI deployment route.

Wait for the deployment to be ready. Open the public URL without relying on an owner login, check the published assets and content, and repeat the core mobile and playlist checks. Give the user the live URL and a brief, honest account of what was tested. If deployment is blocked, name the actual blocker and preserve the ready-to-publish files.

For future updates, edit the same personalized project, preview it, and update its existing Vercel deployment when requested. “Next 20” never substitutes for re-importing and republishing a changed playlist snapshot.
