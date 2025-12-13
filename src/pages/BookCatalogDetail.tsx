import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Calendar, Building2, Hash, Tag } from 'lucide-react';
import { api } from '../services/api';
import type { BookMaster, Category, BookItem } from '../types';

const BookCatalogDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [book, setBook] = useState<BookMaster | null>(null);
    const [category, setCategory] = useState<Category | null>(null);
    const [items, setItems] = useState<BookItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const bookData = await api.getBookById(id);
                if (bookData) {
                    setBook(bookData);

                    // Fetch category if not included in book response
                    if (bookData.category) {
                        setCategory(bookData.category);
                    } else if (bookData.categoryId) {
                        try {
                            const categoryData = await api.getCategoryById(bookData.categoryId);
                            if (categoryData) setCategory(categoryData);
                        } catch (err) {
                            console.error('Failed to fetch category', err);
                        }
                    }

                    // Fetch book items (copies)
                    const itemsData = await api.getBookItems(id);
                    setItems(itemsData);
                }
            } catch (error) {
                console.error('Error fetching book details:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            </div>
        );
    }

    if (!book) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4">
                <h1 className="text-2xl font-bold text-neutral-900">Buku tidak ditemukan</h1>
                <Link to="/books" className="text-blue-600 hover:underline">
                    Kembali ke Katalog
                </Link>
            </div>
        );
    }

    const availableCount = items.filter(item => item.status === 'Available').length;

    return (
        <div className="min-h-screen bg-neutral-50 py-12">
            <div className="container mx-auto px-4 md:px-6">
                <Link to="/books" className="mb-6 inline-flex items-center text-sm font-medium text-neutral-600 hover:text-blue-600">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Kembali ke Katalog
                </Link>

                <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-neutral-200 mb-8">
                    <div className="grid md:grid-cols-3">
                        {/* Left Column: Image/Placeholder */}
                        <div className="flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 p-0 md:border-r border-neutral-200 overflow-hidden relative min-h-[400px]">
                            <div className="absolute inset-0 bg-white/10" />
                            <BookOpen className="h-32 w-32 text-white/90 drop-shadow-md relative z-10" />

                            {/* Decorative circles */}
                            <div className="absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
                            <div className="absolute -top-16 -left-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
                        </div>

                        {/* Right Column: Details */}
                        <div className="col-span-2 p-8 md:p-12">
                            <div className="mb-6">
                                <div className="mb-2 flex items-center gap-2">
                                    <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                                        {category?.name || 'Tanpa Kategori'}
                                    </span>
                                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${availableCount > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                        }`}>
                                        {availableCount} Tersedia
                                    </span>
                                </div>
                                <h1 className="text-3xl font-bold text-neutral-900 sm:text-4xl">{book.title}</h1>
                                <p className="mt-2 text-xl text-neutral-600">oleh {book.author}</p>
                            </div>

                            <div className="grid gap-6 sm:grid-cols-2">
                                <div className="flex items-start gap-3">
                                    <Building2 className="mt-1 h-5 w-5 text-neutral-400" />
                                    <div>
                                        <p className="text-sm font-medium text-neutral-500">Penerbit</p>
                                        <p className="text-neutral-900">{book.publisher}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Calendar className="mt-1 h-5 w-5 text-neutral-400" />
                                    <div>
                                        <p className="text-sm font-medium text-neutral-500">Tahun</p>
                                        <p className="text-neutral-900">{book.year}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Hash className="mt-1 h-5 w-5 text-neutral-400" />
                                    <div>
                                        <p className="text-sm font-medium text-neutral-500">ISBN</p>
                                        <p className="text-neutral-900">{book.isbn}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Tag className="mt-1 h-5 w-5 text-neutral-400" />
                                    <div>
                                        <p className="text-sm font-medium text-neutral-500">Kategori</p>
                                        <p className="text-neutral-900">{category?.description || '-'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Copies Section */}
                <div className="rounded-2xl bg-white shadow-sm border border-neutral-200 p-8">
                    <h3 className="mb-6 text-xl font-bold text-neutral-900">Salinan Buku</h3>
                    {items.length === 0 ? (
                        <p className="text-neutral-500">Tidak ada salinan terdaftar.</p>
                    ) : (
                        <div className="overflow-hidden rounded-lg border border-neutral-200">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-neutral-50 text-neutral-500">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">Kode</th>
                                        <th className="px-4 py-3 font-medium">Kondisi</th>
                                        <th className="px-4 py-3 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-200 bg-white">
                                    {items.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-4 py-3 font-medium text-neutral-900">{item.code}</td>
                                            <td className="px-4 py-3 text-neutral-600">{item.condition}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${item.status === 'Available'
                                                    ? 'bg-green-50 text-green-700'
                                                    : 'bg-yellow-50 text-yellow-700'
                                                    }`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookCatalogDetail;
