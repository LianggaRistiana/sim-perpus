import React, { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import type { Category } from '../../../types';
import ReportChart from '../../../components/ReportChart';
import { ArrowLeft, BookOpen, BarChart2 } from 'lucide-react';

const CategoryReport: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [categoryStats, setCategoryStats] = useState<{
        monthlyBorrows: { label: string; value: number }[];
        totalBooks: number;
        totalBorrows: number;
    } | null>(null);

    // Global stats
    const [mostBorrowedCategories, setMostBorrowedCategories] = useState<{ label: string; value: number }[]>([]);
    const [longestBorrowedCategories, setLongestBorrowedCategories] = useState<{ label: string; value: number }[]>([]);

    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [cats, mostBorrowed, longestBorrowed] = await Promise.all([
                    api.getCategories(),
                    api.getMostBorrowedCategories(),
                    api.getLongestBorrowedCategories()
                ]);

                setCategories(cats.data);
                setMostBorrowedCategories(mostBorrowed.map(i => ({ label: i.name, value: i.count })));
                setLongestBorrowedCategories(longestBorrowed.map(i => ({ label: i.name, value: i.days })));
            } catch (error) {
                console.error('Error fetching category report data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleCategoryClick = async (category: Category) => {
        setSelectedCategory(category);
        setDetailLoading(true);
        try {
            const stats = await api.getCategoryReportDetails(category.id);
            setCategoryStats({
                monthlyBorrows: stats.monthlyBorrows.map(i => ({ label: i.month, value: i.count })),
                totalBooks: stats.totalBooks,
                totalBorrows: stats.totalBorrows
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
            <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            </div>
        );
    }

    if (selectedCategory) {
        return (
            <div className="p-6">
                <button
                    onClick={handleBack}
                    className="mb-6 flex items-center text-sm font-medium text-neutral-600 hover:text-blue-600"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Kembali ke Daftar Laporan
                </button>

                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-neutral-900">{selectedCategory.name}</h1>
                    <p className="text-neutral-600">{selectedCategory.description}</p>
                </div>

                {detailLoading ? (
                    <div className="flex h-64 items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                    </div>
                ) : categoryStats && (
                    <div className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
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
                        </div>

                        <ReportChart
                            title={`Statistik Peminjaman - ${selectedCategory.name}`}
                            data={categoryStats.monthlyBorrows}
                            color="bg-blue-500"
                        />
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="p-6">
            <h1 className="mb-8 text-2xl font-bold text-neutral-900">Laporan Kategori</h1>

            {/* Global Stats */}
            <div className="mb-10 grid gap-6 md:grid-cols-2">
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

            <h2 className="mb-4 text-lg font-bold text-neutral-900">Detail per Kategori</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map((category) => (
                    <button
                        key={category.id}
                        onClick={() => handleCategoryClick(category)}
                        className="flex flex-col items-start rounded-xl border border-neutral-200 bg-white p-6 text-left shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
                    >
                        <h3 className="mb-2 font-bold text-neutral-900">{category.name}</h3>
                        <p className="text-sm text-neutral-600 line-clamp-2">{category.description}</p>
                        <div className="mt-4 flex items-center text-xs font-medium text-blue-600">
                            Lihat Statistik <BarChart2 size={14} className="ml-1" />
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default CategoryReport;
