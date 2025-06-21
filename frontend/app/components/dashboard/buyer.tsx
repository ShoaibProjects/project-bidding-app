'use client';

import { useState, ReactNode, JSX, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FiHome, FiBriefcase, FiPlusCircle, FiUser, FiMessageSquare, FiMenu, FiX } from 'react-icons/fi';
import { useUserStore } from '@/store/userStore';
import { useRouter } from 'next/navigation';
import ProjectForm from '../ProjectForm';
import MyProjects from '../MyProjects/MyProjects';
import ProjectList from '../ProjectList';
import { LogOut } from 'lucide-react';

/**
 * Props interface for NavItem component
 * @property {ReactNode} icon - Icon element to display
 * @property {string} text - Text label for the navigation item
 * @property {boolean} [active] - Whether the item is currently active
 * @property {() => void} onClick - Click handler function
 */
interface NavItemProps {
    icon: ReactNode;
    text: string;
    active?: boolean;
    onClick: () => void;
}

/**
 * Reusable navigation item component with animations
 * @param {NavItemProps} props - Component props
 * @returns {JSX.Element} A styled navigation item with hover effects
 */
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
        <span className="ml-4 font-semibold">{text}</span>
    </motion.button>
);

/**
 * Type definition for active tab state in BuyerDashboard
 * @typedef {'myProjects' | 'allProjects' | 'createProject' | 'chatPage'} ActiveTab
 */
export type ActiveTab = 'myProjects' | 'allProjects' | 'createProject' | 'chatPage';

/**
 * BuyerDashboard component - Main dashboard for buyers
 * Features:
 * - Responsive sidebar navigation
 * - Tab-based content switching
 * - Project creation form
 * - Smooth animations between views
 * - User authentication management
 * @returns {JSX.Element} The buyer dashboard layout
 */
export default function BuyerDashboard(): JSX.Element {
    // State management
    const [toRefresh, setToRefresh] = useState<boolean>(false);
    const router = useRouter();
    const { user } = useUserStore();
    const [activeTab, setActiveTab] = useState<ActiveTab>('myProjects');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile sidebar state

    const { clearUser } = useUserStore();

    /**
     * Handles user logout
     * - Clears user state
     * - Removes auth token
     * - Redirects to home page
     */
    const handleLogout = () => {
        clearUser();
        localStorage.removeItem('token');
        router.push('/');
    };
    
    /**
     * Handles navigation item clicks
     * @param {ActiveTab} tab - The tab to activate
     */
    const handleNavItemClick = (tab: ActiveTab) => {
        setActiveTab(tab);
        if (window.innerWidth < 768) { // Close sidebar on mobile
            setIsSidebarOpen(false);
        }
    };

    /**
     * Handles route changes (for non-tab navigation)
     * @param {string} path - The path to navigate to
     */
    const handleRouteChange = (path: string) => {
        router.push(path);
        if (window.innerWidth < 768) {
             setIsSidebarOpen(false);
        }
    }

    /**
     * Renders content based on active tab
     * @returns {ReactNode} The appropriate content component
     */
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
            {/* Mobile Backdrop Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />
                )}
            </AnimatePresence>
            
            {/* Sidebar Navigation */}
            <motion.div
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
                    isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {/* Sidebar Header */}
                <div className="px-6 py-6 flex items-center justify-between">
                    <motion.h1
                        className="text-2xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                    >
                        Buyer Dashboard
                    </motion.h1>
                    {/* Close button for mobile */}
                    <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white">
                        <FiX className="w-6 h-6" />
                    </button>
                </div>
                
                {/* User Welcome Message */}
                <div className='px-6 mb-4'>
                     <p className="text-gray-500 text-sm">
                        Welcome, <span className="font-medium">{user?.email}</span>
                    </p>
                </div>

                {/* Main Navigation */}
                <nav className="flex-1 space-y-2 px-2">
                    <NavItem
                        icon={<FiHome className="w-6 h-6" />}
                        text="My Projects"
                        active={activeTab === 'myProjects'}
                        onClick={() => handleNavItemClick('myProjects')}
                    />
                    <NavItem
                        icon={<FiBriefcase className="w-6 h-6" />}
                        text="All Projects"
                        active={activeTab === 'allProjects'}
                        onClick={() => handleNavItemClick('allProjects')}
                    />
                    <NavItem
                        icon={<FiMessageSquare className="w-6 h-6" />}
                        text="Chat"
                        active={activeTab === 'chatPage'}
                        onClick={() => handleRouteChange('/chats')}
                    />
                    <NavItem
                        icon={<FiPlusCircle className="w-6 h-6" />}
                        text="Create Project"
                        active={activeTab === 'createProject'}
                        onClick={() => handleNavItemClick('createProject')}
                    />
                </nav>

                {/* Bottom Navigation (Profile and Logout) */}
                <div className="px-2 py-4">
                    <NavItem
                        icon={<FiUser className="w-6 h-6" />}
                        text="My Profile"
                        onClick={() => handleRouteChange(`/profile/${user?.id}`)}
                    />
                    <NavItem
                        icon={<LogOut className="w-6 h-6" />}
                        text='Logout'
                        onClick={handleLogout}
                    />
                </div>
            </motion.div>

            {/* Main Content Area */}
            <main className="flex-1 p-4 md:p-8 overflow-y-auto">
                {/* Mobile Menu Button */}
                 <button 
                    className="md:hidden p-2 mb-4 rounded-md text-gray-400 hover:bg-gray-700 focus:outline-none"
                    onClick={() => setIsSidebarOpen(true)}
                >
                    <FiMenu className="w-6 h-6" />
                </button>
                
                {/* Animated Content Switching */}
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