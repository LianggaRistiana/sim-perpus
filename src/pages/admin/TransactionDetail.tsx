import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, User, Calendar, Clock, CheckCircle, AlertCircle, BookOpen } from 'lucide-react';
import { api } from '../../services/api';
import type { BorrowTransaction, ReturnTransaction, Student } from '../../types';

const TransactionDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [transaction, setTransaction] = useState<(BorrowTransaction & { items: { id: string; code: string; title: string; author: string; condition: string; returnCondition?: string }[] }) | null>(null);
    const [returnTransaction, setReturnTransaction] = useState<ReturnTransaction | null>(null);
    const [student, setStudent] = useState<Student | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            try {
                const transData = await api.getBorrowTransactionById(id);
                if (transData) {
                    setTransaction(transData);
                    const [studentData, returnData] = await Promise.all([
                        api.getStudentById(transData.studentId),
                        api.getReturnTransactionByBorrowId(id)
                    ]);
                    setStudent(studentData || null);
                    setReturnTransaction(returnData || null);
                } else {
                    // Handle not found
                    console.error('Transaction not found');
                }
            } catch (error) {
                console.error('Error fetching transaction details:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            </div>
        );
    }

    if (!transaction) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4">
                <h1 className="text-2xl font-bold text-neutral-900">Transaksi tidak ditemukan</h1>
                <Link to="/dashboard/transactions" className="text-blue-600 hover:underline">
                    Kembali ke Daftar Transaksi
                </Link>
            </div>
        );
    }

    const isOverdue = new Date() > new Date(transaction.dueDate) && transaction.status === 'Borrowed';

    return (
        <div className="min-h-screen bg-neutral-50 p-8">
            <div className="mb-8">
                <Link to="/dashboard/transactions" className="mb-4 inline-flex items-center text-sm font-medium text-neutral-600 hover:text-blue-600">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Kembali ke Daftar Transaksi
                </Link>
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-neutral-900">Detail Transaksi #{transaction.id}</h1>
                    {transaction.status === 'Borrowed' && (
                        <Link
                            to={`/dashboard/transactions/${transaction.id}/return`}
                            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                            Proses Pengembalian
                        </Link>
                    )}
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Borrowing Data Card */}
                <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                    <div className="mb-6 flex items-center gap-3 border-b border-neutral-100 pb-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                            <BookOpen size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-neutral-900">Data Peminjaman</h2>
                            <p className="text-sm text-neutral-500">Informasi detail peminjaman</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <User className="mt-0.5 h-5 w-5 text-neutral-400" />
                            <div>
                                <p className="text-sm font-medium text-neutral-500">Peminjam</p>
                                <p className="font-medium text-neutral-900">{student?.name || 'Unknown'}</p>
                                <p className="text-xs text-neutral-500">NIS: {student?.nis || '-'}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Calendar className="mt-0.5 h-5 w-5 text-neutral-400" />
                            <div>
                                <p className="text-sm font-medium text-neutral-500">Tanggal Pinjam</p>
                                <p className="text-neutral-900">
                                    {new Date(transaction.borrowedAt).toLocaleDateString('id-ID', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Clock className="mt-0.5 h-5 w-5 text-neutral-400" />
                            <div>
                                <p className="text-sm font-medium text-neutral-500">Jatuh Tempo</p>
                                <p className={`font-medium ${isOverdue ? 'text-red-600' : 'text-neutral-900'}`}>
                                    {new Date(transaction.dueDate).toLocaleDateString('id-ID', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                                {isOverdue && (
                                    <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-red-600">
                                        <AlertCircle size={12} /> Terlambat
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="mt-0.5">
                                {transaction.status === 'Returned' ? (
                                    <CheckCircle className="h-5 w-5 text-green-500" />
                                ) : (
                                    <Clock className="h-5 w-5 text-blue-500" />
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-neutral-500">Status</p>
                                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${transaction.status === 'Returned'
                                    ? 'bg-green-50 text-green-700'
                                    : isOverdue
                                        ? 'bg-red-50 text-red-700'
                                        : 'bg-blue-50 text-blue-700'
                                    }`}>
                                    {transaction.status === 'Returned' ? 'Dikembalikan' : isOverdue ? 'Terlambat' : 'Dipinjam'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Return Data Card */}
                {returnTransaction ? (
                    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                        <div className="mb-6 flex items-center gap-3 border-b border-neutral-100 pb-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
                                <CheckCircle size={20} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-neutral-900">Data Pengembalian</h2>
                                <p className="text-sm text-neutral-500">Informasi pengembalian buku</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <Calendar className="mt-0.5 h-5 w-5 text-neutral-400" />
                                <div>
                                    <p className="text-sm font-medium text-neutral-500">Tanggal Kembali</p>
                                    <p className="text-neutral-900">
                                        {new Date(returnTransaction.returnedAt).toLocaleDateString('id-ID', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <User className="mt-0.5 h-5 w-5 text-neutral-400" />
                                <div>
                                    <p className="text-sm font-medium text-neutral-500">Admin Penerima</p>
                                    <p className="text-neutral-900">Admin #{returnTransaction.adminId}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-6 text-center">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-200 text-neutral-400">
                            <Clock size={24} />
                        </div>
                        <h3 className="text-lg font-medium text-neutral-900">Belum Dikembalikan</h3>
                        <p className="mt-1 text-sm text-neutral-500">Buku ini masih dalam status peminjaman.</p>
                    </div>
                )}
            </div>

            {/* Borrowed Books List */}
            <div className="mt-6 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center gap-3 border-b border-neutral-100 pb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                        <BookOpen size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-neutral-900">Buku yang Dipinjam</h2>
                        <p className="text-sm text-neutral-500">Daftar buku dalam transaksi ini</p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-neutral-50 text-neutral-500">
                            <tr>
                                <th className="px-4 py-3 font-medium">Kode Buku</th>
                                <th className="px-4 py-3 font-medium">Judul</th>
                                <th className="px-4 py-3 font-medium">Penulis</th>
                                <th className="px-4 py-3 font-medium">Kondisi Awal</th>
                                <th className="px-4 py-3 font-medium">Kondisi Kembali</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200">
                            {transaction.items.map((item) => (
                                <tr key={item.id}>
                                    <td className="px-4 py-3 font-mono text-neutral-600">{item.code}</td>
                                    <td className="px-4 py-3 font-medium text-neutral-900">{item.title}</td>
                                    <td className="px-4 py-3 text-neutral-600">{item.author}</td>
                                    <td className="px-4 py-3">
                                        <span className="inline-flex rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700">
                                            {item.condition}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        {item.returnCondition ? (
                                            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${item.returnCondition === 'Good' ? 'bg-green-100 text-green-700' :
                                                item.returnCondition === 'New' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                {item.returnCondition}
                                            </span>
                                        ) : (
                                            <span className="text-neutral-400">-</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TransactionDetail;
