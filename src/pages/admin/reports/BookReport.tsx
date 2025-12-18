import React, { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import type { BookItem, BookMaster, PaginatedResponse } from '../../../types';
import ReportChart from '../../../components/ReportChart';
import { Pagination } from '../../../components/Pagination';
import { TableLoading, TableEmpty } from '../../../components/TableState';
import { StatCardSkeleton, ChartSkeleton } from '../../../components/SkeletonLoading';
import { AlertTriangle, ArrowLeft, BookOpen, BarChart2, Copy, Clock, Search } from 'lucide-react';

const BookReport: React.FC = () => {
    const [books, setBooks] = useState<BookMaster[]>([]);
    const [meta, setMeta] = useState<PaginatedResponse<BookMaster>['meta']>({
        page: 1,
        per_page: 10,
        total: 0,
        last_page: 1,
        timestamp: ''
    });
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
    const [damagedBooksPage, setDamagedBooksPage] = useState(1);
    const [damagedBooksPerPage, setDamagedBooksPerPage] = useState(10);
    const [damagedBooksMeta, setDamagedBooksMeta] = useState<PaginatedResponse<BookItem>['meta']>({
        page: 1,
        per_page: 10,
        total: 0,
        last_page: 1,
        timestamp: ''
    });

    // Lost books states
    const [lostBooks, setLostBooks] = useState<BookItem[]>([]);
    const [lostBooksPage, setLostBooksPage] = useState(1);
    const [lostBooksPerPage, setLostBooksPerPage] = useState(10);
    const [lostBooksMeta, setLostBooksMeta] = useState<PaginatedResponse<BookItem>['meta']>({
        page: 1,
        per_page: 10,
        total: 0,
        last_page: 1,
        timestamp: ''
    });

    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [damagedBooksLoading, setDamagedBooksLoading] = useState(false);
    const [lostBooksLoading, setLostBooksLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<string>('');

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
                const popularBooksRes = await api.getPopularBooks(10);
                const longestBorrowed = await api.getLongestBorrowedBooks();

                setMostBorrowedBooks(popularBooksRes.data.map((book) => ({ label: book.title, value: book.total_borrowed })));
                setLongestBorrowedBooks(longestBorrowed.map((i: any) => ({ label: i.title, value: i.days })));
            } catch (error) {
                console.error('Error fetching book chart data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchChartsData();
    }, []);

    // Fetch books with pagination and search
    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const response = await api.getBooks({
                    page: currentPage,
                    limit: itemsPerPage,
                    keyword: searchTerm
                });
                setBooks(response.data);
                setMeta(response.meta);
            } catch (error) {
                console.error('Error fetching books:', error);
            }
        };
        fetchBooks();
    }, [currentPage, itemsPerPage, searchTerm]);

    // Fetch damaged books with server-side pagination
    // Damaged books are filtered by CONDITION (poor), not status
    useEffect(() => {
        const fetchDamagedBooks = async () => {
            setDamagedBooksLoading(true);
            try {
                const response = await api.getBookItemsPaginated({
                    page: damagedBooksPage,
                    limit: damagedBooksPerPage,
                    condition: 'poor' // Filter by poor condition
                });
                setDamagedBooks(response.data);
                setDamagedBooksMeta(response.meta);
            } catch (error) {
                console.error('Error fetching damaged books:', error);
            } finally {
                setDamagedBooksLoading(false);
            }
        };
        fetchDamagedBooks();
    }, [damagedBooksPage, damagedBooksPerPage]);

    // Fetch lost books with server-side pagination
    // Lost books are filtered by STATUS (lost), not condition
    useEffect(() => {
        const fetchLostBooks = async () => {
            setLostBooksLoading(true);
            try {
                const response = await api.getBookItemsPaginated({
                    page: lostBooksPage,
                    limit: lostBooksPerPage,
                    status: 'lost' // Filter by lost status
                });
                setLostBooks(response.data);
                setLostBooksMeta(response.meta);
            } catch (error) {
                console.error('Error fetching lost books:', error);
            } finally {
                setLostBooksLoading(false);
            }
        };
        fetchLostBooks();
    }, [lostBooksPage, lostBooksPerPage]);

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

    const getConditionBadgeClass = (condition: string) => {
        switch (condition.toLowerCase()) {
            case 'good':
                return 'bg-green-50 text-green-700';
            case 'fair':
                return 'bg-yellow-50 text-yellow-700';
            case 'poor':
                return 'bg-orange-50 text-orange-700';
            case 'damaged':
                return 'bg-red-50 text-red-700';
            default:
                return 'bg-gray-50 text-gray-700';
        }
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

    if (selectedBook) {
        return (
            <div className="flex h-screen flex-col overflow-hidden p-6">
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
                    <div className="flex-1 space-y-6 overflow-y-auto pr-2">
                        <div className="grid gap-6 md:grid-cols-3">
                            <StatCardSkeleton />
                            <StatCardSkeleton />
                            <StatCardSkeleton />
                        </div>
                        <ChartSkeleton />
                    </div>
                ) : bookStats && (
                    <div className="flex-1 space-y-6 overflow-y-auto pr-2">
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
        <div className="flex h-screen flex-col overflow-hidden p-6">
            <h1 className="mb-6 text-2xl font-bold text-neutral-900">Laporan Buku</h1>

            <div className="flex-1 space-y-8 overflow-y-auto pr-2">
                {/* Global Stats */}
                <div className="grid gap-6 md:grid-cols-2">
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

                <div>
                    <h2 className="mb-4 text-lg font-bold text-neutral-900">Detail per Buku</h2>

                    {/* Search Bar */}
                    <div className="mb-4 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
                            <input
                                type="text"
                                placeholder="Cari buku berdasarkan judul atau penulis..."
                                className="w-full rounded-lg border border-neutral-200 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Books Table */}
                    <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-neutral-50 text-neutral-500">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Judul</th>
                                    <th className="px-6 py-4 font-medium">Penulis</th>
                                    <th className="px-6 py-4 font-medium">Kategori</th>
                                    <th className="px-6 py-4 font-medium">Tahun</th>
                                    <th className="px-6 py-4 font-medium text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {books.length === 0 ? (
                                    <TableEmpty
                                        colSpan={5}
                                        message="Tidak ada buku ditemukan"
                                        description="Coba cari dengan kata kunci yang berbeda."
                                    />
                                ) : (
                                    books.map((book) => (
                                        <tr
                                            key={book.id}
                                            className="cursor-pointer hover:bg-neutral-50"
                                            onClick={() => handleBookClick(book)}
                                        >
                                            <td className="px-6 py-4 font-medium text-neutral-900">{book.title}</td>
                                            <td className="px-6 py-4 text-neutral-600">{book.author}</td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                                                    {book.category?.name || '-'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-neutral-600">{book.year}</td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleBookClick(book);
                                                    }}
                                                    className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50"
                                                >
                                                    <BarChart2 size={14} />
                                                    Lihat Detail
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {meta.total > 0 && (
                        <Pagination
                            currentPage={meta.page}
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

                {/* Damaged Books Section */}
                <div>
                    <div className="mb-4 flex items-center gap-2">
                        <h3 className="text-lg font-bold text-neutral-900">Daftar Buku Rusak</h3>
                    </div>

                    <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-neutral-50 text-neutral-500">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Kode Buku</th>
                                    <th className="px-6 py-4 font-medium">Judul</th>
                                    <th className="px-6 py-4 font-medium">Kondisi</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium">Tanggal Masuk</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {damagedBooksLoading ? (
                                    <TableLoading colSpan={5} />
                                ) : damagedBooks.length === 0 ? (
                                    <TableEmpty
                                        colSpan={5}
                                        message="Tidak ada buku rusak"
                                        description="Semua buku dalam kondisi baik."
                                    />
                                ) : (
                                    damagedBooks.map((book) => (
                                        <tr key={book.id} className="hover:bg-neutral-50">
                                            <td className="px-6 py-4 font-medium text-neutral-900">{book.code}</td>
                                            <td className="px-6 py-4 text-neutral-600">
                                                {book.book_master?.title || '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getConditionBadgeClass(book.condition)}`}>
                                                    {book.condition}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-neutral-600">{book.status}</td>
                                            <td className="px-6 py-4 text-neutral-600">
                                                {new Date(book.createdAt).toLocaleDateString('id-ID')}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {damagedBooksMeta.total > 0 && (
                        <Pagination
                            currentPage={damagedBooksMeta.page}
                            totalPages={damagedBooksMeta.last_page}
                            totalItems={damagedBooksMeta.total}
                            itemsPerPage={damagedBooksMeta.per_page}
                            onPageChange={setDamagedBooksPage}
                            onItemsPerPageChange={(limit) => {
                                setDamagedBooksPerPage(limit);
                                setDamagedBooksPage(1);
                            }}
                        />
                    )}
                </div>

                {/* Lost Books Section */}
                <div>
                    <div className="mb-4 flex items-center gap-2">
                        <h3 className="text-lg font-bold text-neutral-900">Daftar Buku Hilang</h3>
                    </div>

                    <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-neutral-50 text-neutral-500">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Kode Buku</th>
                                    <th className="px-6 py-4 font-medium">Judul</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium">Tanggal Masuk</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {lostBooksLoading ? (
                                    <TableLoading colSpan={4} />
                                ) : lostBooks.length === 0 ? (
                                    <TableEmpty
                                        colSpan={4}
                                        message="Tidak ada buku hilang"
                                        description="Semua buku tercatat dengan baik."
                                    />
                                ) : (
                                    lostBooks.map((book) => (
                                        <tr key={book.id} className="hover:bg-neutral-50">
                                            <td className="px-6 py-4 font-medium text-neutral-900">{book.code}</td>
                                            <td className="px-6 py-4 text-neutral-600">
                                                {book.book_master?.title || '-'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700">
                                                    {book.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-neutral-600">
                                                {new Date(book.createdAt).toLocaleDateString('id-ID')}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {lostBooksMeta.total > 0 && (
                        <Pagination
                            currentPage={lostBooksMeta.page}
                            totalPages={lostBooksMeta.last_page}
                            totalItems={lostBooksMeta.total}
                            itemsPerPage={lostBooksMeta.per_page}
                            onPageChange={setLostBooksPage}
                            onItemsPerPageChange={(limit) => {
                                setLostBooksPerPage(limit);
                                setLostBooksPage(1);
                            }}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookReport;
