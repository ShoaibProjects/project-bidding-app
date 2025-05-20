import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

// Load JWT secret from environment variable, fallback to "devsecret" for development
const JWT_SECRET = process.env.JWT_SECRET || "devsecret";

/**
 * Middleware to protect routes by verifying a JWT token.
 *
 * Expects the token to be passed in the "Authorization" header as:
 *   Authorization: Bearer <token>
 *
 * If valid, attaches the decoded token payload to `req.user`.
 * Otherwise, returns 401 (Unauthorized) or 403 (Forbidden) response.
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  // Extract the token from the Authorization header
  const token = req.headers.authorization?.split(" ")[1];

  // If no token is present, deny access
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Verify the token using the secret key
    const payload = jwt.verify(token, JWT_SECRET);

    // Attach the decoded payload (e.g., user info) to the request object
    (req as any).user = payload;

    // Continue to the next middleware or route handler
    next();
  } catch {
    // Token is invalid or expired
    return res.status(403).json({ error: "Invalid token" });
  }
};
