import express, { RequestHandler } from "express";
import { signupUser, loginUser } from "../controllers/auth.controller";

const router = express.Router();
router.post("/signup", signupUser as RequestHandler);
router.post("/login", loginUser as RequestHandler);
export default router;
