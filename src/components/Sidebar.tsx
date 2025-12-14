import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    BookOpen,
    ClipboardList,
    LogOut,
    X,
    ChevronDown,
    BarChart3
} from 'lucide-react';

import { Modal } from './Modal';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onLogout }) => {
    const location = useLocation();
    const [isMasterDataOpen, setIsMasterDataOpen] = useState(false);
    const [isReportOpen, setIsReportOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    // Keep Master Data dropdown open if we are in a submenu
    useEffect(() => {
        if (location.pathname.includes('/dashboard/books') ||
            location.pathname.includes('/dashboard/students') ||
            location.pathname.includes('/dashboard/categories')) {
            setIsMasterDataOpen(true);
        }
        if (location.pathname.includes('/dashboard/reports')) {
            setIsReportOpen(true);
        }
    }, [location.pathname]);

    return (
        <aside
            className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-neutral-900 text-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                } flex flex-col`}
        >
            <div className="flex h-16 items-center justify-between px-6">
                <span className="text-xl font-bold">SimPerpus</span>
                <button
                    className="lg:hidden"
                    onClick={onClose}
                >
                    <X size={24} />
                </button>
            </div>

            <nav className="mt-6 px-4 space-y-2 flex-1 overflow-y-auto">
                <Link
                    to="/dashboard"
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${location.pathname === '/dashboard'
                        ? 'bg-blue-600 text-white'
                        : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                        }`}
                >
                    <LayoutDashboard size={20} />
                    Dashboard
                </Link>

                {/* Master Data Dropdown */}
                <div className="space-y-1">
                    <button
                        onClick={() => setIsMasterDataOpen(!isMasterDataOpen)}
                        className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-sm font-medium transition-colors ${isMasterDataOpen ? 'text-white' : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <BookOpen size={20} />
                            Data Master
                        </div>
                        <ChevronDown
                            size={16}
                            className={`transition-transform duration-200 ${isMasterDataOpen ? 'rotate-180' : ''}`}
                        />
                    </button>
                    {isMasterDataOpen && (
                        <div className="pl-11 space-y-1">
                            <Link
                                to="/dashboard/books"
                                className={`block rounded-lg py-2 text-sm font-medium transition-colors ${location.pathname.includes('/dashboard/books')
                                    ? 'text-white'
                                    : 'text-neutral-400 hover:text-white'
                                    }`}
                            >
                                Buku
                            </Link>
                            <Link
                                to="/dashboard/students"
                                className={`block rounded-lg py-2 text-sm font-medium transition-colors ${location.pathname.includes('/dashboard/students')
                                    ? 'text-white'
                                    : 'text-neutral-400 hover:text-white'
                                    }`}
                            >
                                Anggota
                            </Link>
                            <Link
                                to="/dashboard/categories"
                                className={`block rounded-lg py-2 text-sm font-medium transition-colors ${location.pathname.includes('/dashboard/categories')
                                    ? 'text-white'
                                    : 'text-neutral-400 hover:text-white'
                                    }`}
                            >
                                Kategori
                            </Link>
                        </div>
                    )}
                </div>

                <Link
                    to="/dashboard/transactions"
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${location.pathname.includes('/dashboard/transactions')
                        ? 'bg-blue-600 text-white'
                        : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                        }`}
                >
                    <ClipboardList size={20} />
                    Transaksi
                </Link>

                <div className="space-y-1">
                    <button
                        onClick={() => setIsReportOpen(!isReportOpen)}
                        className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-sm font-medium transition-colors ${isReportOpen ? 'text-white' : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <BarChart3 size={20} />
                            Laporan
                        </div>
                        <ChevronDown
                            size={16}
                            className={`transition-transform duration-200 ${isReportOpen ? 'rotate-180' : ''}`}
                        />
                    </button>
                    {isReportOpen && (
                        <div className="pl-11 space-y-1">
                            <Link
                                to="/dashboard/reports/books"
                                className={`block rounded-lg py-2 text-sm font-medium transition-colors ${location.pathname.includes('/dashboard/reports/books')
                                    ? 'text-white'
                                    : 'text-neutral-400 hover:text-white'
                                    }`}
                            >
                                Buku
                            </Link>
                            <Link
                                to="/dashboard/reports/categories"
                                className={`block rounded-lg py-2 text-sm font-medium transition-colors ${location.pathname.includes('/dashboard/reports/categories')
                                    ? 'text-white'
                                    : 'text-neutral-400 hover:text-white'
                                    }`}
                            >
                                Kategori
                            </Link>
                            <Link
                                to="/dashboard/reports/members"
                                className={`block rounded-lg py-2 text-sm font-medium transition-colors ${location.pathname.includes('/dashboard/reports/members')
                                    ? 'text-white'
                                    : 'text-neutral-400 hover:text-white'
                                    }`}
                            >
                                Anggota
                            </Link>
                        </div>
                    )}
                </div>
            </nav>

            <div className="w-full border-t border-neutral-800 p-4">
                <button
                    onClick={() => setIsLogoutModalOpen(true)}
                    className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-400 hover:bg-neutral-800 hover:text-red-300 transition-colors"
                >
                    <LogOut size={20} />
                    Keluar
                </button>
            </div>

            <Modal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                title="Konfirmasi Keluar"
                width="max-w-sm"
                footer={
                    <>
                        <button
                            onClick={() => setIsLogoutModalOpen(false)}
                            className="rounded-xl px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            onClick={onLogout}
                            className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-red-600/20 hover:bg-red-700 hover:shadow-xl hover:shadow-red-600/10 transition-all"
                        >
                            Ya, Keluar
                        </button>
                    </>
                }
            >
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
                        <LogOut size={24} />
                    </div>
                    <div className="text-sm text-neutral-600">
                        Apakah Anda yakin ingin keluar dari aplikasi?
                    </div>
                </div>
            </Modal>
        </aside>
    );
};

export default Sidebar;
