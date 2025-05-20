"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = exports.signupUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt")); // For password hashing
const prisma_1 = __importDefault(require("../utils/prisma")); // Prisma client instance for DB interaction
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken")); // For generating JWTs
// Use environment variable for JWT secret, fallback to default for development
const JWT_SECRET = process.env.JWT_SECRET || "devsecret";
/**
 * Signup a new user.
 * Validates input, checks for existing user, hashes password, stores user in DB,
 * and returns a JWT token with basic user info.
 */
const signupUser = async (req, res) => {
    try {
        const { email, password, role } = req.body;
        // Basic validation
        if (!email || !password || !role) {
            return res
                .status(400)
                .json({ error: "Email, password, and role are required." });
        }
        // Role must be either BUYER or SELLER
        if (!["BUYER", "SELLER"].includes(role)) {
            return res.status(400).json({ error: "Invalid role." });
        }
        // Check if user with the given email already exists
        const existing = await prisma_1.default.user.findUnique({ where: { email } });
        if (existing) {
            return res
                .status(409)
                .json({ error: "User with this email already exists." });
        }
        // Hash password using bcrypt
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        // Create user in database
        const user = await prisma_1.default.user.create({
            data: { email, password: hashedPassword, role },
        });
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: "14d" });
        // Send response with token and user info (excluding password)
        res.status(201).json({
            message: "User created successfully.",
            token,
            user: {
                email: user.email,
                role: user.role,
                id: user.id,
            },
        });
    }
    catch (error) {
        console.error("CreateUser Error:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};
exports.signupUser = signupUser;
/**
 * Login an existing user.
 * Validates credentials, compares password, and returns a JWT token on success.
 */
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    // Find user by email
    const user = await prisma_1.default.user.findUnique({ where: { email } });
    if (!user) {
        return res.status(401).json({ error: "Invalid email or password." });
    }
    // Compare provided password with stored hashed password
    const isMatch = await bcrypt_1.default.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ error: "Invalid email or password." });
    }
    // Generate JWT token
    const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: "14d" });
    // Return token and user info
    res.status(200).json({
        token,
        user: {
            email: user.email,
            role: user.role,
            id: user.id,
        },
    });
};
exports.loginUser = loginUser;
