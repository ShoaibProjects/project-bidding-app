// =====================================
// controllers/authController.ts
// =====================================

import bcrypt from "bcrypt";
import { Request, Response } from "express";
import prisma from "../utils/prisma"; // Prisma client instance
import jwt from "jsonwebtoken";
import admin from "../config/firebase"; // Firebase Admin SDK

// Use environment variable for JWT secret
const JWT_SECRET = process.env.JWT_SECRET || "devsecret";

/**
 * ======================
 * Signup a New User
 * ======================
 * Validates input, hashes password, saves user to DB,
 * and returns a JWT token with user info.
 */
export const signupUser = async (req: Request, res: Response) => {
  try {
    const { email, password, role, rememberMe } = req.body;

    // Required field validation
    if (!email || !password || !role) {
      return res.status(400).json({
        error: "Email, password, and role are required.",
      });
    }

    // Validate role
    if (!["BUYER", "SELLER"].includes(role)) {
      return res.status(400).json({ error: "Invalid role." });
    }

    // Check for existing user
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({
        error: "User with this email already exists.",
      });
    }

    // Hash the password before storing
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, role },
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: rememberMe ? "30d" : "1d" }
    );

    res.status(201).json({
      message: "User created successfully.",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

/**
 * ======================
 * Login an Existing User
 * ======================
 * Validates credentials, checks password, and returns a JWT token.
 */
export const loginUser = async (req: Request, res: Response) => {
  const { email, password, rememberMe } = req.body;

  try {
    // Fetch user by email
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    if (!user.password) {
      return res.status(400).json({
        error: "This account does not have a password. Try logging in with Google.",
      });
    }

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: rememberMe ? "30d" : "1d" }
    );

    res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

/**
 * ======================
 * Get Current Authenticated User
 * ======================
 * Used for auto-login or protected routes.
 */
export const getCurrentUser = async (req: Request, res: Response) => {
  const { userId } = (req as any).user;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Get User Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * ======================
 * Login / Signup with Google (Firebase)
 * ======================
 * Verifies ID token via Firebase Admin SDK.
 * Creates user if not exists, and returns JWT token.
 */
export const googleLoginUser = async (req: Request, res: Response) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400).json({ error: "Missing idToken" });
  }

  try {
    // Verify token with Firebase
    const decoded = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decoded;

    if (!email) {
      return res.status(400).json({ error: "Email not available from Google" });
    }

    // Check if user exists
    let user = await prisma.user.findUnique({ where: { email } });

    // If not, create new user (default role: BUYER)
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: name || email,
          role: "BUYER", // Can be changed later in onboarding
          firebaseId: uid,
          profileImage:
            picture ||
            "https://img.freepik.com/premium-vector/user-profile-icon-flat-style-member-avatar-vector-illustration-isolated-background-human-permission-sign-business-concept_157943-15752.jpg?semt=ais_hybrid&w=740",
        },
      });
    }

    // Create JWT
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.status(200).json({
      message: "Login successful via Google",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(401).json({ error: "Invalid or expired ID token" });
  }
};
