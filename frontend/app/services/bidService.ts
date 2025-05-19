import API from "./api";
import { NewBid } from "../types";

export const placeBid = (data: NewBid) => API.post("/api/bids", data);
// ✅ Get all bids by seller
export const getBidsBySeller = (sellerId: string) =>
  API.get(`/api/bids/seller/${sellerId}`);