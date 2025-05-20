"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const client_1 = require("@prisma/client");
const project_routes_1 = __importDefault(require("./routes/project.routes"));
const bid_routes_1 = __importDefault(require("./routes/bid.routes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables from .env file
dotenv_1.default.config();
const app = (0, express_1.default)();
const prisma = new client_1.PrismaClient();
// Create uploads directory if it doesn't exist
const __dirname = path_1.default.resolve();
const uploadsDir = path_1.default.join(__dirname, 'uploads');
try {
    if (!fs_1.default.existsSync(uploadsDir)) {
        fs_1.default.mkdirSync(uploadsDir, { recursive: true });
    }
}
catch (error) {
    console.error('Error creating uploads directory:', error);
}
// Middleware setup
app.use((0, cors_1.default)({
    origin: process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL || 'https://your-frontend-domain.vercel.app'
        : 'http://localhost:3000',
    credentials: true,
}));
app.use(express_1.default.json());
// Serve static files from uploads folder if not in production
// In production, you'll likely need to use a storage service like S3
if (process.env.NODE_ENV !== 'production') {
    app.use('/uploads', express_1.default.static(uploadsDir));
}
// Test database connection
async function testDbConnection() {
    try {
        await prisma.$queryRaw `SELECT 1`;
        console.log('✅ Database connection successful');
        return true;
    }
    catch (error) {
        console.error('❌ Database connection failed:', error);
        return false;
    }
}
// Simple health check endpoint
app.get('/api/health', (_req, res) => {
    res.status(200).json({ status: 'OK', message: 'API is running' });
});
// Register API route handlers
app.use('/api/auth', auth_routes_1.default);
app.use('/api/projects', project_routes_1.default);
app.use('/api/bids', bid_routes_1.default);
app.use('/api/users', userRoutes_1.default);
// Global error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong!" });
});
// Test the DB connection on startup
testDbConnection().catch(error => {
    console.error('Failed to test database connection:', error);
});
// For local development
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}
// Export the Express API for Vercel
exports.default = app;
