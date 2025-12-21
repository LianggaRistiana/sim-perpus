import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Search, Edit, Plus, Shield } from 'lucide-react';
import { Pagination } from '../../components/Pagination';
import { api } from '../../services/api';
import type { Librarian, PaginatedResponse } from '../../types';
import { useToast } from '../../components/Toast';
import { DeleteModal } from '../../components/DeleteModal';
import { TableLoading, TableEmpty } from '../../components/TableState';

const LibrarianList: React.FC = () => {
    const [librarians, setLibrarians] = useState<Librarian[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [keyword, setKeyword] = useState('');
    const [inputValue, setInputValue] = useState('');
    const [meta, setMeta] = useState<PaginatedResponse<Librarian>['meta']>({
        current_page: 1,
        per_page: 10,
        total: 0,
        last_page: 1,
        timestamp: ''
    });

    // Delete Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [librarianToDelete, setLibrarianToDelete] = useState<string | null>(null);

    const navigate = useNavigate();
    const { showToast } = useToast();

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
            const response = await api.getLibrarians({ page, limit: itemsPerPage, keyword });
            setLibrarians(response.data);
            setMeta(response.meta);
        } catch (error) {
            console.error('Error fetching librarians:', error);
            showToast('Gagal memuat data pustakawan', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id: string) => {
        setLibrarianToDelete(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!librarianToDelete) return;

        try {
            const response = await api.deleteLibrarian(librarianToDelete);
            if (response) {
                showToast('Pustakawan berhasil dihapus', 'success');
                fetchData();
            } else {
                showToast('Gagal menghapus pustakawan', 'error');
            }
        } catch (error: any) {
            console.error('Error deleting librarian:', error);
            let message = error?.message || 'Gagal menghapus pustakawan';
            
            if (error?.fields) {
                 const fieldErrors = Object.values(error.fields).flat();
                 if (fieldErrors.length > 0) {
                     message = `${message}: ${fieldErrors[0]}`;
                 }
            }

            showToast(message, 'error');
        } finally {
            setShowDeleteModal(false);
            setLibrarianToDelete(null);
        }
    };

    return (
        <div className="flex h-full flex-col bg-neutral-50 px-8 pt-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Manajemen Pustakawan</h1>
                    <p className="text-neutral-600">Kelola data pustakawan perpustakaan</p>
                </div>
                <div className="flex gap-2">
                    <Link
                        to="/dashboard/librarians/new"
                        className="flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
                    >
                        <Plus size={20} />
                        <span className='hidden md:block'>Tambah Pustakawan</span>
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <div className="mb-6 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="relative lg:col-span-2">
                        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Cari nama atau NIP..."
                            className="w-full rounded-lg border border-neutral-200 py-2 pl-10 pr-4 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="flex-1 min-h-0 rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden mb-6 flex flex-col">
                <div className="flex-1 overflow-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="sticky top-0 z-10 bg-neutral-50 text-neutral-500">
                            <tr>
                                <th className="px-6 py-4 font-medium">NIP / User Number</th>
                                <th className="px-6 py-4 font-medium">Nama Lengkap</th>
                                <th className="px-6 py-4 font-medium">Email</th>
                                <th className="px-6 py-4 font-medium">Role</th>
                                <th className="px-6 py-4 font-medium text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {loading ? (
                                <TableLoading colSpan={5} />
                            ) : librarians.length === 0 ? (
                                <TableEmpty
                                    colSpan={5}
                                    message="Tidak ada pustakawan ditemukan"
                                    description="Coba cari dengan kata kunci lain atau tambahkan pustakawan baru."
                                />
                            ) : (
                                librarians.map((librarian) => (
                                    <tr key={librarian.id} className="hover:bg-neutral-50 cursor-pointer" onClick={() => navigate(`/dashboard/librarians/${librarian.id}`)}>
                                        <td className="px-6 py-4 font-medium text-neutral-900">{librarian.user_number}</td>
                                        <td className="px-6 py-4 text-neutral-600">{librarian.name}</td>
                                        <td className="px-6 py-4 text-neutral-600">{librarian.email}</td>
                                        <td className="px-6 py-4 text-neutral-600">
                                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                                                <Shield size={12} />
                                                {librarian.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex justify-end gap-2">
                                                <Link
                                                    to={`/dashboard/librarians/${librarian.id}/edit`}
                                                    className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 hover:text-blue-600"
                                                >
                                                    <Edit size={18} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(librarian.id)}
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
                title="Hapus Pustakawan?"
                message="Apakah Anda yakin ingin menghapus pustakawan ini? Tindakan ini tidak dapat dibatalkan."
                confirmLabel="Ya, Hapus"
            />
        </div>
    );
};

export default LibrarianList;
