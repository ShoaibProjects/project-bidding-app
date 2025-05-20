'use client';  // Mark this component as client-side (Next.js 13+ app directory)

import BuyerDashboard from "@/app/components/dashboard/buyer";

/**
 * BuyerDashPage component
 * Serves as the page component rendering the buyer dashboard.
 * Default export for the buyer dashboard route.
 */
export default function BuyerDashPage() {
  return (
    <BuyerDashboard />
  );
}
