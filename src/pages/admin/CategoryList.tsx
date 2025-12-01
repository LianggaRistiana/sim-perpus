import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { api } from '../../services/api';
import type { Category } from '../../types';

const CategoryList: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await api.getCategories();
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus kategori ini?')) {
            await api.deleteCategory(id);
            fetchData();
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50 p-8">
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

            <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-neutral-50 text-neutral-500">
                        <tr>
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
                                    <td className="px-6 py-4 font-medium text-neutral-900">{category.name}</td>
                                    <td className="px-6 py-4 text-neutral-600">{category.description}</td>
                                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex justify-end gap-2">
                                            <Link
                                                to={`/dashboard/categories/${category.id}`}
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
    );
};

export default CategoryList;
