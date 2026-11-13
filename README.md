# Navidey

Free and simple video hosting (React + Vite + Cloudflare Pages) for **navidey.site**.

## Fitur

- Upload video via proxy ke videy.co
- **Video src otomatis** pakai domain Cloudflare kamu  
  Contoh: `https://cdn.navidey.site/xxx.mp4` atau `https://cdn.navidey.pages.dev/xxx.mp4`
- **Iklan load dari API sendiri** (`/api/ad_type`)
- **Report Abuse** (`/report`) mengirim data ke `/api/report` + **langsung ke Telegram**
- Layout video page dioptimasi agar muat di viewport + iklan 300x250 tanpa scroll berlebih

## Setup Telegram Report (penting)

1. Buka Telegram → cari **@BotFather** → `/newbot` → ikuti instruksi → dapatkan **BOT_TOKEN**
2. Start bot-mu (klik Start / kirim pesan apa saja)
3. Ambil **CHAT_ID**:
   - Buka browser: `https://api.telegram.org/bot<BOT_TOKEN>/getUpdates`
   - Cari `"chat":{"id": 123456789}` → itu CHAT_ID-mu
   - (Kalau group: biasanya id-nya negatif, contoh `-1001234567890`)
4. Di **Cloudflare Dashboard** → Pages → project **navidey** → **Settings** → **Environment variables**:
   - `TELEGRAM_BOT_TOKEN` = `123456:AAH...` (centang Production + Preview)
   - `TELEGRAM_CHAT_ID`   = `123456789`
5. **Redeploy** setelah set environment variables (penting!).

## Setup

```bash
npm install
npm run dev
```

## Build & Deploy (Pages)

```bash
npm run build
npx wrangler pages deploy dist --project-name=navidey
```

Lalu di Cloudflare Dashboard → Pages → Custom domains → tambahkan `navidey.site`.

## Setup CDN subdomain (penting)

Agar `https://cdn.navidey.site/xxx.mp4` bekerja:

1. Deploy worker CDN:
   ```bash
   cd worker
   npx wrangler deploy
   ```

2. Di Cloudflare Dashboard → Workers & Pages → worker `navidey-cdn`  
   → Settings → Domains & Routes → Add Custom Domain:
   - `cdn.navidey.site`

## Structure

- `src/pages/Home.jsx` — halaman upload
- `src/pages/VideoPlayer.jsx` — halaman `/v/`
- `src/config.js` — logic dynamic CDN berdasarkan hostname
- `functions/api/upload.js` — proxy upload ke Videy
- `functions/api/ad_type.js` — ads API
- `functions/api/report.js` — terima report + kirim ke Telegram
- `worker/video-proxy.js` — Worker proxy CDN
