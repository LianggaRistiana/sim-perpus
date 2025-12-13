import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { Pagination } from '../../components/Pagination';
import { api } from '../../services/api';
import { useToast } from '../../components/Toast';
import { DeleteModal } from '../../components/DeleteModal';
import { TableLoading, TableEmpty } from '../../components/TableState';
import type { Category, PaginatedResponse } from '../../types';

const CategoryList: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [keyword, setKeyword] = useState('');
    const [inputValue, setInputValue] = useState('');
    const [meta, setMeta] = useState<PaginatedResponse<Category>['meta']>({
        page: 1,
        per_page: 10,
        total: 0,
        last_page: 1,
        timestamp: ''
    });

    // Delete Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

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
    }, [page, keyword, itemsPerPage]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await api.getCategories({ page, limit: itemsPerPage, keyword });
            setCategories(response.data);
            setMeta(response.meta);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const { showToast } = useToast();

    const handleDelete = (id: string) => {
        setCategoryToDelete(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!categoryToDelete) return;

        try {
            const response = await api.deleteCategory(categoryToDelete);
            if (response) {
                showToast(response.message || 'Kategori berhasil dihapus', 'success');
                fetchData();
            } else {
                showToast('Gagal menghapus kategori', 'error');
            }
        } catch (error) {
            console.error('Error deleting category:', error);
            showToast('Gagal menghapus kategori', 'error');
        } finally {
            setShowDeleteModal(false);
            setCategoryToDelete(null);
        }
    };

    return (
        <div className="flex h-full flex-col bg-neutral-50 px-8 pt-8">
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
                                <TableLoading colSpan={4} />
                            ) : categories.length === 0 ? (
                                <TableEmpty
                                    colSpan={4}
                                    message="Tidak ada kategori ditemukan"
                                    description="Coba cari dengan kata kunci lain atau tambahkan kategori baru."
                                />
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
            <Pagination
                currentPage={page}
                totalPages={meta.last_page}
                totalItems={meta.total}
                itemsPerPage={meta.per_page}
                onPageChange={setPage}
                onItemsPerPageChange={(limit) => {
                    setItemsPerPage(limit);
                    setPage(1);
                }}
            />


            <DeleteModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Hapus Kategori?"
                message="Apakah Anda yakin ingin menghapus kategori ini? Tindakan ini tidak dapat dibatalkan."
                confirmLabel="Ya, Hapus"
            />
        </div>
    );
};

export default CategoryList;
