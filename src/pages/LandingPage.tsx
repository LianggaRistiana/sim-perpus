import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, ClipboardList, ArrowRight, Library } from 'lucide-react';

const LandingPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans selection:bg-blue-100">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white/80 backdrop-blur-md">
                <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                            <Library size={20} />
                        </div>
                        <span className="text-xl font-bold tracking-tight text-neutral-900">SimPerpus</span>
                    </div>
                    <div className="hidden md:flex items-center gap-6">
                        <a href="#features" className="text-sm font-medium text-neutral-600 hover:text-blue-600 transition-colors">Fitur</a>
                        <a href="#about" className="text-sm font-medium text-neutral-600 hover:text-blue-600 transition-colors">Tentang</a>
                        <Link to="/login" className="rounded-full bg-neutral-900 px-5 py-2 text-sm font-medium text-white hover:bg-neutral-800 transition-all hover:shadow-lg">
                            Masuk
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative overflow-hidden pt-20 pb-32 md:pt-32 md:pb-48">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-transparent to-transparent opacity-70"></div>
                <div className="container mx-auto px-4 md:px-6 text-center">
                    <div className="mx-auto max-w-3xl space-y-6">
                        <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-800">
                            <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2"></span>
                            Sistem Perpustakaan Generasi Baru
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 sm:text-5xl md:text-6xl lg:text-7xl">
                            Kelola perpustakaan Anda dengan <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Cerdas</span>
                        </h1>
                        <p className="mx-auto max-w-[700px] text-lg text-neutral-600 md:text-xl leading-relaxed">
                            Permudah pelacakan buku, manajemen anggota, dan transaksi dengan solusi manajemen perpustakaan kami yang modern, intuitif, dan canggih.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                            <Link to="/books" className="group inline-flex h-12 items-center justify-center rounded-full bg-blue-600 px-8 text-base font-medium text-white transition-all hover:bg-blue-700 hover:shadow-xl hover:-translate-y-0.5">
                                Lihat Katalog
                                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                            <button className="inline-flex h-12 items-center justify-center rounded-full border border-neutral-200 bg-white px-8 text-base font-medium text-neutral-900 transition-all hover:bg-neutral-50 hover:border-neutral-300">
                                Lihat Demo
                            </button>
                        </div>
                    </div>
                </div>

                {/* Abstract shapes for visual interest */}
                <div className="absolute top-1/2 left-0 -z-10 h-64 w-64 -translate-y-1/2 rounded-full bg-purple-100 blur-3xl opacity-50"></div>
                <div className="absolute bottom-0 right-0 -z-10 h-64 w-64 translate-y-1/3 rounded-full bg-blue-100 blur-3xl opacity-50"></div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 bg-white">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="mb-16 text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">Semua yang Anda butuhkan</h2>
                        <p className="mt-4 text-lg text-neutral-600">Alat komprehensif untuk mengelola perpustakaan Anda secara efisien.</p>
                    </div>
                    <div className="grid gap-8 md:grid-cols-3">
                        {/* Feature 1 */}
                        <div className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 p-8 transition-all hover:border-blue-200 hover:shadow-lg hover:bg-white">
                            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 group-hover:scale-110 transition-transform">
                                <BookOpen size={24} />
                            </div>
                            <h3 className="mb-2 text-xl font-bold text-neutral-900">Manajemen Buku</h3>
                            <p className="text-neutral-600">
                                Katalog, atur, dan lacak seluruh koleksi buku Anda dengan mudah menggunakan metadata terperinci dan pembaruan status.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 p-8 transition-all hover:border-blue-200 hover:shadow-lg hover:bg-white">
                            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 group-hover:scale-110 transition-transform">
                                <Users size={24} />
                            </div>
                            <h3 className="mb-2 text-xl font-bold text-neutral-900">Pelacakan Anggota</h3>
                            <p className="text-neutral-600">
                                Kelola profil siswa dan admin, lacak riwayat peminjaman, dan tangani keanggotaan dengan lancar.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50 p-8 transition-all hover:border-blue-200 hover:shadow-lg hover:bg-white">
                            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600 group-hover:scale-110 transition-transform">
                                <ClipboardList size={24} />
                            </div>
                            <h3 className="mb-2 text-xl font-bold text-neutral-900">Riwayat Transaksi</h3>
                            <p className="text-neutral-600">
                                Simpan catatan akurat dari setiap transaksi peminjaman dan pengembalian dengan tanggal jatuh tempo dan laporan kondisi.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-neutral-200 bg-neutral-50 py-12">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
                        <div className="flex items-center gap-2">
                            <div className="flex h-6 w-6 items-center justify-center rounded bg-neutral-900 text-white">
                                <Library size={14} />
                            </div>
                            <span className="text-lg font-bold text-neutral-900">SimPerpus</span>
                        </div>
                        <p className="text-sm text-neutral-500">
                            © {new Date().getFullYear()} SimPerpus. Hak Cipta Dilindungi.
                        </p>
                        <div className="flex gap-6">
                            <a href="#" className="text-sm text-neutral-500 hover:text-neutral-900">Privasi</a>
                            <a href="#" className="text-sm text-neutral-500 hover:text-neutral-900">Syarat</a>
                            <a href="#" className="text-sm text-neutral-500 hover:text-neutral-900">Kontak</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
