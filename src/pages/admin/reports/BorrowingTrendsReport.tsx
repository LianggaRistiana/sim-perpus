import React, { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import type { MonthlyTrend } from '../../../types';
import ReportChart from '../../../components/ReportChart';
import { TrendingUp, Calendar } from 'lucide-react';
import { StatCardSkeleton, ChartSkeleton } from '../../../components/SkeletonLoading';

const BorrowingTrendsReport: React.FC = () => {
    const [year, setYear] = useState(2025); // Default to 2025
    const [trends, setTrends] = useState<MonthlyTrend[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrends = async () => {
            setLoading(true);
            try {
                console.log('Fetching trends for year:', year);
                const response = await api.getBorrowingTrends(year);
                console.log('Trends response:', response);

                // Check if response has the expected structure
                if (response && response.data && response.data.monthly_trends) {
                    setTrends(response.data.monthly_trends);
                    console.log('Trends set:', response.data.monthly_trends);
                } else {
                    console.warn('Unexpected response structure:', response);
                    setTrends([]);
                }
            } catch (error) {
                console.error('Error fetching borrowing trends:', error);
                setTrends([]); // Set empty array on error
            } finally {
                setLoading(false);
            }
        };

        fetchTrends();
    }, [year]);

    const totalBorrowingsThisYear = trends.reduce((sum, t) => sum + t.total_borrowings, 0);
    const totalActiveThisYear = trends.reduce((sum, t) => sum + t.active, 0);
    const totalReturnedThisYear = trends.reduce((sum, t) => sum + t.returned, 0);

    const availableYears = [
        2025,
        2024,
        2023,
        2022,
        2021,
        2020
    ];

    // Debug logging
    console.log('Component render - Current year:', year);
    console.log('Component render - Available years:', availableYears);

    if (loading) {
        return (
            <div className="p-6 space-y-6">
                <div className="h-8 w-48 animate-pulse rounded bg-neutral-200"></div>
                <div className="grid gap-4 md:grid-cols-3">
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                    <StatCardSkeleton />
                </div>
                <ChartSkeleton height="h-96" />
            </div>
        );
    }

    return (
        <div className="flex h-screen flex-col overflow-hidden p-6">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-neutral-900">Tren Peminjaman</h1>

                {/* Year Selector */}
                <div className="flex items-center gap-2">
                    <Calendar className="text-neutral-500" size={20} />
                    <select
                        value={year}
                        onChange={(e) => {
                            const newYear = Number(e.target.value);
                            console.log('Year changed to:', newYear);
                            console.log('Available years:', availableYears);
                            setYear(newYear);
                        }}
                        className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm hover:border-neutral-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                        {availableYears.map((y) => (
                            <option key={y} value={y}>
                                {y}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto pr-2">
                {/* Year Summary Stats */}
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="rounded-full bg-blue-100 p-3 text-blue-600">
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-neutral-600">Total Peminjaman {year}</p>
                                <p className="text-2xl font-bold text-neutral-900">{totalBorrowingsThisYear}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="rounded-full bg-orange-100 p-3 text-orange-600">
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-neutral-600">Sedang Dipinjam</p>
                                <p className="text-2xl font-bold text-neutral-900">{totalActiveThisYear}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="rounded-full bg-green-100 p-3 text-green-600">
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-neutral-600">Dikembalikan</p>
                                <p className="text-2xl font-bold text-neutral-900">{totalReturnedThisYear}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Monthly Trends Chart */}
                {trends.length > 0 ? (
                    <>
                        <ReportChart
                            title={`Tren Peminjaman Bulanan - ${year}`}
                            data={trends.map((t) => ({
                                label: t.month_name,
                                value: t.total_borrowings
                            }))}
                            color="bg-blue-500"
                        />

                        {/* Active vs Returned Chart */}
                        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                            <h3 className="mb-4 text-lg font-bold text-neutral-900">Peminjaman Aktif vs Dikembalikan</h3>

                            <div className="space-y-3">
                                {trends.map((trend) => (
                                    <div key={trend.month} className="flex items-center gap-4">
                                        <div className="w-20 text-sm font-medium text-neutral-700">
                                            {trend.month_name}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex h-8 overflow-hidden rounded-lg bg-neutral-100">
                                                {trend.total_borrowings > 0 && (
                                                    <>
                                                        <div
                                                            className="flex items-center justify-center bg-orange-500 text-xs font-medium text-white"
                                                            style={{ width: `${(trend.active / trend.total_borrowings) * 100}%` }}
                                                            title={`Active: ${trend.active}`}
                                                        >
                                                            {trend.active > 0 && trend.active}
                                                        </div>
                                                        <div
                                                            className="flex items-center justify-center bg-green-500 text-xs font-medium text-white"
                                                            style={{ width: `${(trend.returned / trend.total_borrowings) * 100}%` }}
                                                            title={`Returned: ${trend.returned}`}
                                                        >
                                                            {trend.returned > 0 && trend.returned}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div className="w-16 text-right text-sm font-medium text-neutral-700">
                                            {trend.total_borrowings}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 flex items-center gap-6 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded bg-orange-500"></div>
                                    <span className="text-neutral-600">Sedang Dipinjam</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-3 w-3 rounded bg-green-500"></div>
                                    <span className="text-neutral-600">Dikembalikan</span>
                                </div>
                            </div>
                        </div>

                        {/* Monthly Details Table */}
                        <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
                            <div className="border-b border-neutral-200 px-6 py-4">
                                <h3 className="text-lg font-bold text-neutral-900">Detail Bulanan</h3>
                            </div>

                            <table className="w-full text-left text-sm">
                                <thead className="bg-neutral-50 text-neutral-500">
                                    <tr>
                                        <th className="px-6 py-3 font-medium">Bulan</th>
                                        <th className="px-6 py-3 font-medium text-right">Total Peminjaman</th>
                                        <th className="px-6 py-3 font-medium text-right">Sedang Dipinjam</th>
                                        <th className="px-6 py-3 font-medium text-right">Dikembalikan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100">
                                    {trends.map((trend) => (
                                        <tr key={trend.month} className="hover:bg-neutral-50">
                                            <td className="px-6 py-4 font-medium text-neutral-900">{trend.month_name}</td>
                                            <td className="px-6 py-4 text-right text-neutral-700">{trend.total_borrowings}</td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-700">
                                                    {trend.active}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                                                    {trend.returned}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : (
                    <div className="rounded-xl border border-neutral-200 bg-white p-12 text-center shadow-sm">
                        <p className="text-neutral-500">Tidak ada data tren peminjaman untuk tahun {year}.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BorrowingTrendsReport;
