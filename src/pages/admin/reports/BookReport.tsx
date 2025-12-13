import React, { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import type { BookItem, BookMaster } from '../../../types';
import ReportChart from '../../../components/ReportChart';
import { AlertTriangle, ArrowLeft, BookOpen, BarChart2, Copy, Clock } from 'lucide-react';

const BookReport: React.FC = () => {
    const [books, setBooks] = useState<BookMaster[]>([]);
    const [selectedBook, setSelectedBook] = useState<BookMaster | null>(null);
    const [bookStats, setBookStats] = useState<{
        monthlyBorrows: { label: string; value: number }[];
        totalCopies: number;
        currentlyBorrowed: number;
        totalLifetimeBorrows: number;
        items: {
            id: string;
            code: string;
            condition: string;
            status: string;
            history: {
                id: string;
                studentName: string;
                borrowDate: Date;
                returnDate?: Date;
                status: 'Borrowed' | 'Returned' | 'Overdue';
                returnCondition?: string;
            }[];
        }[];
    } | null>(null);

    // Global stats
    const [mostBorrowedBooks, setMostBorrowedBooks] = useState<{ label: string; value: number }[]>([]);
    const [longestBorrowedBooks, setLongestBorrowedBooks] = useState<{ label: string; value: number }[]>([]);
    const [damagedBooks, setDamagedBooks] = useState<BookItem[]>([]);

    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<string>('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [allBooks, mostBorrowed, longestBorrowed, damaged] = await Promise.all([
                    api.getBooks(),
                    api.getMostBorrowedBooks(),
                    api.getLongestBorrowedBooks(),
                    api.getDamagedBooks()
                ]);

                setBooks(allBooks.data);
                setMostBorrowedBooks(mostBorrowed.map(i => ({ label: i.title, value: i.count })));
                setLongestBorrowedBooks(longestBorrowed.map(i => ({ label: i.title, value: i.days })));
                setDamagedBooks(damaged);
            } catch (error) {
                console.error('Error fetching book report data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleBookClick = async (book: BookMaster) => {
        setSelectedBook(book);
        setDetailLoading(true);
        try {
            const stats = await api.getBookReportDetails(book.id);
            setBookStats({
                monthlyBorrows: stats.monthlyBorrows.map(i => ({ label: i.month, value: i.count })),
                totalCopies: stats.totalCopies,
                currentlyBorrowed: stats.currentlyBorrowed,
                totalLifetimeBorrows: stats.totalLifetimeBorrows,
                items: stats.items
            });
            if (stats.items.length > 0) {
                setActiveTab(stats.items[0].id);
            }
        } catch (error) {
            console.error('Error fetching book details:', error);
        } finally {
            setDetailLoading(false);
        }
    };

    const handleBack = () => {
        setSelectedBook(null);
        setBookStats(null);
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            </div>
        );
    }

    if (selectedBook) {
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
                    <h1 className="text-2xl font-bold text-neutral-900">{selectedBook.title}</h1>
                    <p className="text-neutral-600">{selectedBook.author} - {selectedBook.publisher} ({selectedBook.year})</p>
                </div>

                {detailLoading ? (
                    <div className="flex h-64 items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                    </div>
                ) : bookStats && (
                    <div className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-3">
                            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="rounded-full bg-blue-100 p-3 text-blue-600">
                                        <Copy size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-neutral-600">Total Eksemplar</p>
                                        <p className="text-2xl font-bold text-neutral-900">{bookStats.totalCopies}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="rounded-full bg-orange-100 p-3 text-orange-600">
                                        <BookOpen size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-neutral-600">Sedang Dipinjam</p>
                                        <p className="text-2xl font-bold text-neutral-900">{bookStats.currentlyBorrowed}</p>
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
                                        <p className="text-2xl font-bold text-neutral-900">{bookStats.totalLifetimeBorrows}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <ReportChart
                            title={`Riwayat Peminjaman - ${selectedBook.title}`}
                            data={bookStats.monthlyBorrows}
                            color="bg-blue-500"
                        />

                        {/* Transaction History per Item */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-bold text-neutral-900">Riwayat Transaksi per Eksemplar</h3>

                            {bookStats.items.length > 0 ? (
                                <div className="rounded-xl border border-neutral-200 bg-white shadow-sm">
                                    {/* Tabs */}
                                    <div className="border-b border-neutral-200 px-6 pt-4">
                                        <div className="flex gap-4 overflow-x-auto pb-px">
                                            {bookStats.items.map((item) => (
                                                <button
                                                    key={item.id}
                                                    onClick={() => setActiveTab(item.id)}
                                                    className={`whitespace-nowrap border-b-2 px-4 py-2 text-sm font-medium transition-colors ${activeTab === item.id
                                                            ? 'border-blue-600 text-blue-600'
                                                            : 'border-transparent text-neutral-500 hover:text-neutral-700'
                                                        }`}
                                                >
                                                    {item.code}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6">
                                        {bookStats.items.map((item) => {
                                            if (item.id !== activeTab) return null;
                                            return (
                                                <div key={item.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                                    <div className="mb-6 flex items-center justify-between rounded-lg bg-neutral-50 p-4">
                                                        <div>
                                                            <h4 className="font-bold text-neutral-900">Detail Eksemplar</h4>
                                                            <p className="text-sm text-neutral-600">Kode: {item.code}</p>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <span className="inline-flex items-center rounded-full bg-white px-2.5 py-0.5 text-xs font-medium text-neutral-700 shadow-sm border border-neutral-200">
                                                                Kondisi: {item.condition}
                                                            </span>
                                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${item.status === 'Available' ? 'bg-green-100 text-green-700' :
                                                                    item.status === 'Borrowed' ? 'bg-orange-100 text-orange-700' :
                                                                        'bg-red-100 text-red-700'
                                                                }`}>
                                                                {item.status}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {item.history.length === 0 ? (
                                                        <div className="flex flex-col items-center justify-center py-8 text-center">
                                                            <div className="mb-2 rounded-full bg-neutral-100 p-3 text-neutral-400">
                                                                <Clock size={24} />
                                                            </div>
                                                            <p className="text-neutral-500">Belum ada riwayat peminjaman untuk eksemplar ini.</p>
                                                        </div>
                                                    ) : (
                                                        <div className="overflow-x-auto rounded-lg border border-neutral-200">
                                                            <table className="w-full text-left text-sm">
                                                                <thead className="bg-neutral-50 text-neutral-500">
                                                                    <tr>
                                                                        <th className="px-4 py-3 font-medium">Peminjam</th>
                                                                        <th className="px-4 py-3 font-medium">Tanggal Pinjam</th>
                                                                        <th className="px-4 py-3 font-medium">Tanggal Kembali</th>
                                                                        <th className="px-4 py-3 font-medium">Status</th>
                                                                        <th className="px-4 py-3 font-medium">Kondisi Kembali</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-neutral-200">
                                                                    {item.history.map((tx) => (
                                                                        <tr key={tx.id} className="hover:bg-neutral-50">
                                                                            <td className="px-4 py-3 font-medium text-neutral-900">{tx.studentName}</td>
                                                                            <td className="px-4 py-3 text-neutral-600">
                                                                                {new Date(tx.borrowDate).toLocaleDateString('id-ID')}
                                                                            </td>
                                                                            <td className="px-4 py-3 text-neutral-600">
                                                                                {tx.returnDate ? new Date(tx.returnDate).toLocaleDateString('id-ID') : '-'}
                                                                            </td>
                                                                            <td className="px-4 py-3">
                                                                                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${tx.status === 'Returned' ? 'bg-green-100 text-green-700' :
                                                                                        tx.status === 'Borrowed' ? 'bg-blue-100 text-blue-700' :
                                                                                            'bg-red-100 text-red-700'
                                                                                    }`}>
                                                                                    {tx.status === 'Returned' ? 'Dikembalikan' :
                                                                                        tx.status === 'Borrowed' ? 'Dipinjam' : 'Terlambat'}
                                                                                </span>
                                                                            </td>
                                                                            <td className="px-4 py-3 text-neutral-600">
                                                                                {tx.returnCondition || '-'}
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-neutral-500">Tidak ada data eksemplar.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="p-6">
            <h1 className="mb-8 text-2xl font-bold text-neutral-900">Laporan Buku</h1>

            {/* Global Stats */}
            <div className="mb-10 grid gap-6 md:grid-cols-2">
                <ReportChart
                    title="Buku Paling Sering Dipinjam"
                    data={mostBorrowedBooks}
                    color="bg-blue-500"
                />
                <ReportChart
                    title="Buku Paling Lama Dipinjam (Hari)"
                    data={longestBorrowedBooks}
                    color="bg-indigo-500"
                />
            </div>

            <h2 className="mb-4 text-lg font-bold text-neutral-900">Detail per Buku</h2>
            <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {books.map((book) => (
                    <button
                        key={book.id}
                        onClick={() => handleBookClick(book)}
                        className="flex flex-col items-start rounded-xl border border-neutral-200 bg-white p-6 text-left shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
                    >
                        <h3 className="mb-1 font-bold text-neutral-900 line-clamp-1">{book.title}</h3>
                        <p className="text-sm text-neutral-600">{book.author}</p>
                        <div className="mt-4 flex items-center text-xs font-medium text-blue-600">
                            Lihat Statistik <BarChart2 size={14} className="ml-1" />
                        </div>
                    </button>
                ))}
            </div>

            {/* Damaged Books Section */}
            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center gap-2">
                    <AlertTriangle className="text-red-500" size={24} />
                    <h3 className="text-lg font-bold text-neutral-900">Daftar Buku Rusak</h3>
                </div>

                {damagedBooks.length === 0 ? (
                    <p className="text-neutral-500">Tidak ada buku yang rusak.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-neutral-50 text-neutral-500">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Kode Buku</th>
                                    <th className="px-4 py-3 font-medium">Kondisi</th>
                                    <th className="px-4 py-3 font-medium">Status</th>
                                    <th className="px-4 py-3 font-medium">Tanggal Masuk</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200">
                                {damagedBooks.map((book) => (
                                    <tr key={book.id}>
                                        <td className="px-4 py-3 font-medium text-neutral-900">{book.code}</td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                                                {book.condition}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-neutral-600">{book.status}</td>
                                        <td className="px-4 py-3 text-neutral-600">
                                            {new Date(book.createdAt).toLocaleDateString('id-ID')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookReport;
