# Marginalia — frontend for SocialMediaBackend

A complete Next.js (App Router, JS) frontend against your `SocialMediaBackend`
API: feed, posts with images, comments, likes, follow system, DMs (with
Socket.IO), notifications, and search.

## 1. Fix the backend first (already done as of your latest zip)

`auth.controller.js` now correctly calls `issueAuthCookies(res, user._id)` in
both `register` and `login` — confirmed against the zip you sent. Nothing
else to change there.

## 2. Merging into your existing repo

You said you already ran `create-next-app` with the `src/` structure (just an
`app/` folder so far). Do this:

1. Copy everything in this zip's `src/` into your repo's `src/`, **except**
   don't blindly overwrite `src/app/layout.js` or `src/app/globals.css` if
   you've already customized them — otherwise just take these versions as-is.
2. Copy `tailwind.config.js`, `postcss.config.mjs`, `jsconfig.json`,
   `components.json`, and `next.config.mjs` to your repo root, merging with
   anything already there (e.g. if you already ran `shadcn init`, merge the
   CSS variables in `globals.css` rather than overwriting your theme).
3. Merge the `dependencies`/`devDependencies` from this `package.json` into
   yours, then `npm install`.
4. Copy `.env.local.example` → `.env.local` and fill in your real API URL.

## 3. Environment variables

```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

In production, point these at your deployed backend. Because frontend and
backend are **different domains**, the backend already sets
`sameSite: "none"; secure: true` in production (see `generateToken.js`) —
that's required for cross-origin cookies to work at all. Make sure:

- Your backend is served over **HTTPS** in production (`secure` cookies are
  dropped silently over plain HTTP).
- `CLIENT_URL` / CORS origin on the backend is set to your deployed frontend
  origin, with `credentials: true` (already configured in `app.js`).
- You do **not** set `NEXT_PUBLIC_API_URL` to a domain different from what
  your browser can reach — third-party cookie blocking (Safari ITP, Chrome's
  phase-out) can still interfere with cross-site cookies on some browsers.
  If you hit mysterious logout issues in production, that's usually why —
  the long-term fix is proxying the API through the same domain
  (e.g. `yourapp.com/api/*` → backend) via a reverse proxy or Next.js
  rewrites, which sidesteps third-party cookie restrictions entirely.

## 4. Why there's no `middleware.js`

Route protection is done client-side in `AppShell` (calls `GET /auth/me` on
mount, redirects to `/login` on failure). A Next.js `middleware.js` can only
read cookies sent to *its own* domain — since your backend cookie lives on a
different origin, the frontend's edge middleware would never see it anyway.
This is a direct consequence of the cross-domain deployment you chose.

## 5. What's included

- **Design**: a "notebook/journal" direction — paper background, deep pine
  primary, a single warm "ember" accent reserved for likes/hearts so it stays
  meaningful. Fraunces (display) + Inter (body) + JetBrains Mono. Dark mode
  works out of the box (`next-themes`).
- **Data layer**: `src/features/*` — one folder per backend resource, each
  with `api.js` (axios calls) and `hooks.js` (TanStack Query, with optimistic
  updates for likes/follows and cursor-free page-based infinite scroll
  matching your `{ page, limit, total, totalPages }` pagination shape).
- **Auth**: `src/lib/axios.js` auto-retries once on a 401 via
  `/auth/refresh`, then gives up and clears Redux state — mirroring your
  15-minute access token / 30-day refresh token design.
- **Realtime**: `src/lib/socket.js` + `useLiveMessages` / `useLiveNotifications`
  / `useOnlineStatusSubscription` wire up `message:new`, `message:typing`,
  `notification:new`, `user:online` / `user:offline` — matching your
  `src/sockets/index.js`. Adjust the event names there if yours differ.
- **Pages**: `/login`, `/register`, `/` (feed), `/profile/[username]`,
  `/post/[id]`, `/messages`, `/messages/[conversationId]`, `/notifications`,
  `/search` (tabbed users/posts), `/settings` (profile + avatar).

## 6. Things worth double-checking once you run it

- Cloudinary images: `next.config.mjs` allows `res.cloudinary.com` — update
  if your Cloudinary account uses a custom domain.
- Socket auth: confirmed against your code — `sockets/index.js` reads the
  `token` cookie straight off the handshake headers, and `server.js` sets
  `cors: { origin: CLIENT_URL, credentials: true }` on the Socket.IO server
  itself (separate from the Express CORS middleware). Just make sure
  `CLIENT_URL` on the backend matches your deployed frontend origin exactly.
- `notification:new` payload: confirmed — `notify.js` emits the full
  populated `Notification` doc (`{ type, sender, post, ... }`), matching what
  `NotificationItem.jsx` and `features/notifications/hooks.js` expect.
