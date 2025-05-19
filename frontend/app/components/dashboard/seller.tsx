'use client'
import ProjectList from '../ProjectList';
import MyBidsList from '../MyBids';
import AssignedProjectList from '../AssignedBids';
import { useState } from 'react';
import LogoutButton from '../auth/logout';
import { useUserStore } from '@/store/userStore';
// import MyBids from '../MyBids';
// import AssignedProjects from '../AssignedProjects';

export default function SellerDashboard() {
    const [toRefresh, setToRefresh] = useState(false)
        const {user} = useUserStore();
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Seller Dashboard</h1>
            <ul>
              <li>email: {user?.email}</li>
            </ul>
                    <LogoutButton />
      <ProjectList toRefresh={toRefresh} setToRefresh={setToRefresh}/> {/* List all projects to bid on */}
      <MyBidsList toRefresh={toRefresh}/>
      <AssignedProjectList toRefresh={toRefresh} setToRefresh={setToRefresh}/>
    </div>
  );
}
