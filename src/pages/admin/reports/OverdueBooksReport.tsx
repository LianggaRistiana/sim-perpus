import React, { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import type { OverdueBook } from '../../../types';
import { Pagination } from '../../../components/Pagination';
import { TableLoading, TableEmpty } from '../../../components/TableState';
import { AlertTriangle, Clock } from 'lucide-react';

const OverdueBooksReport: React.FC = () => {
    const [overdueBooks, setOverdueBooks] = useState<OverdueBook[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(15);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        const fetchOverdueBooks = async () => {
            setLoading(true);
            try {
                const response = await api.getOverdueBooks(currentPage, perPage);
                // response is OverdueBooksResponse = { success, message, data: OverdueBook[], pagination }
                setOverdueBooks(response.data);
                if (response.pagination) {
                    setTotalItems(response.pagination.total);
                    setTotalPages(response.pagination.last_page);
                }
            } catch (error) {
                console.error('Error fetching overdue books:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchOverdueBooks();
    }, [currentPage, perPage]);

    const getSeverityColor = (daysOverdue: number) => {
        if (daysOverdue > 14) return 'bg-red-100 text-red-700 border-red-200';
        if (daysOverdue > 7) return 'bg-orange-100 text-orange-700 border-orange-200';
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    };

    if (loading && overdueBooks.length === 0) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="flex h-screen flex-col overflow-hidden p-6">
            <div className="mb-6 flex items-center gap-3">
                <AlertTriangle className="text-red-500" size={28} />
                <h1 className="text-2xl font-bold text-neutral-900">Laporan Buku Terlambat</h1>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto pr-2">
                {/* Stats Overview */}
                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="rounded-full bg-red-100 p-3 text-red-600">
                                <AlertTriangle size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-neutral-600">Total Terlambat</p>
                                <p className="text-2xl font-bold text-neutral-900">{totalItems}</p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="rounded-full bg-orange-100 p-3 text-orange-600">
                                <Clock size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-neutral-600">\u003e7 Hari</p>
                                <p className="text-2xl font-bold text-neutral-900">
                                    {overdueBooks.filter((b) => b.days_overdue > 7).length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="rounded-full bg-red-100 p-3 text-red-600">
                                <AlertTriangle size={24} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-neutral-600">\u003e14 Hari</p>
                                <p className="text-2xl font-bold text-neutral-900">
                                    {overdueBooks.filter((b) => b.days_overdue > 14).length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Overdue Books Table */}
                <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
                    <div className="border-b border-neutral-200 px-6 py-4">
                        <h2 className="text-lg font-bold text-neutral-900">Daftar Buku Terlambat</h2>
                    </div>

                    <table className="w-full text-left text-sm">
                        <thead className="bg-neutral-50 text-neutral-500">
                            <tr>
                                <th className="px-6 py-4 font-medium">Peminjam</th>
                                <th className="px-6 py-4 font-medium">Buku</th>
                                <th className="px-6 py-4 font-medium">Tanggal Pinjam</th>
                                <th className="px-6 py-4 font-medium">Jatuh Tempo</th>
                                <th className="px-6 py-4 font-medium text-center">Terlambat</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {loading ? (
                                <TableLoading colSpan={5} />
                            ) : overdueBooks.length === 0 ? (
                                <TableEmpty
                                    colSpan={5}
                                    message="Tidak ada buku terlambat"
                                    description="Semua peminjaman dikembalikan tepat waktu. Hebat!"
                                />
                            ) : (
                                overdueBooks.map((item) => (
                                    <tr key={item.transaction_id} className="hover:bg-neutral-50">
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-medium text-neutral-900">{item.borrower.name}</div>
                                                <div className="text-xs text-neutral-500">{item.borrower.number}</div>
                                                <div className="text-xs text-neutral-500">{item.borrower.email}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                {item.books.map((book, idx) => (
                                                    <div key={idx}>
                                                        <div className="font-medium text-neutral-900">{book.title}</div>
                                                        <div className="text-xs text-neutral-500">
                                                            {book.code} • ISBN: {book.isbn}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-neutral-600">
                                            {new Date(item.borrow_date).toLocaleDateString('id-ID', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </td>
                                        <td className="px-6 py-4 text-neutral-600">
                                            {new Date(item.due_date).toLocaleDateString('id-ID', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center">
                                                <span
                                                    className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-bold ${getSeverityColor(
                                                        item.days_overdue
                                                    )}`}
                                                >
                                                    <AlertTriangle size={14} />
                                                    {item.days_overdue} hari
                                                </span>
                                            </div>
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

export default OverdueBooksReport;
