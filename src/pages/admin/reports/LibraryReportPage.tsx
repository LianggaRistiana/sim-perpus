import React, { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import type { LibraryOverview, CategoryDistributionItem, InventoryBook } from '../../../types';
import ReportChart from '../../../components/ReportChart';
import { BookOpen, FileText, FolderOpen, ChevronLeft, ChevronRight } from 'lucide-react';

const LibraryReportPage: React.FC = () => {
    // State for overview section
    const [overview, setOverview] = useState<LibraryOverview | null>(null);
    const [overviewLoading, setOverviewLoading] = useState(true);

    // State for category distribution section
    const [categories, setCategories] = useState<CategoryDistributionItem[]>([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);

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
                const data = await api.getLibraryOverview();
                setOverview(data);
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
                const data = await api.getCategoryDistribution();
                setCategories(data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            } finally {
                setCategoriesLoading(false);
            }
        };
        fetchCategories();
    }, []);

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

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status.toLowerCase()) {
            case 'available':
                return 'bg-green-100 text-green-700';
            case 'borrowed':
                return 'bg-orange-100 text-orange-700';
            case 'damaged':
            case 'lost':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const getConditionBadgeClass = (condition: string) => {
        switch (condition.toLowerCase()) {
            case 'good':
                return 'bg-green-100 text-green-700';
            case 'fair':
                return 'bg-yellow-100 text-yellow-700';
            case 'poor':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

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
                        <div className="grid gap-6 md:grid-cols-3">
                            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="rounded-full bg-blue-100 p-3 text-blue-600">
                                        <BookOpen size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-neutral-600">Total Judul Buku</p>
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
                                        <p className="text-sm font-medium text-neutral-600">Total Eksemplar Buku</p>
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
                                        <p className="text-sm font-medium text-neutral-600">Total Kategori</p>
                                        <p className="text-2xl font-bold text-neutral-900">{overview.total_categories.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <p className="text-neutral-500">Gagal memuat data ringkasan.</p>
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
                <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-neutral-900">Inventori Buku</h2>
                            <p className="text-sm text-neutral-600">Total: {totalItems.toLocaleString()} buku</p>
                        </div>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handlePreviousPage}
                                    disabled={currentPage === 1}
                                    className="flex items-center gap-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <ChevronLeft size={16} />
                                    Sebelumnya
                                </button>
                                <span className="text-sm text-neutral-600">
                                    Halaman {currentPage} dari {totalPages}
                                </span>
                                <button
                                    onClick={handleNextPage}
                                    disabled={currentPage === totalPages}
                                    className="flex items-center gap-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Selanjutnya
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        )}
                    </div>

                    {inventoryLoading ? (
                        <div className="flex h-64 items-center justify-center">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                        </div>
                    ) : inventory.length > 0 ? (
                        <div className="space-y-4">
                            {inventory.map((book) => (
                                <div
                                    key={book.book_id}
                                    className="rounded-lg border border-neutral-200 p-4 transition-all hover:border-blue-300 hover:shadow-md"
                                >
                                    {/* Book Header */}
                                    <div className="mb-3 flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-bold text-neutral-900">{book.title}</h3>
                                            <p className="text-sm text-neutral-600">
                                                {book.author} • {book.publisher} ({book.year})
                                            </p>
                                            <p className="text-sm text-neutral-500">ISBN: {book.isbn}</p>
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                                                {book.category}
                                            </span>
                                            <span className="text-xs text-neutral-500">
                                                {book.total_items} eksemplar
                                            </span>
                                        </div>
                                    </div>

                                    {/* Book Items Table */}
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-sm">
                                            <thead className="bg-neutral-50 text-neutral-500">
                                                <tr>
                                                    <th className="px-3 py-2 font-medium">Kode</th>
                                                    <th className="px-3 py-2 font-medium">Kondisi</th>
                                                    <th className="px-3 py-2 font-medium">Status</th>
                                                    <th className="px-3 py-2 font-medium">Tanggal Masuk</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-neutral-200">
                                                {book.items.map((item) => (
                                                    <tr key={item.item_id} className="hover:bg-neutral-50">
                                                        <td className="px-3 py-2 font-medium text-neutral-900">
                                                            {item.code}
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <span
                                                                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${getConditionBadgeClass(item.condition)}`}
                                                            >
                                                                {item.condition}
                                                            </span>
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <span
                                                                className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadgeClass(item.status)}`}
                                                            >
                                                                {item.status}
                                                            </span>
                                                        </td>
                                                        <td className="px-3 py-2 text-neutral-600">
                                                            {new Date(item.created_at).toLocaleDateString('id-ID')}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-neutral-500">Tidak ada data inventori.</p>
                    )}

                    {/* Bottom Pagination */}
                    {totalPages > 1 && !inventoryLoading && (
                        <div className="mt-6 flex items-center justify-center gap-2">
                            <button
                                onClick={handlePreviousPage}
                                disabled={currentPage === 1}
                                className="flex items-center gap-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <ChevronLeft size={16} />
                                Sebelumnya
                            </button>
                            <span className="text-sm text-neutral-600">
                                Halaman {currentPage} dari {totalPages}
                            </span>
                            <button
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages}
                                className="flex items-center gap-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Selanjutnya
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LibraryReportPage;
