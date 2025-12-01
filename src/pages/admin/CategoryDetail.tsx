import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Book, Trash2 } from 'lucide-react';
import { api } from '../../services/api';
import type { Category, BookMaster } from '../../types';

const CategoryDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [category, setCategory] = useState<Category | null>(null);
    const [books, setBooks] = useState<BookMaster[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            try {
                const [categoryData, allBooks] = await Promise.all([
                    api.getCategoryById(id),
                    api.getBooks()
                ]);

                if (categoryData) {
                    setCategory(categoryData);
                    // Filter books for this category
                    const categoryBooks = allBooks.filter(b => b.categoryId === id);
                    setBooks(categoryBooks);
                } else {
                    console.error('Category not found');
                }
            } catch (error) {
                console.error('Error fetching category details:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleDelete = async () => {
        if (!category) return;
        if (window.confirm('Apakah Anda yakin ingin menghapus kategori ini?')) {
            try {
                await api.deleteCategory(category.id);
                navigate('/dashboard/categories');
            } catch (error) {
                console.error('Error deleting category:', error);
                alert('Gagal menghapus kategori.');
            }
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            </div>
        );
    }

    if (!category) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4">
                <h1 className="text-2xl font-bold text-neutral-900">Kategori tidak ditemukan</h1>
                <Link to="/dashboard/categories" className="text-blue-600 hover:underline">
                    Kembali ke Daftar Kategori
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50 p-8">
            <div className="mb-8">
                <Link to="/dashboard/categories" className="mb-4 inline-flex items-center text-sm font-medium text-neutral-600 hover:text-blue-600">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Kembali ke Daftar Kategori
                </Link>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900">{category.name}</h1>
                        <p className="text-neutral-600">{category.description}</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleDelete}
                            className="flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                        >
                            <Trash2 size={16} />
                            Hapus
                        </button>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white shadow-sm">
                <div className="border-b border-neutral-100 px-6 py-4">
                    <h2 className="text-lg font-bold text-neutral-900">Daftar Buku dalam Kategori Ini</h2>
                </div>

                {books.length === 0 ? (
                    <div className="p-8 text-center text-neutral-500">
                        <Book className="mx-auto mb-2 h-8 w-8 text-neutral-300" />
                        <p>Belum ada buku di kategori ini.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-neutral-50 text-neutral-500">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Judul</th>
                                    <th className="px-6 py-3 font-medium">Penulis</th>
                                    <th className="px-6 py-3 font-medium">Penerbit</th>
                                    <th className="px-6 py-3 font-medium">Tahun</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {books.map((book) => (
                                    <tr key={book.id} className="hover:bg-neutral-50">
                                        <td className="px-6 py-3 font-medium text-neutral-900">{book.title}</td>
                                        <td className="px-6 py-3 text-neutral-600">{book.author}</td>
                                        <td className="px-6 py-3 text-neutral-600">{book.publisher}</td>
                                        <td className="px-6 py-3 text-neutral-600">{book.year}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoryDetail;
