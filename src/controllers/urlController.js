const {
  createShortUrl,
  getUrlForRedirect,
  getAnalytics,
} = require("../services/shortenerService");

exports.createShortUrl = async (req, res, next) => {
  try {
    const { url, expiryDays } = req.body;

    if (!url) {
      return res.status(400).json({ message: "url is required." });
    }

    const created = await createShortUrl(url, expiryDays);
    const baseUrl =
      process.env.BASE_URL ||
      process.env.RENDER_EXTERNAL_URL ||
      `http://localhost:${process.env.PORT || 5000}`;

    return res.status(201).json({
      shortUrl: `${baseUrl}/${created.shortCode}`,
      shortCode: created.shortCode,
      originalUrl: created.originalUrl,
      expiresAt: created.expiresAt,
    });
  } catch (error) {
    return next(error);
  }
};

exports.redirectUrl = async (req, res, next) => {
  try {
    const { code } = req.params;
    const result = await getUrlForRedirect(code);

    if (result.status === "not_found") {
      return res.status(404).json({ message: "Short URL not found." });
    }

    if (result.status === "expired") {
      return res.status(410).json({ message: "Short URL has expired." });
    }

    return res.redirect(result.data.originalUrl);
  } catch (error) {
    return next(error);
  }
};

exports.getUrlAnalytics = async (req, res, next) => {
  try {
    const { code } = req.params;
    const url = await getAnalytics(code);

    if (!url) {
      return res.status(404).json({ message: "Short URL not found." });
    }

    return res.json({
      shortCode: url.shortCode,
      originalUrl: url.originalUrl,
      clicks: url.clicks,
      createdAt: url.createdAt,
      expiresAt: url.expiresAt,
      lastAccessedAt: url.lastAccessedAt,
    });
  } catch (error) {
    return next(error);
  }
};
