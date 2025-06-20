'use client';

import { useState, ReactNode, JSX } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiHome, FiBriefcase, FiPlusCircle, FiUser, FiMessageSquare } from 'react-icons/fi';
import { useUserStore } from '@/store/userStore';
import { useRouter } from 'next/navigation';
import ProjectForm from '../ProjectForm';
import MyProjects from '../MyProjects/MyProjects';
import ProjectList from '../ProjectList';
import { LogOut } from 'lucide-react';

// Type for the NavItem props
interface NavItemProps {
    icon: ReactNode;
    text: string;
    active?: boolean;
    onClick: () => void;
}

const NavItem = ({ icon, text, active = false, onClick }: NavItemProps): JSX.Element => (
    <motion.button
        onClick={onClick}
        className={`flex items-center w-full px-4 py-3 text-left transition-colors duration-200 ${
            active ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
        }`}
        whileHover={{ x: 5 }}
        whileTap={{ scale: 0.95 }}
    >
        {icon}
        <span className="ml-4">{text}</span>
    </motion.button>
);

// Type for the active tab state
export type ActiveTab = 'myProjects' | 'allProjects' | 'createProject' | 'chatPage';

export default function BuyerDashboard(): JSX.Element {
    const [toRefresh, setToRefresh] = useState<boolean>(false);
    const router = useRouter();
    const { user } = useUserStore();
    const [activeTab, setActiveTab] = useState<ActiveTab>('myProjects');

    const { clearUser } = useUserStore();
    const handleLogout = () => {
    clearUser();
    localStorage.removeItem('token');
    router.push('/');
  };

    const renderContent = (): ReactNode => {
        switch (activeTab) {
            case 'myProjects':
                return <MyProjects toRefresh={toRefresh} setToRefresh={setToRefresh} />;
            case 'allProjects':
                return <ProjectList toRefresh={toRefresh} />;
            case 'createProject':
                return <ProjectForm toRefresh={toRefresh} setToRefresh={setToRefresh} tabSwitch={setActiveTab} />;
            default:
                return <MyProjects toRefresh={toRefresh} setToRefresh={setToRefresh} />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-900 text-white font-sans">
            {/* Sidebar */}
            <motion.div
                className="w-64 bg-gray-800 flex flex-col"
                initial={{ x: -256 }}
                animate={{ x: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
            >
                <div className="px-8 py-6">
                    <motion.h1
                        className="text-2xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                    >
                        Buyer Dashboard
                    </motion.h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Welcome, <span className="font-medium">{user?.email}</span>
                    </p>
                </div>
                <nav className="flex-1 space-y-2 px-2">
                    <NavItem
                        icon={<FiHome className="w-6 h-6" />}
                        text="My Projects"
                        active={activeTab === 'myProjects'}
                        onClick={() => setActiveTab('myProjects')}
                    />
                    <NavItem
                        icon={<FiBriefcase className="w-6 h-6" />}
                        text="All Projects"
                        active={activeTab === 'allProjects'}
                        onClick={() => setActiveTab('allProjects')}
                    />
                    <NavItem
                        icon={<FiMessageSquare className="w-6 h-6" />}
                        text="Chat"
                        active={activeTab === 'chatPage'}
                        onClick={() => router.push(`/chats`)}
                    />
                    <NavItem
                        icon={<FiPlusCircle className="w-6 h-6" />}
                        text="Create Project"
                        active={activeTab === 'createProject'}
                        onClick={() => setActiveTab('createProject')}
                    />
                </nav>
                <div className="px-2 py-4">
                     <NavItem
                        icon={<FiUser className="w-6 h-6" />}
                        text="My Profile"
                        onClick={() => router.push(`/profile/${user?.id}`)}
                    />
                    <NavItem
                      icon={<LogOut className="w-6 h-6" />}
                      text='Logout'
                      onClick={handleLogout}
                    />
                </div>
            </motion.div>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="bg-gray-800 rounded-xl shadow-lg p-6"
                    >
                        {renderContent()}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
}