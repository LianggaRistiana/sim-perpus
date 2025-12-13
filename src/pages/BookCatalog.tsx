import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import BookCard from '../components/BookCard';
import { api } from '../services/api';
import { AsyncSelect, type Option } from '../components/AsyncSelect';
import type { BookMaster, PaginatedResponse } from '../types';

const BookCatalog: React.FC = () => {
    const [books, setBooks] = useState<BookMaster[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<Option | null>(null);
    const [meta, setMeta] = useState<PaginatedResponse<BookMaster>['meta'] | null>(null);

    const [page, setPage] = useState(1);

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1); // Reset page on new search
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const loadCategoryOptions = async ({ page, keyword }: { page: number; keyword: string }) => {
        try {
            const response = await api.getCategories({ page, limit: 10, keyword });
            return {
                options: response.data.map(c => ({ id: c.id, label: c.name })),
                hasMore: response.meta.page < response.meta.last_page
            };
        } catch (error) {
            return { options: [], hasMore: false };
        }
    };

    const handleCategoryChange = (option: Option | null) => {
        setSelectedCategory(option);
        setPage(1); // Reset page on category change
    };

    // Fetch Books on change of debouncedSearch, selectedCategory, or page
    useEffect(() => {
        const fetchBooks = async () => {
            setLoading(true);
            try {
                const response = await api.getBooks({
                    keyword: debouncedSearch,
                    category_id: selectedCategory?.id,
                    limit: 12,
                    page: page
                });
                setBooks(response.data);
                setMeta(response.meta);
            } catch (error) {
                console.error('Error fetching books:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBooks();
    }, [debouncedSearch, selectedCategory, page]);

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
                    <div className="w-full md:w-64">
                        <AsyncSelect
                            placeholder="Semua Kategori"
                            value={selectedCategory}
                            onChange={handleCategoryChange}
                            loadOptions={loadCategoryOptions}
                        />
                    </div>
                </div>

                {/* Book Grid */}
                {loading ? (
                    <div className="flex min-h-[300px] items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                    </div>
                ) : books.length === 0 ? (
                    <div className="py-12 text-center">
                        <p className="text-lg text-neutral-500">Tidak ada buku yang ditemukan sesuai kriteria Anda.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {books.map((book) => (
                                <BookCard
                                    key={book.id}
                                    book={book}
                                    categoryName={book.category?.name || 'Kategori Umum'}
                                />
                            ))}
                        </div>

                        {/* Pagination */}
                        {meta && meta.last_page > 1 && (
                            <div className="mt-12 flex justify-center gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50 disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <span className="flex items-center px-4 text-sm font-medium text-neutral-600">
                                    Page {meta.page} of {meta.last_page}
                                </span>
                                <button
                                    onClick={() => setPage(p => Math.min(meta.last_page, p + 1))}
                                    disabled={page === meta.last_page}
                                    className="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50 disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default BookCatalog;
