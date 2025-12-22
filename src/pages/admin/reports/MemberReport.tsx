import React, { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import { useSearchParams } from 'react-router-dom';
import type { Student, PaginatedResponse } from '../../../types';
import ReportChart from '../../../components/ReportChart';
import { ArrowLeft, User, BarChart2, Clock, AlertCircle, Search } from 'lucide-react';
import { StatCardSkeleton, ChartSkeleton } from '../../../components/SkeletonLoading';
import { TableEmpty } from '../../../components/TableState';
import { Pagination } from '../../../components/Pagination';
import { useNavigate } from 'react-router-dom';

const MemberReport: React.FC = () => {
    const navigate = useNavigate();
    const [students, setStudents] = useState<Student[]>([]);
    const [searchParams] = useSearchParams();
    const initialSearch = searchParams.get('search') || '';

    const [meta, setMeta] = useState<PaginatedResponse<Student>['meta']>({
        current_page: 1,
        per_page: 10,
        total: 0,
        last_page: 1,
        timestamp: ''
    });
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [studentStats, setStudentStats] = useState<{
        monthlyActivity: { label: string; value: number }[];
        totalBorrows: number;
        currentlyBorrowed: number;
        overdueCount: number;
        borrowingHistory: any[];
    } | null>(null);

    // Global stats
    const [mostActiveStudents, setMostActiveStudents] = useState<{ label: string; value: number }[]>([]);
    const [overviewStats, setOverviewStats] = useState({
        totalMembers: 0,
        activeMembers: 0,
        totalBorrowings: 0,
        averageBorrowings: 0
    });

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
            setCurrentPage(1);
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [inputValue]);

    // Initial load for charts only
    useEffect(() => {
        const fetchChartsData = async () => {
            try {
                const [studentActivity, totalMembersResponse] = await Promise.all([
                    api.getStudentActivity({ page: 1, per_page: 10 }),
                    api.getStudents({ page: 1, limit: 1 }) // Fetch ONLY to get total count
                ]);

                // Transform student activity to chart format
                const chartData = studentActivity.data
                    .sort((a, b) => b.total_borrowings - a.total_borrowings)
                    .slice(0, 10)
                    .map(student => ({
                        label: student.name,
                        value: student.total_borrowings
                    }));

                setMostActiveStudents(chartData);

                // Calculate overview stats
                const activeMembers = studentActivity.data.filter(s => s.total_borrowings > 0).length;
                const totalBorrowings = studentActivity.data.reduce((sum, s) => sum + s.total_borrowings, 0);

                // Note: totalMembers will be updated from meta.total in separate effect
                setOverviewStats(prev => ({
                    ...prev,
                    activeMembers,
                    totalBorrowings,
                    averageBorrowings: activeMembers > 0 ? Math.round(totalBorrowings / activeMembers * 10) / 10 : 0,
                    totalMembers: totalMembersResponse.meta.total
                }));
            } catch (error) {
                console.error('Error fetching student activity chart:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchChartsData();
    }, []);

    // Fetch students with pagination and search
    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await api.getStudents({
                    page: currentPage,
                    limit: itemsPerPage,
                    keyword: searchTerm
                });
                setStudents(response.data);
                setMeta(response.meta);
            } catch (error) {
                console.error('Error fetching students:', error);
            }
        };
        fetchStudents();
    }, [currentPage, itemsPerPage, searchTerm]);

    // Update total members count from meta


    const handleStudentClick = async (student: Student) => {
        setSelectedStudent(student);
        setDetailLoading(true);
        try {
            // Use the new student history API
            const historyResponse = await api.getStudentHistory(student.id, 1, 20);

            // Transform the history data to match the expected format
            const monthlyActivity = historyResponse.data.history.reduce((acc, transaction) => {
                const month = new Date(transaction.borrow_date).toLocaleString('default', { month: 'short' });
                const existing = acc.find(item => item.label === month);
                if (existing) {
                    existing.value += 1;
                } else {
                    acc.push({ label: month, value: 1 });
                }
                return acc;
            }, [] as { label: string; value: number }[]);

            const currentlyBorrowed = historyResponse.data.history.filter(h => h.status === 'borrowed').length;

            setStudentStats({
                monthlyActivity,
                totalBorrows: historyResponse.data.history.length,
                currentlyBorrowed,
                overdueCount: 0, // Overdue logic would need to check due_date vs current date
                borrowingHistory: historyResponse.data.history.slice(0, 10) // Store latest 10 transactions
            });
        } catch (error) {
            console.error('Error fetching student details:', error);
        } finally {
            setDetailLoading(false);
        }
    };

    const handleBack = () => {
        setSelectedStudent(null);
        setStudentStats(null);
    };

    if (loading) {
        return (
            <div className="p-6 space-y-4">
                <div className="h-8 w-64 animate-pulse rounded bg-neutral-200"></div>
                <ChartSkeleton />
            </div>
        );
    }

    if (selectedStudent) {
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
                    <h1 className="text-xl md:text-2xl font-bold text-neutral-900">{selectedStudent.name}</h1>
                    <p className="text-sm md:text-base text-neutral-600">User Number: {selectedStudent.user_number}</p>
                </div>

                {detailLoading ? (
                    <div className="flex-1 space-y-6 overflow-y-auto pr-2">
                        <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                            <StatCardSkeleton />
                            <StatCardSkeleton />
                            <StatCardSkeleton />
                        </div>
                        <ChartSkeleton />
                    </div>
                ) : studentStats && (
                    <div className="flex-1 space-y-6 overflow-y-auto pr-2">
                        {/* Statistics Grid - 2x2 */}
                        <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2">
                            {/* Total Peminjaman */}
                            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="rounded-full bg-blue-100 p-3 text-blue-600">
                                        <BarChart2 size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-neutral-600">Total Peminjaman</p>
                                        <p className="text-2xl font-bold text-neutral-900">{studentStats.totalBorrows}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Dikembalikan */}
                            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="rounded-full bg-green-100 p-3 text-green-600">
                                        <BarChart2 size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-neutral-600">Dikembalikan</p>
                                        <p className="text-2xl font-bold text-neutral-900">
                                            {studentStats.totalBorrows - studentStats.currentlyBorrowed - studentStats.overdueCount}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Sedang Dipinjam */}
                            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="rounded-full bg-orange-100 p-3 text-orange-600">
                                        <Clock size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-neutral-600">Sedang Dipinjam</p>
                                        <p className="text-2xl font-bold text-neutral-900">{studentStats.currentlyBorrowed}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Terlambat */}
                            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="rounded-full bg-red-100 p-3 text-red-600">
                                        <AlertCircle size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-neutral-600">Terlambat</p>
                                        <p className="text-2xl font-bold text-neutral-900">{studentStats.overdueCount}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Monthly Activity Chart */}
                        <ReportChart
                            title={`Aktivitas Peminjaman - ${selectedStudent.name}`}
                            data={studentStats.monthlyActivity}
                            color="bg-orange-500"
                        />

                        {/* Borrowing History */}
                        {studentStats.borrowingHistory.length > 0 && (
                            <div className="rounded-xl border border-neutral-200 bg-white shadow-sm">
                                <div className="border-b border-neutral-200 px-6 py-4">
                                    <h3 className="text-lg font-bold text-neutral-900">Riwayat Peminjaman Terbaru</h3>
                                    <p className="text-sm text-neutral-600">10 transaksi terakhir</p>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-sm">
                                        <thead className="bg-neutral-50 text-neutral-500">
                                            <tr>
                                                {/* <th className="px-6 py-4 font-medium">Buku</th> */}
                                                <th className="px-6 py-4 font-medium">Tanggal Pinjam</th>
                                                <th className="px-6 py-4 font-medium">Tanggal Kembali</th>
                                                <th className="px-6 py-4 font-medium">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-neutral-100">
                                            {studentStats.borrowingHistory.map((transaction: any) => (
                                                <tr key={transaction.transaction_id} className="hover:bg-neutral-50" onClick={() => navigate(`/dashboard/transactions/${transaction.transaction_id}`)}>
                                                    {/* <td className="px-6 py-4">
                                                        <div>
                                                            <p className="font-medium text-neutral-900">{transaction.book_title}</p>
                                                            <p className="text-xs text-neutral-600">{transaction.book_code}</p>
                                                        </div>
                                                    </td> */}
                                                    <td className="px-6 py-4 text-neutral-600">
                                                        {new Date(transaction.borrow_date).toLocaleDateString('id-ID')}
                                                    </td>
                                                    <td className="px-6 py-4 text-neutral-600">
                                                        {transaction.return_date
                                                            ? new Date(transaction.return_date).toLocaleDateString('id-ID')
                                                            : '-'
                                                        }
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${transaction.status === 'returned' ? 'bg-green-100 text-green-700' :
                                                            transaction.status === 'borrowed' ? 'bg-orange-100 text-orange-700' :
                                                                'bg-red-100 text-red-700'
                                                            }`}>
                                                            {transaction.status === 'returned' ? 'Dikembalikan' :
                                                                transaction.status === 'borrowed' ? 'Dipinjam' : 'Terlambat'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
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
            <h1 className="mb-4 md:mb-6 text-xl md:text-2xl font-bold text-neutral-900">Laporan Anggota</h1>

            <div className="flex-1 space-y-6 md:space-y-8 overflow-y-auto pr-2">
                {/* Overview Statistics Cards */}
                {loading ? (
                    <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="h-24 animate-pulse rounded-xl bg-neutral-200" />
                        <div className="h-24 animate-pulse rounded-xl bg-neutral-200" />
                        <div className="h-24 animate-pulse rounded-xl bg-neutral-200" />
                        <div className="h-24 animate-pulse rounded-xl bg-neutral-200" />
                    </div>
                ) : (
                    <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Total Anggota */}
                        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="rounded-full bg-blue-100 p-3 text-blue-600">
                                    <User size={24} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-neutral-600">Total Anggota</p>
                                    <p className="text-2xl font-bold text-neutral-900">{overviewStats.totalMembers}</p>
                                </div>
                            </div>
                        </div>

                        {/* Anggota Aktif */}
                        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="rounded-full bg-green-100 p-3 text-green-600">
                                    <User size={24} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-neutral-600">Anggota Aktif</p>
                                    <p className="text-2xl font-bold text-neutral-900">{overviewStats.activeMembers}</p>
                                </div>
                            </div>
                        </div>

                        {/* Total Peminjaman */}
                        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="rounded-full bg-purple-100 p-3 text-purple-600">
                                    <BarChart2 size={24} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-neutral-600">Total Peminjaman</p>
                                    <p className="text-2xl font-bold text-neutral-900">{overviewStats.totalBorrowings}</p>
                                </div>
                            </div>
                        </div>

                        {/* Rata-rata Peminjaman */}
                        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="rounded-full bg-orange-100 p-3 text-orange-600">
                                    <BarChart2 size={24} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-neutral-600">Rata-rata</p>
                                    <p className="text-2xl font-bold text-neutral-900">{overviewStats.averageBorrowings}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Most Active Members Chart - Enhanced */}
                <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
                    <div className="rounded-xl border border-neutral-200 bg-white shadow-sm">
                        <div className="border-b border-neutral-200 px-6 py-4">
                            <h3 className="text-lg font-bold text-neutral-900">Anggota Paling Aktif</h3>
                            <p className="text-sm text-neutral-600">Berdasarkan jumlah peminjaman</p>
                        </div>
                        <div className="p-6">
                            {loading ? (
                                <div className="space-y-4">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="h-12 animate-pulse rounded-lg bg-neutral-200" />
                                    ))}
                                </div>
                            ) : mostActiveStudents.length > 0 ? (
                                <div className="space-y-4">
                                    {mostActiveStudents.map((student, index) => {
                                        const maxValue = Math.max(...mostActiveStudents.map(s => s.value), 1);
                                        const percentage = (student.value / maxValue) * 100;

                                        return (
                                            <div key={index} className="flex items-center gap-3">
                                                {/* Ranking Badge */}
                                                <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${index === 0 ? 'bg-yellow-100 text-yellow-700' :
                                                    index === 1 ? 'bg-gray-100 text-gray-700' :
                                                        index === 2 ? 'bg-orange-100 text-orange-700' :
                                                            'bg-neutral-100 text-neutral-600'
                                                    }`}>
                                                    {index + 1}
                                                </div>

                                                {/* Name and Progress */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="mb-1 flex items-baseline justify-between gap-2">
                                                        <span className="truncate font-medium text-neutral-900">{student.label}</span>
                                                        <span className="flex-shrink-0 text-sm font-semibold text-neutral-700">{student.value}</span>
                                                    </div>
                                                    <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
                                                        <div
                                                            className={`h-full rounded-full transition-all ${index === 0 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                                                                index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                                                                    index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-600' :
                                                                        'bg-gradient-to-r from-blue-400 to-blue-600'
                                                                }`}
                                                            style={{ width: `${percentage}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <p className="text-center text-neutral-500 py-8">Tidak ada data</p>
                            )}
                        </div>
                    </div>

                    {/* Discipline Status Card */}
                    <div className="rounded-xl border border-neutral-200 bg-white shadow-sm">
                        <div className="border-b border-neutral-200 px-6 py-4">
                            <h3 className="text-lg font-bold text-neutral-900">Status Keaktifan Siswa</h3>
                            <p className="text-sm text-neutral-600">Tingkat minat siswa dalam meminjam buku</p>
                        </div>
                        <div className="p-6">
                            {loading ? (
                                <div className="space-y-4">
                                    <div className="h-32 animate-pulse rounded-lg bg-neutral-200" />
                                    <div className="h-20 animate-pulse rounded-lg bg-neutral-200" />
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Circular Progress */}
                                    <div className="flex items-center justify-center">
                                        <div className="relative h-40 w-40">
                                            {/* Background Circle */}
                                            <svg className="h-full w-full -rotate-90 transform">
                                                <circle
                                                    cx="80"
                                                    cy="80"
                                                    r="70"
                                                    stroke="currentColor"
                                                    strokeWidth="12"
                                                    fill="none"
                                                    className="text-neutral-200"
                                                />
                                                {/* Progress Circle */}
                                                <circle
                                                    cx="80"
                                                    cy="80"
                                                    r="70"
                                                    stroke="currentColor"
                                                    strokeWidth="12"
                                                    fill="none"
                                                    strokeDasharray={`${2 * Math.PI * 70}`}
                                                    strokeDashoffset={`${2 * Math.PI * 70 * (1 - (overviewStats.activeMembers > 0 ? (overviewStats.activeMembers / overviewStats.totalMembers) : 0))}`}
                                                    className="text-green-500 transition-all duration-1000"
                                                    strokeLinecap="round"
                                                />
                                            </svg>
                                            {/* Center Text */}
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className="text-3xl font-bold text-neutral-900">
                                                    {overviewStats.totalMembers > 0
                                                        ? Math.round((overviewStats.activeMembers / overviewStats.totalMembers) * 100)
                                                        : 0}%
                                                </span>
                                                <span className="text-xs text-neutral-600">Anggota Aktif</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Statistics */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between rounded-lg bg-green-50 p-3">
                                            <div className="flex items-center gap-2">
                                                <div className="h-3 w-3 rounded-full bg-green-500" />
                                                <span className="text-sm font-medium text-neutral-700">Anggota Aktif</span>
                                            </div>
                                            <span className="text-sm font-bold text-green-700">{overviewStats.activeMembers}</span>
                                        </div>
                                        <div className="flex items-center justify-between rounded-lg bg-neutral-50 p-3">
                                            <div className="flex items-center gap-2">
                                                <div className="h-3 w-3 rounded-full bg-neutral-400" />
                                                <span className="text-sm font-medium text-neutral-700">Tidak Aktif</span>
                                            </div>
                                            <span className="text-sm font-bold text-neutral-700">
                                                {overviewStats.totalMembers - overviewStats.activeMembers}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div>
                    <h2 className="mb-4 text-lg font-bold text-neutral-900">Detail per Anggota</h2>

                    {/* Search Bar */}
                    <div className="mb-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
                            <input
                                type="text"
                                placeholder="Cari anggota berdasarkan nama atau nomor induk..."
                                className="w-full rounded-lg border border-neutral-200 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Members Table */}
                    <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-neutral-50 text-neutral-500">
                                    <tr>
                                        <th className="px-6 py-4 font-medium">Nama</th>
                                        <th className="px-6 py-4 font-medium">Nomor Induk</th>
                                        <th className="px-6 py-4 font-medium text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100">
                                    {students.length === 0 ? (
                                        <TableEmpty
                                            colSpan={3}
                                            message="Tidak ada anggota ditemukan"
                                            description="Coba cari dengan kata kunci yang berbeda."
                                        />
                                    ) : (
                                        students.map((student) => (
                                            <tr
                                                key={student.id}
                                                className="cursor-pointer hover:bg-neutral-50"
                                                onClick={() => handleStudentClick(student)}
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="rounded-full bg-neutral-100 p-2 text-neutral-600">
                                                            <User size={16} />
                                                        </div>
                                                        <span className="font-medium text-neutral-900">{student.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-neutral-600">{student.user_number}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleStudentClick(student);
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
                            currentPage={meta.current_page}
                            totalPages={meta.last_page}
                            totalItems={meta.total}
                            itemsPerPage={meta.per_page}
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

export default MemberReport;
