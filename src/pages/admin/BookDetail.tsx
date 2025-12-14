import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Edit, Trash2, Book, User, Building, Calendar, Hash, Tag } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../components/Toast';
import { DeleteModal } from '../../components/DeleteModal';
import type { BookMaster, BookItem } from '../../types';
import BackButton from '../../components/BackButton';
import { LoadingScreen } from '../../components/LoadingScreen';

const BookDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [book, setBook] = useState<BookMaster | null>(null);
    const [items, setItems] = useState<BookItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

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

    const handleDelete = () => {
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!book) return;

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
            <LoadingScreen message='Memuat detail buku...'>
            </LoadingScreen>
        );
    }

    if (!book) return null;

    return (
        <div className="flex h-full flex-col bg-neutral-50 p-8">
            <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <BackButton to="/dashboard/books" />
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

            <div className="grid gap-4 lg:grid-cols-3 animate-in fade-in duration-500">
                {/* Book Info */}
                <div className="space-y-6 lg:col-span-1">
                    <div className="h-[calc(100vh-14rem)] overflow-y-auto rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                        <div className="mb-6 flex items-center gap-2 border-b border-neutral-100 pb-4">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                <Book size={18} />
                            </div>
                            <h2 className="text-lg font-bold text-neutral-900">Informasi Buku</h2>
                        </div>

                        <div className="space-y-6">
                            <div className="group rounded-lg border border-transparent p-2 transition-colors hover:border-neutral-100 hover:bg-neutral-50/50">
                                <div className="mb-1 flex items-center gap-2 text-xs font-semibold  tracking-wide text-neutral-500">
                                    <Tag size={12} />
                                    <span>Judul Buku</span>
                                </div>
                                <p className="text-lg font-medium text-neutral-900 leading-snug">{book.title}</p>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
                                <div className="group rounded-lg border border-transparent p-2 transition-colors hover:border-neutral-100 hover:bg-neutral-50/50">
                                    <div className="mb-1 flex items-center gap-2 text-xs font-semibold  tracking-wide text-neutral-500">
                                        <User size={12} />
                                        <span>Penulis</span>
                                    </div>
                                    <p className="text-neutral-700 font-medium">{book.author}</p>
                                </div>

                                <div className="group rounded-lg border border-transparent p-2 transition-colors hover:border-neutral-100 hover:bg-neutral-50/50">
                                    <div className="mb-1 flex items-center gap-2 text-xs font-semibold  tracking-wide text-neutral-500">
                                        <Building size={12} />
                                        <span>Penerbit</span>
                                    </div>
                                    <p className="text-neutral-700 font-medium">{book.publisher}</p>
                                </div>

                                <div className="group rounded-lg border border-transparent p-2 transition-colors hover:border-neutral-100 hover:bg-neutral-50/50">
                                    <div className="mb-1 flex items-center gap-2 text-xs font-semibold  tracking-wide text-neutral-500">
                                        <Calendar size={12} />
                                        <span>Tahun Terbit</span>
                                    </div>
                                    <p className="text-neutral-700 font-medium">{book.year}</p>
                                </div>

                                <div className="group rounded-lg border border-transparent p-2 transition-colors hover:border-neutral-100 hover:bg-neutral-50/50">
                                    <div className="mb-1 flex items-center gap-2 text-xs font-semibold  tracking-wide text-neutral-500">
                                        <Hash size={12} />
                                        <span>ISBN</span>
                                    </div>
                                    <p className="font-mono text-neutral-700 font-medium">{book.isbn}</p>
                                </div>

                                <div className="group rounded-lg border border-transparent p-2 transition-colors hover:border-neutral-100 hover:bg-neutral-50/50">
                                    <div className="mb-1 flex items-center gap-2 text-xs font-semibold  tracking-wide text-neutral-500">
                                        <Book size={12} />
                                        <span>Kategori</span>
                                    </div>
                                    <div className="mt-1">
                                        <span className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                                            {book.category?.name || 'Unknown'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Items List */}
                <div className="lg:col-span-2">
                    <div className="flex flex-col h-[calc(100vh-14rem)] rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
                        <div className="shrink-0 border-b border-neutral-100 bg-neutral-50/50 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                                        <Book size={18} />
                                    </div>
                                    <h2 className="text-lg font-bold text-neutral-900">Daftar Salinan Buku</h2>
                                </div>
                                <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-600">
                                    {items.length} Salinan
                                </span>
                            </div>
                        </div>
                        <div className="flex-1 overflow-auto">
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
                                                    {new Date(item.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
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

            <DeleteModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleConfirmDelete}
                title="Hapus Buku?"
                message="Apakah Anda yakin ingin menghapus buku ini beserta seluruh salinannya? Tindakan ini tidak dapat dibatalkan."
                confirmLabel="Ya, Hapus"
            />
        </div>
    );
};

export default BookDetail;
