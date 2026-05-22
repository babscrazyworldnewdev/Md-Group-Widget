# Deploy the Website Widget

The widget deploys as a static site. After it is hosted, other websites only need one script tag.

## Build locally

```powershell
$env:NODE_OPTIONS="--use-system-ca"
corepack pnpm install
corepack pnpm --filter @workspace/chat-widget run build
```

The deployable files are created in:

```text
lib/artifacts/chat-widget/dist/public
```

Upload everything inside that folder to a static host.

## Required hosted URLs

Your host must serve:

- `/widget.js` as the copy-paste embed script
- `/embed` as the iframe widget route
- `/assets/*`, `/sarah.png`, and other static files

For single-page routing, `/embed` must rewrite to `/index.html`. This repo includes hosting config for:

- Netlify: `lib/artifacts/chat-widget/netlify.toml`
- Vercel: `lib/artifacts/chat-widget/vercel.json`
- Static hosts using redirects: `lib/artifacts/chat-widget/public/_redirects`

## Copy-paste code for client websites

Replace the domain with the final hosted widget domain:

```html
<script
  src="https://YOUR-WIDGET-DOMAIN.com/widget.js"
  data-position="right"
  data-accent="#1b2a41"
  data-label="Chat with Sarah"
  data-api-url="https://YOUR-API-DOMAIN.com"
  defer
></script>
```

## GitHub Pages

For a GitHub Pages project site, build with `BASE_PATH` set to the repository name:

```powershell
$env:NODE_OPTIONS="--use-system-ca"
$env:BASE_PATH="/Md-Group-Widget/"
corepack pnpm --filter @workspace/chat-widget run build:github
```

Then deploy everything inside `lib/artifacts/chat-widget/dist/public`.

The client website script will look like:

```html
<script
  src="https://YOUR-GITHUB-USERNAME.github.io/Md-Group-Widget/widget.js"
  data-position="right"
  data-accent="#1b2a41"
  data-label="Chat with Sarah"
  data-api-url="https://YOUR-API-DOMAIN.com"
  defer
></script>
```

## Backend connection

The widget calls `/api` when the API server is available. In production, deploy the API separately and set `data-api-url` in the script tag to that API domain.

The API must have these environment variables:

```text
DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DATABASE
AI_INTEGRATIONS_OPENAI_BASE_URL=https://api.openai.com/v1
AI_INTEGRATIONS_OPENAI_API_KEY=YOUR_OPENAI_API_KEY
RESEND_API_KEY=YOUR_RESEND_API_KEY
NOTIFY_EMAIL=billafonbarbara@gmail.com
```

If `/api` is unavailable, the widget still opens and uses demo replies.
