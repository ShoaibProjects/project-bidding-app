import express, { RequestHandler } from "express";
import { placeBid, getBidsBySeller } from "../controllers/bid.controller";
import { requireAuth } from "../middleware/jwt.middleware";

const router = express.Router();

router.post("/", requireAuth  as RequestHandler, placeBid as RequestHandler);
router.get("/seller/:sellerId", requireAuth as RequestHandler, getBidsBySeller as RequestHandler);

export default router;
