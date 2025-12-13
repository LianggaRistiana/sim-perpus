import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, Tag, AlignLeft } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../components/Toast';
import type { Category } from '../../types';
import BackButton from '../../components/BackButton';
import { LoadingScreen } from '../../components/LoadingScreen';

const CategoryForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [formData, setFormData] = useState<Partial<Category>>({
        name: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isEditMode) {
            fetchData();
        }
    }, [id]);

    const fetchData = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const data = await api.getCategoryById(id);
            if (data) {
                setFormData({
                    name: data.name,
                    description: data.description
                });
            }
        } catch (error) {
            console.error('Error fetching category:', error);
        } finally {
            setLoading(false);
        }
    };

    const { showToast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isEditMode && id) {
                const response = await api.updateCategory(id, {
                    name: formData.name,
                    description: formData.description
                });
                if (response) {
                    showToast(response.message || 'Kategori berhasil diperbarui', 'success');
                    navigate('/dashboard/categories');
                } else {
                    showToast('Gagal memperbarui kategori', 'error');
                }
            } else {
                const response = await api.addCategory(formData as Omit<Category, 'id'>);
                if (response) {
                    showToast(response.message || 'Kategori berhasil ditambahkan', 'success');
                    navigate('/dashboard/categories');
                } else {
                    showToast('Gagal menambahkan kategori', 'error');
                }
            }
        } catch (error) {
            console.error('Error saving category:', error);
            showToast('Terjadi kesalahan saat menyimpan kategori', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEditMode && !formData.name) {
        return <LoadingScreen message="Memuat data kategori..." />;
    }

    return (
        <div className="min-h-screen bg-neutral-50/50 pb-32 pt-8 p-6 md:p-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                    <BackButton to="/dashboard/categories" />
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
                            {isEditMode ? 'Edit Kategori' : 'Tambah Kategori Baru'}
                        </h1>
                        <p className="text-sm text-neutral-500">
                            {isEditMode ? 'Perbarui informasi dan detail kategori buku' : 'Tambahkan kategori baru untuk pengelompokan buku'}
                        </p>
                    </div>
                </div>
            </div>
            <div className="mx-auto max-w-2xl">

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-neutral-200/60">
                        <div className="flex items-center justify-between border-b border-neutral-100 bg-neutral-50/50 px-6 py-4">
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                    <Tag size={18} />
                                </div>
                                <h2 className="text-lg font-bold text-neutral-900">Informasi Kategori</h2>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-neutral-900/20 hover:bg-neutral-800 hover:shadow-xl hover:shadow-neutral-900/10 disabled:opacity-70 disabled:shadow-none transition-all"
                            >
                                <Save size={16} />
                                {loading ? 'Menyimpan...' : 'Simpan'}
                            </button>
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
                                    <input
                                        type="text"
                                        required
                                        placeholder="Contoh: Fiksi, Sains, Sejarah"
                                        className="w-full rounded-xl border border-neutral-200 bg-neutral-50 p-2.5 transition-all focus:border-neutral-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-neutral-700">
                                        <div className="flex items-center gap-2">
                                            <AlignLeft size={14} className="text-neutral-400" />
                                            Deskripsi
                                        </div>
                                    </label>
                                    <textarea
                                        required
                                        rows={4}
                                        placeholder="Deskripsi singkat mengenai kategori ini..."
                                        className="w-full rounded-xl border border-neutral-200 bg-neutral-50 p-2.5 transition-all focus:border-neutral-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CategoryForm;
