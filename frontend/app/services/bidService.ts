import API from "./api";
import { NewBid } from "../types";

/**
 * Bid-related API service functions
 * ---------------------------------
 * This module provides functions to interact with bid-related endpoints
 * in the backend via a shared Axios instance (API).
 */

/**
 * Submit a new bid for a project.
 * @param data - The bid details including projectId, sellerId, amount, etc.
 * @returns Axios Promise resolving to the created bid
 */
export const placeBid = (data: NewBid) => API.post("/api/bids", data);

/**
 * Get all bids placed by a specific seller.
 * @param sellerId - The unique ID of the seller
 * @returns Axios Promise resolving to an array of bids
 */
export const getBidsBySeller = (sellerId: string) =>
  API.get(`/api/bids/seller/${sellerId}`);
