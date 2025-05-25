'use client';

import { useEffect, useState } from "react";
import { getBidsBySeller } from "../services/bidService";
import { Bid } from "../types";
import { useUserStore } from "@/store/userStore";


/**
 * MyBidsList Component
 * 
 * Displays a list of bids placed by the logged-in seller on various projects.
 * Shows bid details along with related project info.
 * 
 * Props:
 * - toRefresh: boolean flag to trigger re-fetching of bids when updated externally.
 */
export default function MyBidsList({ toRefresh }: { toRefresh: boolean }) {
  // Get currently logged-in user from global state/store
  const { user } = useUserStore();

  // State to hold bids fetched from backend
  const [bids, setBids] = useState<Bid[]>([]);
  // Loading state for async fetch
  const [loading, setLoading] = useState(true);

  // Effect: fetch bids when user ID or refresh flag changes
  useEffect(() => {
    if (user?.id) {
      fetchBids(user.id);
    }
  }, [user?.id, toRefresh]);

  /**
   * Fetch bids placed by seller from API
   * @param sellerId - current user's ID
   */
  const fetchBids = async (sellerId: string) => {
    try {
      setLoading(true);
      const res = await getBidsBySeller(sellerId);
      setBids(res.data); // expected res.data to be an array of Bid objects
    } catch (error) {
      console.error("Failed to fetch bids:", error);
    } finally {
      setLoading(false);
    }
  };

  // Loading state UI
  if (loading) {
    return <p className="text-gray-500 mt-4">Loading your bids...</p>;
  }

  // Empty state UI when no bids found
  if (bids.length === 0) {
    return <p className="text-gray-500 mt-4">You have not placed any bids yet.</p>;
  }

  // Render list of bids with project info and bid details
  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Your Bids</h2>
      {bids.map((bid) => (
        <div key={bid.id} className="border p-4 mb-4 rounded shadow">
          <h3 className="font-bold text-lg mb-1">{bid.project?.title}</h3>
          <p className="text-sm text-gray-700 mb-2">{bid.project?.description}</p>
          <p><strong>Budget:</strong> {bid.project?.budget}</p>
          <p><strong>Deadline:</strong> {bid.project?.deadline ? new Date(bid.project.deadline).toLocaleString() : "NA"}</p>
          <p><strong>Status:</strong> {bid.project?.status}</p>

          {bid.project?.selectedBidId === bid.id && <p className="text-green-600 font-semibold">Got Selected</p>}

          <div className="mt-4 bg-gray-50 p-3 rounded border text-sm">
            <h4 className="font-semibold">Your Bid</h4>
            <p><strong>Amount:</strong> ${bid.amount}</p>
            <p><strong>Duration:</strong> {bid.durationDays} days</p>
            <p><strong>Message:</strong> {bid.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
