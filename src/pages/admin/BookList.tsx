import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { api } from '../../services/api';
import type { BookMaster, Category } from '../../types';

const BookList: React.FC = () => {
    const [books, setBooks] = useState<BookMaster[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [booksData, categoriesData] = await Promise.all([
                api.getBooks(),
                api.getCategories()
            ]);
            setBooks(booksData);
            setCategories(categoriesData);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus buku ini?')) {
            await api.deleteBook(id);
            fetchData();
        }
    };

    const getCategoryName = (id: string) => {
        return categories.find(c => c.id === id)?.name || 'Unknown';
    };

    const filteredBooks = books.filter(book =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-neutral-50 p-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Manajemen Buku</h1>
                    <p className="text-neutral-600">Kelola daftar buku perpustakaan</p>
                </div>
                <Link
                    to="/dashboard/books/new"
                    className="flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
                >
                    <Plus size={20} />
                    Tambah Buku
                </Link>
            </div>

            <div className="mb-6">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Cari buku..."
                        className="w-full rounded-lg border border-neutral-200 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

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
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-neutral-500">
                                    Memuat data...
                                </td>
                            </tr>
                        ) : filteredBooks.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-neutral-500">
                                    Tidak ada buku ditemukan.
                                </td>
                            </tr>
                        ) : (
                            filteredBooks.map((book) => (
                                <tr key={book.id} className="hover:bg-neutral-50">
                                    <td className="px-6 py-4 font-medium text-neutral-900">{book.title}</td>
                                    <td className="px-6 py-4 text-neutral-600">{book.author}</td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                                            {getCategoryName(book.categoryId)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-neutral-600">{book.year}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Link
                                                to={`/dashboard/books/${book.id}`}
                                                className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 hover:text-blue-600"
                                            >
                                                <Edit size={18} />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(book.id)}
                                                className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 hover:text-red-600"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default BookList;
