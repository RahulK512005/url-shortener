# URL Shortener (Production-Style)

A recruiter-friendly Node.js project that generates short URLs using Base62, redirects users to original URLs, tracks clicks, and supports optional link expiry.

## Features

- Short URL generation using MongoDB ObjectId -> Base62 conversion
- Fast short-code lookup with database indexing (`shortCode` indexed + unique)
- Redirect endpoint with click counter increment
- Analytics endpoint for click and metadata insights
- Optional expiry support via `expiryDays` during URL creation
- Structured service/controller/routes architecture for maintainability

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose

## Folder Structure

```text
url-shortener/
|-- src/
|   |-- controllers/
|   |   `-- urlController.js
|   |-- models/
|   |   `-- urlModel.js
|   |-- routes/
|   |   `-- urlRoutes.js
|   |-- services/
|   |   `-- shortenerService.js
|   |-- utils/
|   |   `-- base62.js
|   |-- config/
|   |   `-- db.js
|   `-- app.js
|-- .env
|-- package.json
`-- README.md
```

## Database Schema

```js
const urlSchema = new mongoose.Schema({
  originalUrl: { type: String, required: true },
  shortCode: { type: String, unique: true, index: true },
  clicks: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date, default: null, index: true },
  lastAccessedAt: { type: Date, default: null },
});
```

## API Endpoints

### 1) Create Short URL

- **POST** `/api/shorten`
- **Body**

```json
{
  "url": "https://example.com",
  "expiryDays": 7
}
```

- `expiryDays` is optional.

### 2) Redirect

- **GET** `/:code`
- Redirects to original URL and increments click count.

### 3) Analytics

- **GET** `/api/analytics/:code`
- Returns short code metadata including clicks and timestamps.

## How to Run

1. Install dependencies:

   ```bash
   npm install
   ```

2. Configure environment in `.env`:

   ```env
   PORT=5000
   BASE_URL=http://localhost:5000
   MONGO_URI=mongodb://127.0.0.1:27017/url_shortener
   ```

3. Start server in development mode:

   ```bash
   npm run dev
   ```

4. Server runs at:

   ```text
   http://localhost:5000
   ```

## Deploy on Render

### 1) Push code to GitHub

Render deploys from a Git repository, so push this project to GitHub first.

### 2) Create MongoDB Atlas database

1. Create a free cluster in MongoDB Atlas.
2. Create a database user.
3. Allow network access from `0.0.0.0/0` (or Render egress range if restricted).
4. Copy your connection string and replace `<password>`.

Example:

```text
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/url_shortener?retryWrites=true&w=majority
```

### 3) Deploy in Render

1. Go to [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repo and select this project.
4. Render auto-detects `render.yaml` from repo root.
5. Set required environment variables in Render:
   - `MONGO_URI` = your Atlas URI
   - `BASE_URL` = your Render app URL (for example `https://url-shortener.onrender.com`)
6. Click **Create Web Service**.

### 4) Verify deployment

Once deployed, test:

- Health:

  ```text
  https://<your-service>.onrender.com/health
  ```

- Shorten:

  ```text
  POST https://<your-service>.onrender.com/api/shorten
  ```

- Redirect:

  ```text
  GET https://<your-service>.onrender.com/<shortCode>
  ```

- Analytics:

  ```text
  GET https://<your-service>.onrender.com/api/analytics/<shortCode>
  ```

### 5) Common deployment notes

- Keep local `.env` private (already ignored via `.gitignore`).
- Use Atlas URI in production, not local MongoDB URI.
- Free Render services may sleep; first request can be slow.

## PowerShell Testing Guide (Windows)

PowerShell maps `curl` to `Invoke-WebRequest`, so Linux-style flags (`-X`, `-H`, `-d`) can fail. Use PowerShell-native commands below.

1. Create a short URL:

   ```powershell
   $body = @{ url = "https://example.com" } | ConvertTo-Json
   $created = Invoke-RestMethod -Method Post -Uri "http://localhost:5000/api/shorten" -ContentType "application/json" -Body $body
   $created
   ```

2. Test redirect using generated short code:

   ```powershell
   Invoke-WebRequest -Uri "http://localhost:5000/$($created.shortCode)" -MaximumRedirection 0 -UseBasicParsing
   ```

   Expected status: `302 Found`

3. Check analytics:

   ```powershell
   Invoke-RestMethod -Method Get -Uri "http://localhost:5000/api/analytics/$($created.shortCode)"
   ```

   Expected response includes:
   - `shortCode`
   - `originalUrl`
   - `clicks` (increments after redirect calls)
   - `createdAt`, `lastAccessedAt`, `expiresAt`

### Optional: use real curl syntax in PowerShell

Use `curl.exe` (not `curl`) if you want standard curl flags:

```powershell
curl.exe -X POST "http://localhost:5000/api/shorten" -H "Content-Type: application/json" -d "{\"url\":\"https://example.com\"}"
```

## Example Workflow

1. Create short URL via `POST /api/shorten`
2. Open returned short URL in browser
3. Fetch stats from `GET /api/analytics/:code`

## Sample Verified Output

The API has been validated with the following observed behavior:

- URL creation returned a valid short link such as:
  - `http://localhost:5000/QN2ECGIrayXGvjB6`
- Redirect endpoint responded with:
  - `302 Found`
  - `Location: https://example.com`
- Analytics endpoint returned click data, for example:
  - `clicks: 1`
  - `originalUrl: https://example.com`

## Resume Value

This project demonstrates API design, data modeling with indexing, backend modularization, analytics tracking, and production-oriented implementation details.
