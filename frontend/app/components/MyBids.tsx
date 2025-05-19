'use client';

import { useEffect, useState } from "react";
import { getBidsBySeller } from "../services/bidService";
import { Bid } from "../types";
import { useUserStore } from "@/store/userStore";

export default function MyBidsList({ toRefresh }: { toRefresh: boolean }) {
  const { user } = useUserStore();
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchBids(user.id);
    }
  }, [user?.id, toRefresh]);

  const fetchBids = async (sellerId: string) => {
    try {
      setLoading(true);
      const res = await getBidsBySeller(sellerId);
      setBids(res.data); // expecting res.data to be Bid[]
    } catch (error) {
      console.error("Failed to fetch bids:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p className="text-gray-500 mt-4">Loading your bids...</p>;
  }

  if (bids.length === 0) {
    return <p className="text-gray-500 mt-4">You have not placed any bids yet.</p>;
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold mb-4">Your Bids</h2>
      {bids.map((bid) => (
        <div key={bid.id} className="border p-4 mb-4 rounded shadow">
          <h3 className="font-bold text-lg mb-1">{bid.project.title}</h3>
          <p className="text-sm text-gray-700 mb-2">{bid.project.description}</p>
          <p><strong>Budget:</strong> {bid.project.budget}</p>
          <p><strong>Deadline:</strong> {new Date(bid.project.deadline).toLocaleString()}</p>
          <p><strong>Status:</strong> {bid.project.status}</p>

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
