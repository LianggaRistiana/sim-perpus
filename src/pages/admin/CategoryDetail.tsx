import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Trash2, Edit, Tag, AlignLeft, Book, FileText } from 'lucide-react';
import { api } from '../../services/api';
import type { Category } from '../../types';
import BackButton from '../../components/BackButton';
import { useToast } from '../../components/Toast';
import { DeleteModal } from '../../components/DeleteModal';
import { LoadingScreen } from '../../components/LoadingScreen';

const CategoryDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [category, setCategory] = useState<Category | null>(null);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            try {
                const categoryData = await api.getCategoryById(id);

                if (categoryData) {
                    setCategory(categoryData);
                } else {
                    navigate('/dashboard/categories');
                }
            } catch (error) {
                console.error('Error fetching category details:', error);
                navigate('/dashboard/categories');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleDelete = () => {
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!category) return;
        try {
            const response = await api.deleteCategory(category.id);
            if (response) {
                showToast('Kategori berhasil dihapus', 'success');
                navigate('/dashboard/categories');
            } else {
                showToast('Gagal menghapus kategori', 'error');
            }
        } catch (error) {
            console.error('Error deleting category:', error);
            showToast('Gagal menghapus kategori', 'error');
        } finally {
            setShowDeleteModal(false);
        }
    };

    if (loading) {
        return <LoadingScreen message="Memuat data kategori..." />;
    }

    if (!category) {
        return null;
    }

    return (
        <div className="min-h-screen bg-neutral-50/50 pb-32 pt-8 p-6 md:p-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                    <BackButton to='/dashboard/categories' />
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
                            Detail Kategori
                        </h1>
                        <p className="text-sm text-neutral-500">
                            Informasi detail kategori dan daftar buku
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link
                        to={`/dashboard/categories/edit/${id}`}
                        className="flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
                    >
                        <Edit size={18} />
                        Edit Kategori
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

            <div className="mx-auto max-w-2xl space-y-8">
                {/* Info Card */}
                <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-neutral-200/60">
                    <div className="flex items-center justify-between border-b border-neutral-100 bg-neutral-50/50 px-6 py-4">
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                <Tag size={18} />
                            </div>
                            <h2 className="text-lg font-bold text-neutral-900">Informasi Kategori</h2>
                        </div>
                    </div>

                    <div className="p-6 md:p-8">
                        <div className="space-y-6">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-neutral-700">
                                    <div className="flex items-center gap-2">
                                        <Tag size={14} className="text-neutral-400" />
                                        Nama Kategori
                                    </div>
                                </label>
                                <div className="w-full rounded-xl border border-neutral-200 bg-neutral-50 p-2.5 text-neutral-900">
                                    {category.name}
                                </div>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-neutral-700">
                                    <div className="flex items-center gap-2">
                                        <AlignLeft size={14} className="text-neutral-400" />
                                        Deskripsi
                                    </div>
                                </label>
                                <div className="w-full rounded-xl border border-neutral-200 bg-neutral-50 p-2.5 text-neutral-900 min-h-[46px]">
                                    {category.description || '-'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Search Box */}
                <div className="grid gap-4 grid-cols-2 mb-8">
                    <div
                        onClick={() => navigate(`/dashboard/books?categoryId=${category.id}&categoryName=${encodeURIComponent(category.name)}`)}
                        className="group relative flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 p-4 md:p-8 transition-all hover:border-blue-500 hover:bg-blue-50"
                    >
                        <div className="flex flex-col items-center justify-center text-center">
                            <div className="mb-4 rounded-full bg-blue-50 p-3 md:p-4 text-blue-600 group-hover:bg-white transition-transform group-hover:scale-110">
                                <Book size={24} className="md:w-8 md:h-8" />
                            </div>
                            <p className="mb-1 text-base font-medium text-neutral-900">
                                Cari buku kategori {category.name}
                            </p>
                            <p className="text-xs text-neutral-500">
                                Klik untuk mencari semua buku dalam kategori ini
                            </p>
                        </div>
                    </div>
                    <div
                        onClick={() => navigate('#')}
                        className="group relative flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 p-4 md:p-8 transition-all hover:border-blue-500 hover:bg-blue-50"
                    >
                        <div className="flex flex-col items-center justify-center text-center">
                            <div className="mb-4 rounded-full bg-blue-50 p-3 md:p-4 text-blue-600 group-hover:bg-white transition-transform group-hover:scale-110">
                                <FileText size={24} className="md:w-8 md:h-8" />
                            </div>
                            <p className="mb-1 text-base font-medium text-neutral-900">
                                Cari Laporan kategori {category.name}
                            </p>
                            <p className="text-xs text-neutral-500">
                                Klik untuk mencari semua laporan dalam kategori ini
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <DeleteModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Hapus Kategori?"
                message={`Apakah Anda yakin ingin menghapus kategori "${category.name}"? Tindakan ini tidak dapat dibatalkan.`}
                confirmLabel="Ya, Hapus"
            />
        </div>
    );
};

export default CategoryDetail;
