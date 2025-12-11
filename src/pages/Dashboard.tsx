import React, { useEffect, useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import type { Admin } from '../types';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<Admin | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
            navigate('/login');
            return;
        }
        setUser(JSON.parse(storedUser));
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    if (!user) return null;

    return (
        <div className="flex h-screen overflow-hidden bg-neutral-50">
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                onLogout={handleLogout}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header
                    onMenuClick={() => setIsSidebarOpen(true)}
                    user={user}
                />

                {/* Dashboard Content */}
                <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
                    <Outlet context={{ user }} />
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
