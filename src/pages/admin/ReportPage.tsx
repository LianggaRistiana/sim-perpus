import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import type { BookItem } from '../../types';
import ReportChart from '../../components/ReportChart';
import { AlertTriangle } from 'lucide-react';

const ReportPage: React.FC = () => {
    const [mostBorrowedBooks, setMostBorrowedBooks] = useState<{ label: string; value: number }[]>([]);
    const [longestBorrowedBooks, setLongestBorrowedBooks] = useState<{ label: string; value: number }[]>([]);
    const [mostBorrowedCategories, setMostBorrowedCategories] = useState<{ label: string; value: number }[]>([]);
    const [longestBorrowedCategories, setLongestBorrowedCategories] = useState<{ label: string; value: number }[]>([]);
    const [damagedBooks, setDamagedBooks] = useState<BookItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [
                    mostBorrowedB,
                    longestBorrowedB,
                    mostBorrowedC,
                    longestBorrowedC,
                    damaged
                ] = await Promise.all([
                    api.getMostBorrowedBooks(),
                    api.getLongestBorrowedBooks(),
                    api.getMostBorrowedCategories(),
                    api.getLongestBorrowedCategories(),
                    api.getDamagedBooks()
                ]);

                setMostBorrowedBooks(mostBorrowedB.map(i => ({ label: i.title, value: i.count })));
                setLongestBorrowedBooks(longestBorrowedB.map(i => ({ label: i.title, value: i.days })));
                setMostBorrowedCategories(mostBorrowedC.map(i => ({ label: i.name, value: i.count })));
                setLongestBorrowedCategories(longestBorrowedC.map(i => ({ label: i.name, value: i.days })));
                setDamagedBooks(damaged);
            } catch (error) {
                console.error('Error fetching report data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <h1 className="mb-8 text-2xl font-bold text-neutral-900">Laporan Perpustakaan</h1>

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

            {/* Damaged Books Section */}
            <div className="mt-8 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
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

export default ReportPage;
