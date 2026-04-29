require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const connectDB = require("./config/db");
const urlRoutes = require("./routes/urlRoutes");
const { createShortUrl, getAnalytics } = require("./services/shortenerService");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

function isValidUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch (_error) {
    return false;
  }
}

app.get("/", (_req, res) => {
  res.send(`
    <h2>URL Shortener</h2>
    <p>Status: Running</p>
    <form action="/shorten" method="get">
      <input type="url" name="url" placeholder="Enter URL" required style="width: 360px;" />
      <button type="submit">Shorten</button>
    </form>
    <p style="margin-top: 16px;">API Endpoints: POST /api/shorten, GET /:code, GET /api/analytics/:code</p>
  `);
});

app.get("/shorten", async (req, res, next) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).send("<p>URL is required.</p><a href='/'>Go back</a>");
    }
    if (!isValidUrl(url)) {
      return res.status(400).send("<p>Please enter a valid URL.</p><a href='/'>Go back</a>");
    }

    const created = await createShortUrl(url);
    const baseUrl =
      process.env.BASE_URL ||
      process.env.RENDER_EXTERNAL_URL ||
      `${req.protocol}://${req.get("host")}`;
    const shortUrl = `${baseUrl}/${created.shortCode}`;

    return res.json({
      shortUrl,
      shortCode: created.shortCode,
      originalUrl: created.originalUrl,
    });
  } catch (error) {
    return next(error);
  }
});

app.get("/analytics/:code", async (req, res, next) => {
  try {
    const url = await getAnalytics(req.params.code);
    if (!url) {
      return res.status(404).json({ message: "URL not found" });
    }

    return res.json({
      originalUrl: url.originalUrl,
      clicks: url.clicks,
      createdAt: url.createdAt,
      expiresAt: url.expiresAt,
      lastAccessedAt: url.lastAccessedAt,
    });
  } catch (error) {
    return next(error);
  }
});

app.use(urlRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use((err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message || "Internal server error",
  });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();
