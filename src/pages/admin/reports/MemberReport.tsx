import React, { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import type { Student, PaginatedResponse } from '../../../types';
import ReportChart from '../../../components/ReportChart';
import { ArrowLeft, User, BarChart2, Clock, AlertCircle, Search } from 'lucide-react';
import { StatCardSkeleton, ChartSkeleton } from '../../../components/SkeletonLoading';
import { TableEmpty } from '../../../components/TableState';
import { Pagination } from '../../../components/Pagination';

const MemberReport: React.FC = () => {
    const [students, setStudents] = useState<Student[]>([]);
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
    } | null>(null);

    // Global stats
    const [mostActiveStudents, setMostActiveStudents] = useState<{ label: string; value: number }[]>([]);

    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);

    // Search and pagination states
    const [inputValue, setInputValue] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
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
                const studentActivity = await api.getStudentActivity({ page: 1, per_page: 10 });

                // Transform student activity to chart format
                setMostActiveStudents(studentActivity.data
                    .sort((a, b) => b.total_borrowings - a.total_borrowings)
                    .slice(0, 10)
                    .map(student => ({
                        label: student.name,
                        value: student.total_borrowings
                    }))
                );
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
                overdueCount: 0 // Overdue logic would need to check due_date vs current date
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
                        <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
                            <div className="rounded-xl border border-neutral-200 bg-white p-4 md:p-6 shadow-sm">
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

                        <ReportChart
                            title={`Aktivitas Peminjaman - ${selectedStudent.name}`}
                            data={studentStats.monthlyActivity}
                            color="bg-orange-500"
                        />
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="flex h-screen flex-col overflow-hidden p-4 md:p-6">
            <h1 className="mb-4 md:mb-6 text-xl md:text-2xl font-bold text-neutral-900">Laporan Anggota</h1>

            <div className="flex-1 space-y-6 md:space-y-8 overflow-y-auto pr-2">
                {/* Global Stats */}
                <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
                    <ReportChart
                        title="Anggota Paling Aktif (Jumlah Peminjaman)"
                        data={mostActiveStudents}
                        color="bg-orange-500"
                    />
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
