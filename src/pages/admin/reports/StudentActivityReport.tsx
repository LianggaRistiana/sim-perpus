import React, { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import type { StudentActivity } from '../../../types';
import { Pagination } from '../../../components/Pagination';
import { TableLoading, TableEmpty } from '../../../components/TableState';
import { Users, CheckCircle, BookOpen } from 'lucide-react';

const StudentActivityReport: React.FC = () => {
    const [students, setStudents] = useState<StudentActivity[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(15);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const fetchStudentActivity = async () => {
            setLoading(true);
            try {
                const response = await api.getStudentActivity({ page: currentPage, per_page: perPage });
                // response is StudentActivityResponse = { success, message, data: StudentActivity[], pagination }
                setStudents(response.data);
                if (response.pagination) {
                    setTotalItems(response.pagination.total);
                    setTotalPages(response.pagination.last_page);
                }
            } catch (error) {
                console.error('Error fetching student activity:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStudentActivity();
    }, [currentPage, perPage]);

    if (loading && students.length === 0) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="flex h-screen flex-col overflow-hidden p-6">
            <h1 className="mb-6 text-2xl font-bold text-neutral-900">Laporan Aktivitas Siswa</h1>

            <div className="flex-1 space-y-6 overflow-y-auto pr-2">
                {/* Stats Overview */}
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="rounded-full bg-blue-100 p-3 text-blue-600">
                                <Users size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-neutral-600">Total Siswa Aktif</p>
                                <p className="text-2xl font-bold text-neutral-900">{totalItems}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="rounded-full bg-orange-100 p-3 text-orange-600">
                                <BookOpen size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-neutral-600">Total Peminjaman</p>
                                <p className="text-2xl font-bold text-neutral-900">
                                    {students.reduce((sum, s) => sum + s.total_borrowings, 0)}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="rounded-full bg-green-100 p-3 text-green-600">
                                <CheckCircle size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-neutral-600">Total Dikembalikan</p>
                                <p className="text-2xl font-bold text-neutral-900">
                                    {students.reduce((sum, s) => sum + s.returned_count, 0)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Students Table */}
                <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
                    <div className="border-b border-neutral-200 px-6 py-4">
                        <h2 className="text-lg font-bold text-neutral-900">Daftar Aktivitas Siswa</h2>
                    </div>

                    <table className="w-full text-left text-sm">
                        <thead className="bg-neutral-50 text-neutral-500">
                            <tr>
                                <th className="px-6 py-4 font-medium">Nama Siswa</th>
                                <th className="px-6 py-4 font-medium">NIM/NIS</th>
                                <th className="px-6 py-4 font-medium text-center">Total Peminjaman</th>
                                <th className="px-6 py-4 font-medium text-center">Sedang Dipinjam</th>
                                <th className="px-6 py-4 font-medium text-center">Telah Dikembalikan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {loading ? (
                                <TableLoading colSpan={5} />
                            ) : students.length === 0 ? (
                                <TableEmpty
                                    colSpan={5}
                                    message="Tidak ada data aktivitas"
                                    description="Belum ada siswa yang melakukan peminjaman."
                                />
                            ) : (
                                students.map((student) => (
                                    <tr key={student.id} className="hover:bg-neutral-50">
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-medium text-neutral-900">{student.name}</div>
                                                <div className="text-xs text-neutral-500">{student.email}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-neutral-700">
                                            {student.user_number}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                                                {student.total_borrowings}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${student.active_borrowings > 0
                                                ? 'bg-orange-100 text-orange-700'
                                                : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {student.active_borrowings}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                                                {student.returned_count}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalItems > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        itemsPerPage={perPage}
                        onPageChange={setCurrentPage}
                        onItemsPerPageChange={(limit) => {
                            setPerPage(limit);
                            setCurrentPage(1);
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default StudentActivityReport;
