# Manos Jyoti Gogoi — Portfolio

React + Vite conversion of the original Möbius hologram portfolio.

## Setup

```bash
npm install
npm run dev
```

## Structure

```
src/
  main.jsx              # React entry point
  App.jsx               # Router + layout shell
  components/
    Cursor.jsx/.css     # Custom cyan cursor
    Scanlines.jsx/.css  # CRT scanline overlay
    TopBar.jsx/.css     # Navigation bar
    Loader.jsx/.css     # Boot loader animation
    MobiusScene.jsx/.css # Three.js hologram (right panel)
  pages/
    Home.jsx/.css       # Hero page with Möbius 3D
    Work.jsx/.css       # Skills page with animated bars
    Projects.jsx/.css   # GitHub projects grid
    Contact.jsx/.css    # EmailJS contact form
    PageLayout.css      # Shared page styles
```

## EmailJS Setup (Contact Page)

1. Create a free account at https://emailjs.com
2. Add a new **Email Service** (Gmail, Outlook, etc.)
3. Create an **Email Template** with variables:
   - `{{user_name}}` — sender's name
   - `{{user_email}}` — sender's email
   - `{{subject}}` — subject line
   - `{{message}}` — message body
4. Open `src/pages/Contact.jsx` and replace:
   ```js
   const EMAILJS_SERVICE_ID  = 'YOUR_SERVICE_ID'
   const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID'
   const EMAILJS_PUBLIC_KEY  = 'YOUR_PUBLIC_KEY'
   ```

## Build

```bash
npm run build   # outputs to /dist
npm run preview # preview the build locally
```
