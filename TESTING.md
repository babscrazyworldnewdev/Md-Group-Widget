# How to Run and Test

## Quick local demo

Use this when you only want to see and test the widget UI.

1. Install Node.js 20 or newer from https://nodejs.org/.
2. Open PowerShell in this folder:
   `C:\Users\Dell\Documents\Codex\2026-05-22\files-mentioned-by-the-user-md\Md-Group-Widget`
3. Enable pnpm:
   `corepack enable`
4. Install dependencies:
   `pnpm install`
5. Start the widget:
   `pnpm dev:widget`
6. Open:
   `http://localhost:5173`
7. Click `Start Conversation`, choose a topic, and send a message.

If the backend is not running, the widget automatically uses local demo replies so you can still test the look and flow.

## Test the embed view

After `pnpm dev:widget` is running, open:

`http://localhost:5173/embed`

This is the clean iframe version you can embed on a site.

## Test the copy-paste website widget

After `pnpm dev:widget` is running, open:

`http://localhost:5173`

Copy the script shown on the page and paste it before the closing `</body>` tag on a test HTML page. For local testing, the script source should be:

`http://localhost:5173/widget.js`

For production, replace the domain with the deployed widget domain. The script creates the floating chat button automatically.

## Optional real backend test

Use this only when you want real saved leads, saved messages, and AI replies.

1. Create a Postgres database.
2. Set these environment variables in PowerShell:
   `$env:DATABASE_URL="postgres://USER:PASSWORD@HOST:PORT/DATABASE"`
   `$env:AI_INTEGRATIONS_OPENAI_BASE_URL="https://api.openai.com/v1"`
   `$env:AI_INTEGRATIONS_OPENAI_API_KEY="YOUR_API_KEY"`
   `$env:RESEND_API_KEY="YOUR_RESEND_API_KEY"`
3. Start the API in one PowerShell window:
   `pnpm dev:api`
4. Start the widget in another PowerShell window:
   `pnpm dev:widget`
5. Open:
   `http://localhost:5173`

The widget dev server proxies `/api` requests to `http://localhost:8080` by default. To use a different API URL, start the widget with:

`$env:API_URL="http://localhost:YOUR_PORT"; pnpm dev:widget`

## Build check

Run:

`pnpm build`

This runs type checks and builds the workspace packages.

## Email notifications

The API sends lead notifications with Resend when `RESEND_API_KEY` is set.

- A lead email is sent when the visitor submits the intake form.
- A conversation transcript email is sent after each saved AI response, once a lead exists for that conversation.
- The notification recipient is configured in `lib/artifacts/api-server/src/routes/leads.ts` and `lib/artifacts/api-server/src/routes/openai/conversations.ts` as `NOTIFY_EMAIL`.
