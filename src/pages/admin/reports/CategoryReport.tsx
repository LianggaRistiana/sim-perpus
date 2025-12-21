import React, { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import { useSearchParams } from 'react-router-dom';
import type { Category, PaginatedResponse } from '../../../types';
import ReportChart from '../../../components/ReportChart';
import { ArrowLeft, BookOpen, BarChart2, Search } from 'lucide-react';
import { StatCardSkeleton, ChartSkeleton } from '../../../components/SkeletonLoading';
import { TableEmpty } from '../../../components/TableState';
import { Pagination } from '../../../components/Pagination';

const CategoryReport: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [searchParams] = useSearchParams();
    const initialSearch = searchParams.get('search') || '';

    const [meta, setMeta] = useState<PaginatedResponse<Category>['meta']>({
        current_page: 1,
        per_page: 10,
        total: 0,
        last_page: 1,
        timestamp: ''
    });
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [categoryStats, setCategoryStats] = useState<{
        monthlyBorrows: { label: string; value: number }[];
        totalBooks: number;
        totalBorrows: number;
        averageBorrowsPerBook: number;
        topBooks: { bookId: string; title: string; author: string; totalBorrows: number; currentlyBorrowed: number }[];
    } | null>(null);

    // Global stats
    const [mostBorrowedCategories, setMostBorrowedCategories] = useState<{ label: string; value: number }[]>([]);
    const [longestBorrowedCategories, setLongestBorrowedCategories] = useState<{ label: string; value: number }[]>([]);

    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);

    // Search and pagination states
    const [inputValue, setInputValue] = useState(initialSearch);
    const [searchTerm, setSearchTerm] = useState(initialSearch);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Debounced search
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setSearchTerm(inputValue);
            setCurrentPage(1); // Reset to page 1 on search
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [inputValue]);

    // Initial load for charts only
    useEffect(() => {
        const fetchChartsData = async () => {
            try {
                const [mostBorrowed, longestBorrowed] = await Promise.all([
                    api.getMostBorrowedCategories(),
                    api.getLongestBorrowedCategories()
                ]);

                setMostBorrowedCategories(mostBorrowed.map(i => ({ label: i.name, value: i.count })));
                setLongestBorrowedCategories(longestBorrowed.map(i => ({ label: i.name, value: i.days })));
            } catch (error) {
                console.error('Error fetching category chart data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchChartsData();
    }, []);

    // Fetch categories with pagination and search
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.getCategories({
                    page: currentPage,
                    limit: itemsPerPage,
                    keyword: searchTerm
                });
                setCategories(response.data);
                setMeta(response.meta);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        fetchCategories();
    }, [currentPage, itemsPerPage, searchTerm]);

    const handleCategoryClick = async (category: Category) => {
        setSelectedCategory(category);
        setDetailLoading(true);
        try {
            const stats = await api.getCategoryReportDetails(category.id);
            setCategoryStats({
                monthlyBorrows: stats.monthlyBorrows.map(i => ({ label: i.month, value: i.count })),
                totalBooks: stats.totalBooks,
                totalBorrows: stats.totalBorrows,
                averageBorrowsPerBook: stats.averageBorrowsPerBook,
                topBooks: stats.topBooks
            });
        } catch (error) {
            console.error('Error fetching category details:', error);
        } finally {
            setDetailLoading(false);
        }
    };

    const handleBack = () => {
        setSelectedCategory(null);
        setCategoryStats(null);
    };

    if (loading) {
        return (
            <div className="p-6 space-y-4">
                <div className="h-8 w-64 animate-pulse rounded bg-neutral-200"></div>
                <div className="grid gap-6 md:grid-cols-2">
                    <ChartSkeleton />
                    <ChartSkeleton />
                </div>
            </div>
        );
    }

    if (selectedCategory) {
        return (
            <div className="flex h-screen flex-col overflow-hidden p-4 md:p-6">
                <button
                    onClick={handleBack}
                    className="mb-4 md:mb-6 flex items-center text-sm font-medium text-neutral-600 hover:text-blue-600"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Kembali ke Daftar Laporan
                </button>

                <div className="mb-6">
                    <h1 className="text-xl md:text-2xl font-bold text-neutral-900">{selectedCategory.name}</h1>
                    <p className="text-sm md:text-base text-neutral-600">{selectedCategory.description}</p>
                </div>

                {detailLoading ? (
                    <div className="flex-1 space-y-6 overflow-y-auto pr-2">
                        <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
                            <StatCardSkeleton />
                            <StatCardSkeleton />
                        </div>
                        <ChartSkeleton />
                    </div>
                ) : categoryStats && (
                    <div className="flex-1 space-y-6 overflow-y-auto pr-2">
                        {/* Statistics Grid - Matching Overview Style */}
                        <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                            {/* Total Books */}
                            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="rounded-full bg-blue-100 p-3 text-blue-600">
                                        <BookOpen size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-neutral-600">Total Buku</p>
                                        <p className="text-2xl font-bold text-neutral-900">{categoryStats.totalBooks}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Total Peminjaman */}
                            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="rounded-full bg-green-100 p-3 text-green-600">
                                        <BarChart2 size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-neutral-600">Total Peminjaman</p>
                                        <p className="text-2xl font-bold text-neutral-900">{categoryStats.totalBorrows}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Average Borrows per Book */}
                            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="rounded-full bg-purple-100 p-3 text-purple-600">
                                        <BarChart2 size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-neutral-600">Rata-rata Peminjaman</p>
                                        <p className="text-2xl font-bold text-neutral-900">{categoryStats.averageBorrowsPerBook.toFixed(1)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Monthly Chart */}
                        <ReportChart
                            title={`Statistik Peminjaman - ${selectedCategory.name}`}
                            data={categoryStats.monthlyBorrows}
                            color="bg-blue-500"
                        />

                        {/* Top Books Section */}
                        {categoryStats.topBooks.length > 0 && (
                            <div className="rounded-xl border border-neutral-200 bg-white shadow-sm">
                                <div className="border-b border-neutral-200 px-6 py-4">
                                    <h3 className="text-lg font-bold text-neutral-900">Buku Paling Populer</h3>
                                    <p className="text-sm text-neutral-600">5 buku teratas dengan peminjaman terbanyak</p>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-4">
                                        {categoryStats.topBooks.slice(0, 5).map((book, index) => (
                                            <div key={book.bookId} className="flex items-start gap-4 rounded-lg border border-neutral-100 p-4 hover:bg-neutral-50 hover:border-neutral-200 transition-colors">
                                                {/* Rank Badge */}
                                                <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                                    index === 1 ? 'bg-gray-100 text-gray-700' :
                                                        index === 2 ? 'bg-orange-100 text-orange-700' :
                                                            'bg-neutral-100 text-neutral-600'
                                                    }`}>
                                                    {index + 1}
                                                </div>

                                                {/* Book Info */}
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-semibold text-neutral-900 truncate">{book.title}</h4>
                                                    <p className="text-sm text-neutral-600">{book.author}</p>
                                                </div>

                                                {/* Borrow Stats */}
                                                <div className="flex flex-col items-end gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-neutral-500">Peminjaman:</span>
                                                        <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                                                            {book.totalBorrows}
                                                        </span>
                                                    </div>
                                                    {book.currentlyBorrowed > 0 && (
                                                        <span className="text-xs text-orange-600">
                                                            {book.currentlyBorrowed} sedang dipinjam
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="flex h-screen flex-col overflow-hidden p-4 md:p-6">
            <h1 className="mb-4 md:mb-6 text-xl md:text-2xl font-bold text-neutral-900">Laporan Kategori</h1>

            <div className="flex-1 space-y-6 md:space-y-8 overflow-y-auto pr-2">
                {/* Global Stats */}
                <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
                    <ReportChart
                        title="Kategori Paling Sering Dipinjam"
                        data={mostBorrowedCategories}
                        color="bg-green-500"
                    />
                    <ReportChart
                        title="Kategori Paling Lama Dipinjam (Hari)"
                        data={longestBorrowedCategories}
                        color="bg-purple-500"
                    />
                </div>

                <div>
                    <h2 className="mb-4 text-lg font-bold text-neutral-900">Detail per Kategori</h2>

                    {/* Search Bar */}
                    <div className="mb-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
                            <input
                                type="text"
                                placeholder="Cari kategori berdasarkan nama atau deskripsi..."
                                className="w-full rounded-lg border border-neutral-200 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Categories Table */}
                    <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-neutral-50 text-neutral-500">
                                    <tr>
                                        <th className="px-6 py-4 font-medium">Nama Kategori</th>
                                        <th className="px-6 py-4 font-medium hidden md:table-cell">Deskripsi</th>
                                        <th className="px-6 py-4 font-medium text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100">
                                    {categories.length === 0 ? (
                                        <TableEmpty
                                            colSpan={3}
                                            message="Tidak ada kategori ditemukan"
                                            description="Coba cari dengan kata kunci yang berbeda."
                                        />
                                    ) : (
                                        categories.map((category) => (
                                            <tr
                                                key={category.id}
                                                className="cursor-pointer hover:bg-neutral-50"
                                                onClick={() => handleCategoryClick(category)}
                                            >
                                                <td className="px-6 py-4 font-medium text-neutral-900">{category.name}</td>
                                                <td className="px-6 py-4 text-neutral-600 max-w-md truncate hidden md:table-cell">
                                                    {category.description || '-'}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleCategoryClick(category);
                                                        }}
                                                        className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50"
                                                    >
                                                        <BarChart2 size={14} />
                                                        <span className="hidden md:inline">Lihat Detail</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    {meta.total > 0 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={meta.last_page}
                            totalItems={meta.total}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setCurrentPage}
                            onItemsPerPageChange={(limit) => {
                                setItemsPerPage(limit);
                                setCurrentPage(1);
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default CategoryReport;
