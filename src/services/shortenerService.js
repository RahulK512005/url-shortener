const Url = require("../models/urlModel");
const { encodeObjectId } = require("../utils/base62");

function isValidHttpUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch (error) {
    return false;
  }
}

function getExpiryDate(expiryDays) {
  if (!expiryDays) {
    return null;
  }

  const days = Number(expiryDays);
  if (!Number.isFinite(days) || days <= 0) {
    return null;
  }

  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + days);
  return expiryDate;
}

async function createShortUrl(originalUrl, expiryDays) {
  if (!isValidHttpUrl(originalUrl)) {
    const err = new Error("Please provide a valid URL with http/https.");
    err.statusCode = 400;
    throw err;
  }

  const expiresAt = getExpiryDate(expiryDays);
  const createdRecord = await Url.create({ originalUrl, expiresAt });
  const shortCode = encodeObjectId(createdRecord._id);

  createdRecord.shortCode = shortCode;
  await createdRecord.save();

  return createdRecord;
}

async function getUrlForRedirect(shortCode) {
  const now = new Date();
  const urlRecord = await Url.findOne({ shortCode });

  if (!urlRecord) {
    return { status: "not_found", data: null };
  }

  if (urlRecord.expiresAt && urlRecord.expiresAt <= now) {
    return { status: "expired", data: null };
  }

  await Url.updateOne(
    { _id: urlRecord._id },
    { $inc: { clicks: 1 }, $set: { lastAccessedAt: now } }
  );

  return { status: "ok", data: urlRecord };
}

async function getAnalytics(shortCode) {
  const urlRecord = await Url.findOne({ shortCode });
  return urlRecord;
}

module.exports = {
  createShortUrl,
  getUrlForRedirect,
  getAnalytics,
};
