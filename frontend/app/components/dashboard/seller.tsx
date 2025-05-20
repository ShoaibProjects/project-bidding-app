"use client";

import { useState } from "react";
import ProjectList from "../ProjectList";
import MyBidsList from "../MyBids";
import AssignedProjectList from "../AssignedBids";
import LogoutButton from "../auth/logout";
import { useUserStore } from "@/store/userStore";

/**
 * SellerDashboard component
 * 
 * Provides the main interface for sellers.
 * Displays assigned projects, the seller's bids, and projects available for bidding.
 * Includes a logout button and shows the logged-in user's email.
 */
export default function SellerDashboard() {
  // State to trigger refresh of project and bid lists on updates
  const [toRefresh, setToRefresh] = useState(false);

  // Access current logged-in user info from global state store
  const { user } = useUserStore();

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 font-sans">
      {/* Header with dashboard title, user info, and logout */}
      <header className="sticky top-0 z-10 bg-white shadow flex items-center justify-between px-6 py-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Seller Dashboard</h1>
          {/* Display logged-in user's email */}
          <p className="text-sm text-gray-500">Logged in as {user?.email}</p>
        </div>
        <LogoutButton />
      </header>

      {/* Main content grid: two columns on medium+ screens */}
      <main className="px-6 pb-10 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column: Assigned projects and seller's bids */}
        <section className="space-y-6">
          <div className="bg-white shadow rounded-xl p-4">
            <h2 className="text-lg font-semibold mb-2">Assigned Projects</h2>
            {/* Pass refresh state to update list when needed */}
            <AssignedProjectList
              toRefresh={toRefresh}
              setToRefresh={setToRefresh}
            />
          </div>

          <div className="bg-white shadow rounded-xl p-4">
            <h2 className="text-lg font-semibold mb-2">My Bids</h2>
            <MyBidsList toRefresh={toRefresh} />
          </div>
        </section>

        {/* Right column: Projects available to bid on */}
        <section className="bg-white shadow rounded-xl p-4">
          <h2 className="text-lg font-semibold mb-2">
            Available Projects to Bid On
          </h2>
          {/* Pass refresh state to dynamically reload projects */}
          <ProjectList toRefresh={toRefresh} setToRefresh={setToRefresh} />
        </section>
      </main>
    </div>
  );
}
