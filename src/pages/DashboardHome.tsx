import React from 'react';
import { BookOpen, Users, ClipboardList, Bell, User } from 'lucide-react';
import type { Admin } from '../types';

interface DashboardHomeProps {
    user: Admin;
}

const DashboardHome: React.FC<DashboardHomeProps> = ({ user }) => {
    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-neutral-900">Selamat Datang, {user.name}</h1>
                <p className="text-neutral-600">Berikut adalah ringkasan aktivitas perpustakaan hari ini.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-neutral-500">Total Buku</p>
                            <p className="text-2xl font-bold text-neutral-900">1,248</p>
                        </div>
                        <div className="rounded-lg bg-blue-100 p-3 text-blue-600">
                            <BookOpen size={24} />
                        </div>
                    </div>
                </div>
                <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-neutral-500">Anggota Aktif</p>
                            <p className="text-2xl font-bold text-neutral-900">452</p>
                        </div>
                        <div className="rounded-lg bg-green-100 p-3 text-green-600">
                            <Users size={24} />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-green-600">
                        <span>+12 bulan ini</span>
                    </div>
                </div>
                <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-neutral-500">Peminjaman</p>
                            <p className="text-2xl font-bold text-neutral-900">86</p>
                        </div>
                        <div className="rounded-lg bg-purple-100 p-3 text-purple-600">
                            <ClipboardList size={24} />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-neutral-500">
                        <span>Sedang berlangsung</span>
                    </div>
                </div>
                <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-neutral-500">Terlambat</p>
                            <p className="text-2xl font-bold text-red-600">12</p>
                        </div>
                        <div className="rounded-lg bg-red-100 p-3 text-red-600">
                            <Bell size={24} />
                        </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-red-600">
                        <span>Perlu tindakan</span>
                    </div>
                </div>
            </div>

            {/* Recent Activity Placeholder */}
            <div className="mt-8 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-bold text-neutral-900">Aktivitas Terbaru</h2>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between border-b border-neutral-100 pb-4 last:border-0 last:pb-0">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500">
                                    <User size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-neutral-900">John Doe meminjam "Clean Code"</p>
                                    <p className="text-xs text-neutral-500">2 jam yang lalu</p>
                                </div>
                            </div>
                            <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">Peminjaman</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
