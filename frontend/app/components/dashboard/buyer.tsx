'use client';

import { useState } from 'react';
import ProjectForm from '../ProjectForm';
import MyProjects from '../MyProjects';
import ProjectList from '../ProjectList';
import LogoutButton from '../auth/logout';
import { useUserStore } from '@/store/userStore';

/**
 * BuyerDashboard component
 * 
 * This component provides the main dashboard interface for buyers.
 * It allows buyers to create new projects, view projects they have created,
 * and browse all listed projects. It also displays user info and a logout button.
 */
export default function BuyerDashboard() {
  // State to trigger refresh of project lists when a new project is created or updated
  const [toRefresh, setToRefresh] = useState(false);

  // Access current logged-in user info from global store
  const { user } = useUserStore();

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 font-sans">
      {/* Header section with title, user email, and logout button */}
      <header className="sticky top-0 z-10 bg-white shadow flex items-center justify-between px-6 py-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Buyer Dashboard</h1>
          {/* Display logged-in user email if available */}
          <p className="text-sm text-gray-500">Logged in as {user?.email}</p>
        </div>
        <LogoutButton />
      </header>

      {/* Main content area divided into two columns on medium+ screens */}
      <main className="px-6 pb-10 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column: project creation form and buyer's own projects */}
        <section className="space-y-6">
          {/* New project creation form */}
          <div className="bg-white shadow rounded-xl p-4">
            <h2 className="text-lg font-semibold mb-2">Create New Project</h2>
            {/* Pass refresh state and setter to allow ProjectForm to trigger list updates */}
            <ProjectForm toRefresh={toRefresh} setToRefresh={setToRefresh} />
          </div>

          {/* List of projects created by the logged-in buyer */}
          <div className="bg-white shadow rounded-xl p-4">
            <h2 className="text-lg font-semibold mb-2">Projects Created by You</h2>
            {/* Pass refresh state to allow dynamic reloading */}
            <MyProjects toRefresh={toRefresh} setToRefresh={setToRefresh} />
          </div>
        </section>

        {/* Right column: all listed projects available for viewing */}
        <section className="bg-white shadow rounded-xl p-4">
          <h2 className="text-lg font-semibold mb-2">All listed Projects</h2>
          {/* Refresh triggered projects list */}
          <ProjectList toRefresh={toRefresh} />
        </section>
      </main>
    </div>
  );
}
