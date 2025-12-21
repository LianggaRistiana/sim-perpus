import React, { useEffect, useState } from 'react';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Edit, Trash2, Book, User, Building, Calendar, Hash, Tag, Search } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../components/Toast';
import { DeleteModal } from '../../components/DeleteModal';
import type { BookMaster, BookItem } from '../../types';
import BackButton from '../../components/BackButton';
import { LoadingScreen } from '../../components/LoadingScreen';
import ConditionBadge from '../../components/ConditionBadge';
import StatusBookBadge from '../../components/StatusBookBadge';

const BookDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [book, setBook] = useState<BookMaster | null>(null);
    const [items, setItems] = useState<BookItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Pagination State
    const [page, setPage] = useState(1);
    const [loadingItems, setLoadingItems] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [totalItems, setTotalItems] = useState(0);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [debouncedKeyword, setDebouncedKeyword] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedKeyword(searchKeyword);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchKeyword]);

    useEffect(() => {
        if (id) {
            fetchItems(id, 1, true);
        }
    }, [debouncedKeyword]);

    useEffect(() => {
        if (id) {
            fetchData(id);
        }
    }, [id]);

    const fetchData = async (bookId: string) => {
        setLoading(true);
        try {
            const bookData = await api.getBookById(bookId);

            if (bookData) {
                setBook(bookData);
                // Initial items fetch is now handled by the debouncedKeyword effect or manual call if needed, 
                // but since debouncedKeyword is initially '', it triggers. 
                // However, we want to ensure we fetch if we just navigated here.
                // The [debouncedKeyword] effect handles the initial load if debouncedKeyword is ''? 
                // Actually, initial render has '' -> ''. Effect runs.
                // But fetchData also calls fetchItems(bookId, 1, true). We should remove that explicit call if the effect handles it, 
                // OR ensure we don't double fetch.
                // Simpler: Remove the explicit fetchItems(bookId, 1, true) from fetchData and let the effect handler do it?
                // Or keep it and rely on logic. 
                // Let's modify fetchData to NOT fetch items, and let the effect do it.
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

    const fetchItems = async (bookId: string, pageNum: number, reset: boolean = false) => {
        if (!reset && (!hasMore || loadingItems)) return;

        setLoadingItems(true);
        try {
            const response = await api.getBookItemsPaginated({
                masterId: bookId,
                page: pageNum,
                limit: 20,
                keyword: debouncedKeyword
            });

            if (reset) {
                setItems(response.data);
            } else {
                setItems(prev => [...prev, ...response.data]);
            }

            setTotalItems(response.meta.total);
            setHasMore(response.meta.current_page < response.meta.last_page);
            setPage(pageNum);
        } catch (error) {
            console.error('Error fetching items:', error);
            showToast('Gagal memuat salinan buku', 'error');
        } finally {
            setLoadingItems(false);
        }
    };

    const loadMoreItems = () => {
        if (id && !loadingItems && hasMore) {
            fetchItems(id, page + 1);
        }
    };

    const handleScroll = useInfiniteScroll({
        onLoadMore: loadMoreItems,
        hasMore,
        isLoading: loadingItems,
    });

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

            <div className="flex w-full gap-4 overflow-x-auto p-1 pb-8 lg:grid lg:grid-cols-3 lg:p-0 lg:overflow-visible snap-x snap-mandatory animate-in fade-in duration-500">
                {/* Book Info */}
                <div className="w-[85vw] flex-none snap-center space-y-6 sm:w-[500px] lg:w-auto lg:col-span-1">
                    <div className="flex flex-col h-[calc(100vh-14rem)] overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-neutral-200/60">
                        <div className="flex items-center justify-between border-b border-neutral-100 bg-neutral-50/50 px-6 py-4">
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                    <Book size={18} />
                                </div>
                                <h2 className="text-lg font-bold text-neutral-900">Informasi Buku</h2>
                            </div>
                        </div>

                        <div className="flex-1 p-6 md:p-8 overflow-y-auto">
                            <div className="space-y-6">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-neutral-700">
                                        <div className="flex items-center gap-2">
                                            <Tag size={14} className="text-neutral-400" />
                                            Judul Buku
                                        </div>
                                    </label>
                                    <div className="w-full rounded-xl border border-neutral-200 bg-neutral-50 p-2.5 text-neutral-900 leading-snug">
                                        {book.title}
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-neutral-700">
                                        <div className="flex items-center gap-2">
                                            <User size={14} className="text-neutral-400" />
                                            Penulis
                                        </div>
                                    </label>
                                    <div className="w-full rounded-xl border border-neutral-200 bg-neutral-50 p-2.5 text-neutral-900">
                                        {book.author}
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-neutral-700">
                                        <div className="flex items-center gap-2">
                                            <Building size={14} className="text-neutral-400" />
                                            Penerbit
                                        </div>
                                    </label>
                                    <div className="w-full rounded-xl border border-neutral-200 bg-neutral-50 p-2.5 text-neutral-900">
                                        {book.publisher}
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-neutral-700">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} className="text-neutral-400" />
                                            Tahun Terbit
                                        </div>
                                    </label>
                                    <div className="w-full rounded-xl border border-neutral-200 bg-neutral-50 p-2.5 text-neutral-900">
                                        {book.year}
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-neutral-700">
                                        <div className="flex items-center gap-2">
                                            <Hash size={14} className="text-neutral-400" />
                                            ISBN
                                        </div>
                                    </label>
                                    <div className="w-full rounded-xl border border-neutral-200 bg-neutral-50 p-2.5 font-mono text-neutral-900">
                                        {book.isbn}
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-neutral-700">
                                        <div className="flex items-center gap-2">
                                            <Book size={14} className="text-neutral-400" />
                                            Kategori
                                        </div>
                                    </label>
                                    <div className="w-full rounded-xl border border-neutral-200 bg-neutral-50 p-2.5 text-neutral-900">
                                        {book.category?.name || 'Unknown'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Items List */}
                <div className="w-[85vw] flex-none snap-center sm:w-[500px] lg:w-auto lg:col-span-2">
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
                                    {totalItems} Salinan
                                </span>
                            </div>
                            <div className="flex w-full items-center gap-2 border-0 border-neutral-200 pl-2 pt-2">
                                <Search size={16} className="text-neutral-400" />
                                <input
                                    type="text"
                                    placeholder="Cari kode buku..."
                                    className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-400 border-0 "
                                    value={searchKeyword}
                                    onChange={(e) => setSearchKeyword(e.target.value)}
                                />
                            </div>
                        </div>
                        <div
                            className="flex-1 overflow-auto"
                            onScroll={handleScroll}
                        >
                            <table className="w-full text-left text-sm">
                                <thead className="bg-neutral-50 text-neutral-500 sticky top-0 z-10">
                                    <tr>
                                        <th className="px-6 py-3 font-medium">Kode Buku</th>
                                        <th className="px-6 py-3 font-medium">Kondisi</th>
                                        <th className="px-6 py-3 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100">
                                    {items.length === 0 && !loadingItems ? (
                                        <tr>
                                            <td colSpan={3} className="px-6 py-8 text-center text-neutral-500">
                                                Belum ada salinan buku.
                                            </td>
                                        </tr>
                                    ) : (
                                        <>
                                            {items.map((item) => (
                                                <tr key={item.id} className="hover:bg-neutral-50">
                                                    <td className="px-6 py-3 font-medium text-neutral-900">{item.code}</td>
                                                    <td className="px-6 py-3 capitalize text-neutral-600"><ConditionBadge condition={item.condition} /></td>
                                                    <td className="px-6 py-3">
                                                        <StatusBookBadge status={item.status} />
                                                    </td>
                                                </tr>
                                            ))}
                                            {loadingItems && (
                                                <tr>
                                                    <td colSpan={3} className="px-6 py-4 text-center text-neutral-500">
                                                        Memuat lebih banyak...
                                                    </td>
                                                </tr>
                                            )}
                                        </>
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
