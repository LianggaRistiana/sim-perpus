import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight, Plus, Edit, Trash2 } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../components/Toast';
import type { Category, PaginatedResponse } from '../../types';

const CategoryList: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [keyword, setKeyword] = useState('');
    const [inputValue, setInputValue] = useState('');
    const [meta, setMeta] = useState<PaginatedResponse<Category>['meta']>({
        page: 1,
        per_page: 10,
        total: 0,
        last_page: 1,
        timestamp: ''
    });

    const navigate = useNavigate();

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setKeyword(inputValue);
            setPage(1); // Reset to page 1 on search
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [inputValue]);

    useEffect(() => {
        fetchData();
    }, [page, keyword]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await api.getCategories({ page, limit: 10, keyword });
            setCategories(response.data);
            setMeta(response.meta);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const { showToast } = useToast();

    const handleDelete = async (id: string) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus kategori ini?')) {
            const response = await api.deleteCategory(id);
            if (response) {
                showToast(response.message || 'Kategori berhasil dihapus', 'success');
                fetchData();
            } else {
                showToast('Gagal menghapus kategori', 'error');
            }
        }
    };

    return (
        <div className="flex h-full flex-col bg-neutral-50 p-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Kategori Buku</h1>
                    <p className="text-neutral-600">Kelola kategori dan klasifikasi buku</p>
                </div>
                <Link
                    to="/dashboard/categories/new"
                    className="flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
                >
                    <Plus size={20} />
                    Tambah Kategori
                </Link>
            </div>

            <div className="mb-6 flex gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Cari kategori..."
                        className="w-full rounded-lg border border-neutral-200 py-2.5 pl-10 pr-4 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex-1 min-h-0 rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden mb-6 flex flex-col">
                <div className="flex-1 overflow-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="sticky top-0 z-10 bg-neutral-50 text-neutral-500">
                            <tr>
                                <th className="px-6 py-4 font-medium">Kode Kategori</th>
                                <th className="px-6 py-4 font-medium">Nama Kategori</th>
                                <th className="px-6 py-4 font-medium">Deskripsi</th>
                                <th className="px-6 py-4 font-medium text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-8 text-center text-neutral-500">
                                        Memuat data...
                                    </td>
                                </tr>
                            ) : categories.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-8 text-center text-neutral-500">
                                        Tidak ada kategori ditemukan.
                                    </td>
                                </tr>
                            ) : (
                                categories.map((category) => (
                                    <tr key={category.id} className="hover:bg-neutral-50 cursor-pointer" onClick={() => navigate(`/dashboard/categories/${category.id}`)}>
                                        <td className="px-6 py-4 font-medium text-neutral-900">{category.code || '-'}</td>
                                        <td className="px-6 py-4 font-medium text-neutral-900">{category.name}</td>
                                        <td className="px-6 py-4 text-neutral-600">{category.description}</td>
                                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex justify-end gap-2">
                                                <Link
                                                    to={`/dashboard/categories/edit/${category.id}`}
                                                    className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 hover:text-blue-600"
                                                >
                                                    <Edit size={18} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(category.id)}
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

            {/* Pagination Controls */}
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
        </div>
    );
};

export default CategoryList;
