import React, { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import type { LibraryOverview, CategoryDistributionItem, InventoryBook, InDemandBook, MonthlyTrend } from '../../../types';
import { Pagination } from '../../../components/Pagination';
import { TableLoading, TableEmpty } from '../../../components/TableState';
import { BookOpen, FileText, FolderOpen, TrendingUp } from 'lucide-react';

const LibraryReportPage: React.FC = () => {
    // State for overview section
    const [overview, setOverview] = useState<LibraryOverview | null>(null);
    const [overviewLoading, setOverviewLoading] = useState(true);

    // State for category distribution section
    const [categories, setCategories] = useState<CategoryDistributionItem[]>([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);

    // State for in-demand section
    const [inDemandBooks, setInDemandBooks] = useState<InDemandBook[]>([]);
    const [inDemandLoading, setInDemandLoading] = useState(true);

    // State for borrowing trends section
    const [trends, setTrends] = useState<MonthlyTrend[]>([]);
    const [trendsYear, setTrendsYear] = useState<number>(new Date().getFullYear());
    const [trendsLoading, setTrendsLoading] = useState(true);

    // State for inventory section
    const [inventory, setInventory] = useState<InventoryBook[]>([]);
    const [inventoryLoading, setInventoryLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const perPage = 15;

    // Fetch overview data
    useEffect(() => {
        const fetchOverview = async () => {
            try {
                setOverviewLoading(true);
                const response = await api.getLibraryOverview();
                setOverview(response.data);
            } catch (error) {
                console.error('Error fetching overview:', error);
            } finally {
                setOverviewLoading(false);
            }
        };
        fetchOverview();
    }, []);

    // Fetch category distribution data
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setCategoriesLoading(true);
                const response = await api.getCategoryDistribution();
                setCategories(response.data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            } finally {
                setCategoriesLoading(false);
            }
        };
        fetchCategories();
    }, []);

    // Fetch in-demand books data
    useEffect(() => {
        const fetchInDemand = async () => {
            try {
                setInDemandLoading(true);
                const response = await api.getInDemand(10);
                setInDemandBooks(response.data);
            } catch (error) {
                console.error('Error fetching in-demand books:', error);
            } finally {
                setInDemandLoading(false);
            }
        };
        fetchInDemand();
    }, []);

    // Fetch borrowing trends data
    useEffect(() => {
        const fetchTrends = async () => {
            try {
                setTrendsLoading(true);
                console.log('Fetching borrowing trends for year:', trendsYear);
                const response = await api.getBorrowingTrends(trendsYear);
                console.log('Borrowing trends response:', response);

                // Safely access monthly_trends
                if (response && response.data && response.data.monthly_trends) {
                    setTrends(response.data.monthly_trends);
                    console.log('Trends set:', response.data.monthly_trends);
                } else {
                    console.warn('No monthly_trends in response:', response);
                    setTrends([]);
                }
            } catch (error) {
                console.error('Error fetching borrowing trends:', error);
                setTrends([]);
            } finally {
                setTrendsLoading(false);
            }
        };
        fetchTrends();
    }, [trendsYear]);

    // Fetch inventory data with pagination
    useEffect(() => {
        const fetchInventory = async () => {
            try {
                setInventoryLoading(true);
                const response = await api.getInventoryReport(currentPage, perPage);
                setInventory(response.data);
                setTotalPages(response.pagination.last_page);
                setTotalItems(response.pagination.total);
            } catch (error) {
                console.error('Error fetching inventory:', error);
            } finally {
                setInventoryLoading(false);
            }
        };
        fetchInventory();
    }, [currentPage]);


    return (
        <div className="flex h-screen flex-col overflow-hidden p-6">
            <h1 className="mb-6 text-2xl font-bold text-neutral-900">Laporan Perpustakaan</h1>

            {/* Scrollable Content Container */}
            <div className="flex-1 space-y-8 overflow-y-auto pr-2">
                {/* Overview Section */}
                <div>
                    <h2 className="mb-4 text-lg font-bold text-neutral-900">Ringkasan Perpustakaan</h2>

                    {overviewLoading ? (
                        <div className="flex h-32 items-center justify-center">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                        </div>
                    ) : overview ? (
                        <div className="grid gap-6 md:grid-cols-5">
                            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="rounded-full bg-blue-100 p-3 text-blue-600">
                                        <BookOpen size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-neutral-600">Judul Buku</p>
                                        <p className="text-2xl font-bold text-neutral-900">{overview.total_book_titles.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="rounded-full bg-green-100 p-3 text-green-600">
                                        <FileText size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-neutral-600">Eksemplar</p>
                                        <p className="text-2xl font-bold text-neutral-900">{overview.total_book_items.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="rounded-full bg-purple-100 p-3 text-purple-600">
                                        <FolderOpen size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-neutral-600">Kategori</p>
                                        <p className="text-2xl font-bold text-neutral-900">{overview.total_categories.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="rounded-full bg-orange-100 p-3 text-orange-600">
                                        <TrendingUp size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-neutral-600">Dipinjam</p>
                                        <p className="text-2xl font-bold text-neutral-900">{overview.total_borrowed.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="rounded-full bg-red-100 p-3 text-red-600">
                                        <FileText size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-neutral-600">Terlambat</p>
                                        <p className="text-2xl font-bold text-neutral-900">{overview.total_overdue.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-neutral-500">Gagal memuat data ringkasan.</p>
                    )}
                </div>

                {/* In-Demand Books Section */}
                <div>
                    <h2 className="mb-4 text-lg font-bold text-neutral-900">Buku Paling Diminati Saat Ini</h2>

                    {inDemandLoading ? (
                        <div className="flex h-32 items-center justify-center">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                        </div>
                    ) : inDemandBooks.length > 0 ? (
                        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                            <div className="space-y-4">
                                {inDemandBooks.map((book, index) => {
                                    const getDemandColor = (percentage: number) => {
                                        if (percentage >= 80) return 'bg-red-500';
                                        if (percentage >= 50) return 'bg-yellow-500';
                                        return 'bg-green-500';
                                    };

                                    const getDemandBadge = (percentage: number) => {
                                        if (percentage >= 80) return { text: 'Permintaan Tinggi', color: 'bg-red-100 text-red-700' };
                                        if (percentage >= 50) return { text: 'Permintaan Sedang', color: 'bg-yellow-100 text-yellow-700' };
                                        return { text: 'Permintaan Normal', color: 'bg-green-100 text-green-700' };
                                    };

                                    const badge = getDemandBadge(book.demand_percentage);

                                    return (
                                        <div key={book.book_id} className="flex items-start gap-4 rounded-lg border border-neutral-100 p-4 hover:bg-neutral-50">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-600">
                                                {index + 1}
                                            </div>
                                            <div className="flex-1">
                                                <div className="mb-1 flex items-start justify-between">
                                                    <div>
                                                        <h3 className="font-bold text-neutral-900">{book.title}</h3>
                                                        <p className="text-sm text-neutral-600">{book.author} • {book.publisher}</p>
                                                        {book.category && (
                                                            <span className="mt-1 inline-block rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                                                                {book.category}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${badge.color}`}>
                                                        {badge.text}
                                                    </span>
                                                </div>
                                                <div className="mt-3 flex items-center gap-4">
                                                    <div className="flex-1">
                                                        <div className="mb-1 flex justify-between text-sm">
                                                            <span className="text-neutral-600">Dipinjam saat ini</span>
                                                            <span className="font-medium text-neutral-900">
                                                                {book.currently_borrowed}/{book.total_items} ({Math.round(book.demand_percentage)}%)
                                                            </span>
                                                        </div>
                                                        <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                                                            <div
                                                                className={`h-full rounded-full ${getDemandColor(book.demand_percentage)}`}
                                                                style={{ width: `${book.demand_percentage}%` }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-xs text-neutral-500">Tersedia</p>
                                                        <p className="text-lg font-bold text-neutral-900">{book.currently_available}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <p className="text-neutral-500">Tidak ada buku yang sedang dipinjam.</p>
                    )}
                </div>

                {/* Borrowing Trends Section */}
                <div>
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-bold text-neutral-900">Tren Peminjaman Bulanan</h2>
                        <div className="flex items-center gap-2">
                            <label htmlFor="year-select" className="text-sm text-neutral-600">Tahun:</label>
                            <select
                                id="year-select"
                                value={trendsYear}
                                onChange={(e) => setTrendsYear(Number(e.target.value))}
                                className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                            >
                                {[2024, 2023, 2022, 2021].map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {trendsLoading ? (
                        <div className="flex h-64 items-center justify-center">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                        </div>
                    ) : trends.length > 0 ? (
                        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                            <div className="mb-6 flex items-center gap-2 text-sm text-neutral-600">
                                <TrendingUp size={16} />
                                <span>Data peminjaman per bulan untuk tahun {trendsYear}</span>
                            </div>
                            <div className="space-y-4">
                                {trends.map((trend, index) => {
                                    const maxValue = Math.max(...trends.map(t => t.total_borrowings), 1);
                                    return (
                                        <div key={index} className="flex flex-col gap-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="font-medium text-neutral-700">{trend.month_name}</span>
                                                <div className="flex gap-4 text-xs">
                                                    <span className="text-neutral-500">Total: <strong className="text-neutral-900">{trend.total_borrowings}</strong></span>
                                                    <span className="text-orange-600">Aktif: <strong>{trend.active}</strong></span>
                                                    <span className="text-green-600">Kembali: <strong>{trend.returned}</strong></span>
                                                </div>
                                            </div>
                                            <div className="h-8 w-full overflow-hidden rounded-lg bg-neutral-100">
                                                <div className="flex h-full">
                                                    {/* Returned (green) */}
                                                    <div
                                                        className="bg-green-500"
                                                        style={{ width: `${(trend.returned / maxValue) * 100}%` }}
                                                        title={`Dikembalikan: ${trend.returned}`}
                                                    ></div>
                                                    {/* Active (orange) */}
                                                    <div
                                                        className="bg-orange-500"
                                                        style={{ width: `${(trend.active / maxValue) * 100}%` }}
                                                        title={`Aktif: ${trend.active}`}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="mt-6 flex justify-center gap-6 text-xs">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-sm bg-green-500"></div>
                                    <span className="text-neutral-600">Dikembalikan</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded-sm bg-orange-500"></div>
                                    <span className="text-neutral-600">Aktif</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-neutral-500">Tidak ada data tren peminjaman untuk tahun {trendsYear}.</p>
                    )}
                </div>

                {/* Category Distribution Section */}
                <div>
                    <h2 className="mb-4 text-lg font-bold text-neutral-900">Distribusi Kategori Buku</h2>

                    {categoriesLoading ? (
                        <div className="flex h-64 items-center justify-center">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                        </div>
                    ) : categories.length > 0 ? (
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Chart 1 - Scrollable */}
                            <div className="flex flex-col rounded-xl border border-neutral-200 bg-white shadow-sm">
                                <div className="border-b border-neutral-200 px-6 py-4">
                                    <h3 className="font-bold text-neutral-900">Jumlah Judul Buku per Kategori</h3>
                                </div>
                                <div className="max-h-96 overflow-y-auto p-6">
                                    <div className="space-y-4">
                                        {categories.map((cat, index) => {
                                            const maxValue = Math.max(...categories.map(c => c.total_book_titles), 1);
                                            return (
                                                <div key={index} className="flex flex-col gap-1">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="font-medium text-neutral-700">{cat.category_name}</span>
                                                        <span className="text-neutral-500">{cat.total_book_titles}</span>
                                                    </div>
                                                    <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                                                        <div
                                                            className="h-full rounded-full bg-blue-500"
                                                            style={{ width: `${(cat.total_book_titles / maxValue) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Chart 2 - Scrollable */}
                            <div className="flex flex-col rounded-xl border border-neutral-200 bg-white shadow-sm">
                                <div className="border-b border-neutral-200 px-6 py-4">
                                    <h3 className="font-bold text-neutral-900">Jumlah Eksemplar per Kategori</h3>
                                </div>
                                <div className="max-h-96 overflow-y-auto p-6">
                                    <div className="space-y-4">
                                        {categories.map((cat, index) => {
                                            const maxValue = Math.max(...categories.map(c => c.total_book_items), 1);
                                            return (
                                                <div key={index} className="flex flex-col gap-1">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="font-medium text-neutral-700">{cat.category_name}</span>
                                                        <span className="text-neutral-500">{cat.total_book_items}</span>
                                                    </div>
                                                    <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                                                        <div
                                                            className="h-full rounded-full bg-green-500"
                                                            style={{ width: `${(cat.total_book_items / maxValue) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-neutral-500">Tidak ada data kategori.</p>
                    )}
                </div>

                {/* Inventory Section */}
                <div>
                    <h2 className="mb-4 text-lg font-bold text-neutral-900">Inventori Buku</h2>

                    <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-neutral-50 text-neutral-500">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Buku</th>
                                    <th className="px-6 py-4 font-medium">ISBN</th>
                                    <th className="px-6 py-4 font-medium">Kategori</th>
                                    <th className="px-6 py-4 font-medium">Total Eksemplar</th>
                                    <th className="px-6 py-4 font-medium">Tersedia</th>
                                    <th className="px-6 py-4 font-medium">Ketersediaan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">

                                {inventoryLoading ? (
                                    <TableLoading colSpan={6} />
                                ) : inventory.length === 0 ? (
                                    <TableEmpty
                                        colSpan={6}
                                        message="Tidak ada data inventori"
                                        description="Belum ada buku yang terdaftar dalam sistem."
                                    />
                                ) : (
                                    inventory.map((book) => (
                                        <tr key={book.book_id} className="hover:bg-neutral-50">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-medium text-neutral-900">{book.title}</p>
                                                    <p className="text-sm text-neutral-600">{book.author} • {book.publisher} ({book.year})</p>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-neutral-600">{book.isbn}</td>
                                            <td className="px-6 py-4">
                                                {book.category && (
                                                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                                                        {book.category}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center font-medium text-neutral-900">{book.total_items}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="font-medium text-green-600">{book.available_count}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-100">
                                                        <div
                                                            className={`h-full rounded-full ${book.availability_percentage > 50
                                                                ? 'bg-green-500'
                                                                : book.availability_percentage > 20
                                                                    ? 'bg-yellow-500'
                                                                    : 'bg-red-500'
                                                                }`}
                                                            style={{ width: `${book.availability_percentage}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-xs text-neutral-600 w-12 text-right">
                                                        {Math.round(book.availability_percentage)}%
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {totalItems > 0 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={totalItems}
                            itemsPerPage={perPage}
                            onPageChange={setCurrentPage}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default LibraryReportPage;
