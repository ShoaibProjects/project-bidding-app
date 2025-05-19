import express, { RequestHandler } from "express";
import { createUser, loginUser } from "../controllers/user.controller";

const router = express.Router();
router.post("/", createUser as RequestHandler);
router.post("/login", loginUser as RequestHandler);
export default router;
