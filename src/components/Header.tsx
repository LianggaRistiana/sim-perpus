import React from 'react';
import { Menu } from 'lucide-react';
import type { Admin } from '../types';

interface HeaderProps {
    onMenuClick: () => void;
    user: Admin;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, user }) => {
    return (
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-6 shadow-sm">
            <button
                className="lg:hidden"
                onClick={onMenuClick}
            >
                <Menu size={24} className="text-neutral-600" />
            </button>

            <div className="flex items-center gap-4 ml-auto">
                {/* <button className="relative rounded-full bg-neutral-100 p-2 text-neutral-600 hover:bg-neutral-200">
                    <Bell size={20} />
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500"></span>
                </button> */}
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                        {user.name.charAt(0)}
                    </div>
                    <div className="hidden md:block">
                        <p className="text-sm font-medium text-neutral-900">{user.name}</p>
                        <p className="text-xs text-neutral-500">{user.role}</p>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
