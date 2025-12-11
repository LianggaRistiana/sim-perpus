import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../components/Toast';
import type { Category } from '../../types';

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

    return (
        <div className="min-h-screen bg-neutral-50 p-8">
            <div className="mx-auto max-w-2xl">
                <div className="mb-8 flex items-center gap-4">
                    <button
                        onClick={() => navigate('/dashboard/categories')}
                        className="rounded-lg p-2 hover:bg-neutral-200"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900">
                            {isEditMode ? 'Edit Kategori' : 'Tambah Kategori Baru'}
                        </h1>
                        <p className="text-neutral-600">
                            {isEditMode ? 'Perbarui informasi kategori' : 'Masukkan detail kategori baru'}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                        <div className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-neutral-700">Nama Kategori</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full rounded-lg border border-neutral-300 p-2.5 focus:border-blue-500 focus:outline-none"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-neutral-700">Deskripsi</label>
                                <textarea
                                    required
                                    rows={4}
                                    className="w-full rounded-lg border border-neutral-300 p-2.5 focus:border-blue-500 focus:outline-none"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard/categories')}
                            className="rounded-lg px-6 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 rounded-lg bg-neutral-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-70"
                        >
                            <Save size={20} />
                            {loading ? 'Menyimpan...' : 'Simpan Kategori'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CategoryForm;
