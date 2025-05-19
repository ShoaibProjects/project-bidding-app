'use client'
import ProjectForm from '../ProjectForm';
import MyProjects from '../MyProjects';
import ProjectList from '../ProjectList';
import { useState } from 'react';
import LogoutButton from '../auth/logout';
import { useUserStore } from '@/store/userStore';

export default function BuyerDashboard() {
  const [toRefresh, setToRefresh] = useState(false)
    const {user} = useUserStore();
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Buyer Dashboard</h1>
      <ul>
        <li>email: {user?.email}</li>
      </ul>
              <LogoutButton />
      <ProjectForm toRefresh={toRefresh} setToRefresh={setToRefresh}/>
      <MyProjects toRefresh={toRefresh} setToRefresh={setToRefresh}/>
      <ProjectList toRefresh={toRefresh} /> {/* All other buyers' projects */}
    </div>
  );
}
