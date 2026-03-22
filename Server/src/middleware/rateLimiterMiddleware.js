import rateLimit from "express-rate-limit";

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // max 5 requests
  standardHeaders: true, // send rate limit info in headers
  legacyHeaders: false,   // disable X-RateLimit-* headers
  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      message: "Too many login attempts. Try again later."
    });
  }
});