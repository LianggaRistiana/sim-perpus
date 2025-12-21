import React from 'react';
import type { Admin } from '../types';

interface DashboardHomeProps {
    user: Admin;
}

const DashboardHome: React.FC<DashboardHomeProps> = ({ user }) => {
    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-neutral-900">Selamat Datang, {user.name}</h1>
                <p className="text-neutral-600">Selamat datang di sistem manajemen perpustakaan.</p>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white p-12 text-center shadow-sm">
                <div className="mx-auto mb-4 h-24 w-24 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                    </svg>
                </div>
                <h2 className="text-xl font-semibold text-neutral-900">Dashboard Admin</h2>
                <p className="mt-2 text-neutral-500 max-w-lg mx-auto">
                    Silakan gunakan menu navigasi di sebelah kiri untuk mengelola data buku, anggota, dan transaksi peminjaman.
                </p>
            </div>
        </div>
    );
};

export default DashboardHome;
