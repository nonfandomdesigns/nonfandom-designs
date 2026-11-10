# Ankyu’s Gate

The gate is shared by `index.html` and `characters.html`. Edit
`ankyu-gate-config.js` to change the featured character, artwork, video, lore,
and event dates. Keep explicit Eastern offsets appropriate to the event dates.
The end timestamp is exclusive. For this reveal it is November 27, 2026 at
00:00 EST (05:00 UTC), so all of Thanksgiving remains active.
When starting a future reveal, first keep the completed character as ordinary
static gallery markup, then use the hidden listing slot for the next character.

During the event, Tessumo is hidden from the regular character list. After it,
the landing invitation disappears, Ankyu’s gate is sealed, and Tessumo’s
original artwork and lore appear in Supporting Characters permanently.
This is a one-time window, not an annually recurring event.

State is recalculated on load, pageshow, visibility changes, and a timer that
runs at the exact boundary when close to it. A same-origin no-store HEAD
request uses the server Date and CDN Age headers to correct device clock skew.
Offline visitors fall back to their device clock. No reveal state is persisted
in cookies or localStorage. Change the version query on the three page assets
when updating the gate code or configuration.

The modal uses native dialog focus containment, Escape, Close, and Skip.
Reduced-motion visitors see the artwork and lore directly without downloading
or playing the video. Playback failures and prolonged stalls fall back to art.
The muted, inline H.264 MP4 has fast-start metadata and retains the original
720 × 1170 video frame. The PNG originals are preserved; displayed WebP copies
use lossless compression, with no cropping or visual changes.

The landing menu has a reserved navigation row. Its expanded panel pushes the
scene down in normal flow instead of covering the title or artwork. The hub’s
existing navigation and ENTER transition remain in place.

Run `node ankyu-gate.test.cjs` for schedule boundary tests.
