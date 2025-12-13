import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Calendar, Building2, Hash, Tag, CheckCircle2, Clock, AlertCircle, HelpCircle, Copy } from 'lucide-react';
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

    const availableCount = items.filter(item => item.status === 'available').length;

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
                                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
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
                                        <p className="text-neutral-900">{category?.name || 'Tanpa Kategori'}</p>
                                        <p className="text-neutral-900">{category?.description || '-'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Copies Section */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                            <Copy size={20} />
                        </div>
                        <h3 className="text-xl font-bold text-neutral-900">Salinan Buku</h3>
                    </div>

                    {items.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-8 text-center">
                            <p className="text-neutral-500">Tidak ada salinan terdaftar untuk buku ini.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {items.map((item) => {
                                let StatusIcon = HelpCircle;
                                let statusColor = "bg-neutral-100 text-neutral-700 border-neutral-200";

                                switch (item.status.toLowerCase()) {
                                    case 'available':
                                        StatusIcon = CheckCircle2;
                                        statusColor = "bg-green-50 text-green-700 border-green-200";
                                        break;
                                    case 'borrowed':
                                        StatusIcon = Clock;
                                        statusColor = "bg-amber-50 text-amber-700 border-amber-200";
                                        break;
                                    case 'lost':
                                    case 'damaged':
                                        StatusIcon = AlertCircle;
                                        statusColor = "bg-red-50 text-red-700 border-red-200";
                                        break;
                                }

                                return (
                                    <div
                                        key={item.id}
                                        className="group relative overflow-hidden rounded-xl border border-neutral-200 bg-white p-5 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
                                    >
                                        <div className="mb-4 flex items-start justify-between">
                                            <div className="rounded-lg bg-neutral-100 px-3 py-1.5 font-mono text-sm font-semibold text-neutral-700">
                                                {item.code}
                                            </div>
                                            <div className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${statusColor}`}>
                                                <StatusIcon size={14} />
                                                <span className="capitalize">{item.status}</span>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-neutral-500">Kondisi</span>
                                                <span className="font-medium text-neutral-900">{item.condition}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookCatalogDetail;
