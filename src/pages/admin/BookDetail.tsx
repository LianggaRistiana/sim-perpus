import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../components/Toast';
import type { BookMaster, BookItem } from '../../types';

const BookDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [book, setBook] = useState<BookMaster | null>(null);
    const [items, setItems] = useState<BookItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchData(id);
        }
    }, [id]);

    const fetchData = async (bookId: string) => {
        setLoading(true);
        try {
            const [bookData, itemsData] = await Promise.all([
                api.getBookById(bookId),
                api.getBookItems(bookId)
            ]);

            if (bookData) {
                setBook(bookData);
                setItems(itemsData || []);
            } else {
                showToast('Buku tidak ditemukan', 'error');
                navigate('/dashboard/books');
            }
        } catch (error) {
            console.error('Error fetching book details:', error);
            showToast('Gagal memuat detail buku', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!book || !window.confirm('Apakah Anda yakin ingin menghapus buku ini?')) return;

        try {
            const response = await api.deleteBook(book.id);
            if (response) {
                showToast('Buku berhasil dihapus', 'success');
                navigate('/dashboard/books');
            } else {
                showToast('Gagal menghapus buku', 'error');
            }
        } catch (error) {
            showToast('Terjadi kesalahan saat menghapus buku', 'error');
        }
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center bg-neutral-50">
                <div className="text-neutral-500">Memuat detail buku...</div>
            </div>
        );
    }

    if (!book) return null;

    return (
        <div className="flex h-full flex-col bg-neutral-50 p-8">
            <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/dashboard/books')}
                        className="rounded-lg p-2 hover:bg-neutral-200"
                    // className="rounded-lg bg-white p-2 text-neutral-600 shadow-sm hover:bg-neutral-50 hover:text-neutral-900"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900">Detail Buku</h1>
                        <p className="text-neutral-600">Informasi lengkap dan daftar salinan</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link
                        to={`/dashboard/books/${book.id}/edit`}
                        className="flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
                    >
                        <Edit size={18} />
                        Edit Buku
                    </Link>
                    <button
                        onClick={handleDelete}
                        className="flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                        <Trash2 size={18} />
                        Hapus
                    </button>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                {/* Book Info */}
                <div className="space-y-6 lg:col-span-1">
                    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-bold text-neutral-900">Informasi Buku</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-medium uppercase text-neutral-500">Judul</label>
                                <p className="mt-1 font-medium text-neutral-900">{book.title}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium uppercase text-neutral-500">Penulis</label>
                                <p className="mt-1 text-neutral-700">{book.author}</p>
                            </div>
                            <div>
                                <label className="text-xs font-medium uppercase text-neutral-500">Penerbit</label>
                                <p className="mt-1 text-neutral-700">{book.publisher}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-medium uppercase text-neutral-500">Tahun</label>
                                    <p className="mt-1 text-neutral-700">{book.year}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-medium uppercase text-neutral-500">ISBN</label>
                                    <p className="mt-1 text-neutral-700">{book.isbn}</p>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-medium uppercase text-neutral-500">Kategori</label>
                                <div className="mt-1">
                                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                                        {book.category?.name || 'Unknown'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Items List */}
                <div className="lg:col-span-2">
                    <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
                        <div className="border-b border-neutral-100 bg-neutral-50/50 px-6 py-4">
                            <h2 className="font-bold text-neutral-900">Daftar Salinan Buku ({items.length})</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-neutral-50 text-neutral-500">
                                    <tr>
                                        <th className="px-6 py-3 font-medium">Kode Buku</th>
                                        <th className="px-6 py-3 font-medium">Kondisi</th>
                                        <th className="px-6 py-3 font-medium">Status</th>
                                        <th className="px-6 py-3 font-medium">Dibuat Pada</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100">
                                    {items.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-neutral-500">
                                                Belum ada salinan buku.
                                            </td>
                                        </tr>
                                    ) : (
                                        items.map((item) => (
                                            <tr key={item.id} className="hover:bg-neutral-50">
                                                <td className="px-6 py-3 font-medium text-neutral-900">{item.code}</td>
                                                <td className="px-6 py-3 capitalize text-neutral-600">{item.condition}</td>
                                                <td className="px-6 py-3">
                                                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${item.status === 'available'
                                                        ? 'bg-green-50 text-green-700'
                                                        : 'bg-yellow-50 text-yellow-700'
                                                        }`}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3 text-neutral-500">
                                                    {new Date(item.createdAt).toLocaleDateString('id-ID')}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookDetail;
