import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../components/Toast';
import type { BookMaster, Category, BookItem } from '../../types';

const BookForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [formData, setFormData] = useState<Partial<BookMaster>>({
        title: '',
        author: '',
        publisher: '',
        year: new Date().getFullYear(),
        categoryId: '',
        isbn: ''
    });

    const [categories, setCategories] = useState<Category[]>([]);
    const [bookItems, setBookItems] = useState<BookItem[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchCategories();
        if (isEditMode) {
            fetchBookData();
        }
    }, [id]);

    const fetchCategories = async () => {
        const response = await api.getCategories({ limit: 100 });
        setCategories(response.data);
    };

    const fetchBookData = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const book = await api.getBookById(id);
            if (book) {
                setFormData(book);
                const items = await api.getBookItems(id);
                setBookItems(items);
            }
        } catch (error) {
            console.error('Error fetching book:', error);
        } finally {
            setLoading(false);
        }
    };

    const { showToast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            let response;
            if (isEditMode && id) {
                response = await api.updateBook(id, formData);
            } else {
                response = await api.addBook(formData as Omit<BookMaster, 'id'>);
            }

            if (response) {
                showToast(response.message || 'Buku berhasil disimpan', 'success');
                navigate('/dashboard/books');
            } else {
                showToast('Gagal menyimpan buku', 'error');
            }
        } catch (error) {
            console.error('Error saving book:', error);
            showToast('Terjadi kesalahan saat menyimpan buku', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleAddCopy = async () => {
        if (!id) return; // Must save book first
        const code = prompt('Masukkan Kode Buku (misal: B001-1):');
        if (code) {
            await api.addBookItem({
                masterId: id,
                code,
                condition: 'Good',
                status: 'Available'
            });
            fetchBookData();
        }
    };

    const handleDeleteCopy = async (itemId: string) => {
        if (window.confirm('Hapus salinan buku ini?')) {
            await api.deleteBookItem(itemId);
            fetchBookData();
        }
    };

    if (loading && isEditMode && !formData.id) {
        return <div className="p-8">Memuat...</div>;
    }

    return (
        <div className="min-h-screen bg-neutral-50 p-8">
            <div className="mx-auto max-w-3xl">
                <div className="mb-8 flex items-center gap-4">
                    <button
                        onClick={() => navigate('/dashboard/books')}
                        className="rounded-lg p-2 hover:bg-neutral-200"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900">
                            {isEditMode ? 'Edit Buku' : 'Tambah Buku Baru'}
                        </h1>
                        <p className="text-neutral-600">
                            {isEditMode ? 'Perbarui informasi buku' : 'Masukkan detail buku baru'}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="col-span-2">
                                <label className="mb-2 block text-sm font-medium text-neutral-700">Judul Buku</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full rounded-lg border border-neutral-300 p-2.5 focus:border-blue-500 focus:outline-none"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-neutral-700">Penulis</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full rounded-lg border border-neutral-300 p-2.5 focus:border-blue-500 focus:outline-none"
                                    value={formData.author}
                                    onChange={e => setFormData({ ...formData, author: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-neutral-700">Penerbit</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full rounded-lg border border-neutral-300 p-2.5 focus:border-blue-500 focus:outline-none"
                                    value={formData.publisher}
                                    onChange={e => setFormData({ ...formData, publisher: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-neutral-700">Tahun Terbit</label>
                                <input
                                    type="number"
                                    required
                                    className="w-full rounded-lg border border-neutral-300 p-2.5 focus:border-blue-500 focus:outline-none"
                                    value={formData.year}
                                    onChange={e => setFormData({ ...formData, year: parseInt(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-neutral-700">ISBN</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full rounded-lg border border-neutral-300 p-2.5 focus:border-blue-500 focus:outline-none"
                                    value={formData.isbn}
                                    onChange={e => setFormData({ ...formData, isbn: e.target.value })}
                                />
                            </div>
                            {!isEditMode && (
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-neutral-700">Jumlah Buku (Auto-generate)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        className="w-full rounded-lg border border-neutral-300 p-2.5 focus:border-blue-500 focus:outline-none"
                                        value={formData.bookItemQuantity || ''}
                                        onChange={e => setFormData({ ...formData, bookItemQuantity: parseInt(e.target.value) || undefined })}
                                        placeholder="Opsional, default 1"
                                    />
                                </div>
                            )}
                            <div className="col-span-2">
                                <label className="mb-2 block text-sm font-medium text-neutral-700">Kategori</label>
                                <select
                                    required
                                    className="w-full rounded-lg border border-neutral-300 p-2.5 focus:border-blue-500 focus:outline-none"
                                    value={formData.categoryId}
                                    onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                                >
                                    <option value="">Pilih Kategori</option>
                                    {categories.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {isEditMode && (
                        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-neutral-900">Salinan Buku</h2>
                                <button
                                    type="button"
                                    onClick={handleAddCopy}
                                    className="flex items-center gap-2 rounded-lg bg-neutral-100 px-3 py-1.5 text-sm font-medium text-neutral-900 hover:bg-neutral-200"
                                >
                                    <Plus size={16} />
                                    Tambah Salinan
                                </button>
                            </div>

                            {bookItems.length === 0 ? (
                                <p className="text-sm text-neutral-500">Belum ada salinan buku.</p>
                            ) : (
                                <div className="space-y-3">
                                    {bookItems.map(item => (
                                        <div key={item.id} className="flex items-center justify-between rounded-lg border border-neutral-100 p-3">
                                            <div>
                                                <p className="font-medium text-neutral-900">{item.code}</p>
                                                <p className="text-xs text-neutral-500">{item.status} • {item.condition}</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteCopy(item.id)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard/books')}
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
                            {loading ? 'Menyimpan...' : 'Simpan Buku'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BookForm;
