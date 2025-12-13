import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../components/Toast';
import { DeleteModal } from '../../components/DeleteModal';
import { AsyncSelect, type Option } from '../../components/AsyncSelect';
import type { BookMaster, PaginatedResponse } from '../../types';

const BookList: React.FC = () => {
    const navigate = useNavigate();
    const [books, setBooks] = useState<BookMaster[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [meta, setMeta] = useState<PaginatedResponse<BookMaster>['meta']>({
        page: 1,
        per_page: 10,
        total: 0,
        last_page: 1,
        timestamp: ''
    });

    const [inputValue, setInputValue] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<Option | null>(null);

    // Delete Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [bookToDelete, setBookToDelete] = useState<string | null>(null);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setSearchTerm(inputValue);
            setPage(1);
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [inputValue]);

    useEffect(() => {
        setPage(1);
    }, [selectedCategory]);

    useEffect(() => {
        fetchData();
    }, [page, searchTerm, selectedCategory]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await api.getBooks({
                page,
                limit: 10,
                keyword: searchTerm,
                category_id: selectedCategory?.id
            });
            if (response.status === 'error') {
                showToast('Gagal mengambil data', 'error');
            }
            setBooks(response.data);
            setMeta(response.meta);
        } catch (error) {
            // showToast('Gagal mengambil data', );
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const { showToast } = useToast();

    const loadCategoryOptions = async ({ page, keyword }: { page: number; keyword: string }) => {
        try {
            const response = await api.getCategories({ page, limit: 10, keyword });
            return {
                options: response.data.map(c => ({ id: c.id, label: c.name })),
                hasMore: response.meta.page < response.meta.last_page
            };
        } catch (error) {
            return { options: [], hasMore: false };
        }
    };

    const handleDelete = (id: string) => {
        setBookToDelete(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!bookToDelete) return;

        try {
            const response = await api.deleteBook(bookToDelete);
            if (response) {
                showToast(response.message || 'Buku berhasil dihapus', 'success');
                fetchData();
            } else {
                showToast('Gagal menghapus buku', 'error');
            }
        } catch (error) {
            console.error('Error deleting book:', error);
            showToast('Gagal menghapus buku', 'error');
        } finally {
            setShowDeleteModal(false);
            setBookToDelete(null);
        }
    };


    return (
        <div className="flex h-full flex-col bg-neutral-50 p-8">
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

            <div className="mb-6 flex flex-wrap items-center gap-4">
                <div className="relative max-w-md flex-1">
                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Cari buku..."
                        className="w-full rounded-lg border border-neutral-200 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                    />
                </div>
                <div className="w-64">
                    <AsyncSelect
                        placeholder="Semua Kategori"
                        value={selectedCategory}
                        onChange={setSelectedCategory}
                        loadOptions={loadCategoryOptions}
                    />
                </div>
            </div>

            <div className="flex-1 min-h-0 rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden flex flex-col">
                <div className="flex-1 overflow-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="sticky top-0 z-10 bg-neutral-50 text-neutral-500">
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
                            ) : books.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-neutral-500">
                                        Tidak ada buku ditemukan.
                                    </td>
                                </tr>
                            ) : (
                                books.map((book) => (
                                    <tr
                                        key={book.id}
                                        className="cursor-pointer hover:bg-neutral-50"
                                        onClick={() => navigate(`/dashboard/books/${book.id}`)}
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
                                            <div className="flex justify-end gap-2">
                                                <Link
                                                    to={`/dashboard/books/${book.id}/edit`}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 hover:text-blue-600"
                                                >
                                                    <Edit size={18} />
                                                </Link>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(book.id);
                                                    }}
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

            <div className="flex items-center justify-between border-t border-neutral-200 px-4 py-3 sm:px-6">
                <div className="flex flex-1 justify-between sm:hidden">
                    <button
                        onClick={() => setPage(Math.max(1, page - 1))}
                        disabled={page === 1}
                        className="relative inline-flex items-center rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => setPage(Math.min(meta.last_page, page + 1))}
                        disabled={page === meta.last_page}
                        className="relative ml-3 inline-flex items-center rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
                    >
                        Next
                    </button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-neutral-700">
                            Menampilkan <span className="font-medium">{(meta.page - 1) * meta.per_page + 1}</span> sampai <span className="font-medium">{Math.min(meta.page * meta.per_page, meta.total)}</span> dari <span className="font-medium">{meta.total}</span> hasil
                        </p>
                    </div>
                    <div>
                        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                            <button
                                onClick={() => setPage(Math.max(1, page - 1))}
                                disabled={page === 1}
                                className="relative inline-flex items-center rounded-l-md px-2 py-2 text-neutral-400 ring-1 ring-inset ring-neutral-300 hover:bg-neutral-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                            >
                                <span className="sr-only">Previous</span>
                                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                            </button>
                            {/* Simple pagination: show current page */}
                            <button
                                aria-current="page"
                                className="relative z-10 inline-flex items-center bg-neutral-900 px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-600"
                            >
                                {page}
                            </button>
                            <button
                                onClick={() => setPage(Math.min(meta.last_page, page + 1))}
                                disabled={page === meta.last_page}
                                className="relative inline-flex items-center rounded-r-md px-2 py-2 text-neutral-400 ring-1 ring-inset ring-neutral-300 hover:bg-neutral-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                            >
                                <span className="sr-only">Next</span>
                                <ChevronRight className="h-5 w-5" aria-hidden="true" />
                            </button>
                        </nav>
                    </div>
                </div>
            </div>


            <DeleteModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Hapus Buku?"
                message="Apakah Anda yakin ingin menghapus buku ini? Tindakan ini tidak dapat dibatalkan."
                confirmLabel="Ya, Hapus"
            />
        </div>
    );
};

export default BookList;
