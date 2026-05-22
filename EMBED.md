# Website Embed

After deploying the chat widget app, paste this snippet before the closing `</body>` tag on any website page where the bot should appear:

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

Replace `https://YOUR-WIDGET-DOMAIN.com` with the domain where this widget is hosted.

Optional settings:

- `data-position`: `right` or `left`
- `data-accent`: launcher button color
- `data-label`: launcher button text
- `data-title`: iframe accessibility title
- `data-bottom`: launcher distance from the bottom, such as `24px`
- `data-side`: launcher distance from the selected side, such as `24px`
- `data-api-url`: deployed API server URL, needed for saved leads, AI replies, and Resend email notifications

The script creates a floating chat button, opens the hosted `/embed` widget in an iframe, and automatically adjusts the iframe for mobile screens.
