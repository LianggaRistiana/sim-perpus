import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter } from 'lucide-react';
import BookCard from '../components/BookCard';
import { api } from '../services/api';
import type { BookMaster, Category } from '../types';

const BookCatalog: React.FC = () => {
    const [books, setBooks] = useState<BookMaster[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [booksData, categoriesData] = await Promise.all([
                    api.getBooks(),
                    api.getCategories(),
                ]);
                setBooks(booksData);
                setCategories(categoriesData);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredBooks = books.filter((book) => {
        const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            book.author.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || book.categoryId === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50 py-12">
            <div className="container mx-auto px-4 md:px-6">
                <div className="mb-8 flex flex-col items-center justify-between gap-4 md:flex-row">
                    <div>
                        <h1 className="text-3xl font-bold text-neutral-900">Katalog Perpustakaan</h1>
                        <p className="text-neutral-600">Jelajahi koleksi buku kami yang lengkap.</p>
                    </div>
                    <Link to="/" className="text-sm font-medium text-blue-600 hover:underline">
                        &larr; Kembali ke Beranda
                    </Link>
                </div>

                {/* Search and Filter */}
                <div className="mb-8 flex flex-col gap-4 rounded-xl bg-white p-4 shadow-sm md:flex-row">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
                        <input
                            type="text"
                            placeholder="Cari berdasarkan judul atau penulis..."
                            className="w-full rounded-lg border border-neutral-200 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="relative w-full md:w-64">
                        <Filter className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
                        <select
                            className="w-full appearance-none rounded-lg border border-neutral-200 bg-white py-2 pl-10 pr-8 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                            <option value="all">Semua Kategori</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Book Grid */}
                {filteredBooks.length === 0 ? (
                    <div className="py-12 text-center">
                        <p className="text-lg text-neutral-500">Tidak ada buku yang ditemukan sesuai kriteria Anda.</p>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredBooks.map((book) => (
                            <BookCard
                                key={book.id}
                                book={book}
                                categoryName={categories.find(c => c.id === book.categoryId)?.name || 'Tidak Diketahui'}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookCatalog;
