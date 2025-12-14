import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, Plus, Trash2, Book, Calendar, User, Building, Pencil, Hash } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../components/Toast';
import { Modal } from '../../components/Modal';
import { DeleteModal } from '../../components/DeleteModal';
import type { BookMaster, BookItem } from '../../types';
import BackButton from '../../components/BackButton';
import { AsyncSelect, type Option } from '../../components/AsyncSelect';
import { LoadingScreen } from '../../components/LoadingScreen';

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

    const [selectedCategory, setSelectedCategory] = useState<Option | null>(null);
    const [bookItems, setBookItems] = useState<BookItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Modal State
    const [showCopyModal, setShowCopyModal] = useState(false);
    const [copyCondition, setCopyCondition] = useState('good');
    const [copyQuantity, setCopyQuantity] = useState(1);
    const [editingItem, setEditingItem] = useState<BookItem | null>(null);

    // Delete Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<string | null>(null);

    useEffect(() => {
        if (isEditMode) {
            fetchBookData();
        }
    }, [id]);

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

    const fetchBookData = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const book = await api.getBookById(id);
            if (book) {
                setFormData(book);
                if (book.category) {
                    setSelectedCategory({ id: book.category.id, label: book.category.name });
                }
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
        setSubmitting(true);
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
            setSubmitting(false);
        }
    };

    const openAddModal = () => {
        if (!id) return;
        setEditingItem(null);
        setCopyCondition('good');
        setCopyQuantity(1);
        setShowCopyModal(true);
    };

    const openEditModal = (item: BookItem) => {
        setEditingItem(item);
        setCopyCondition(item.condition.toLowerCase());
        setShowCopyModal(true);
    };

    const handleSaveCopy = async () => {
        if (!id) return;

        try {
            if (editingItem) {
                // Update existing
                await api.updateBookItem(editingItem.id, {
                    condition: copyCondition
                });
                showToast('Kondisi buku berhasil diperbarui', 'success');
            } else {
                // Add new
                if (copyQuantity > 1) {
                    await api.createBookItemBatch({
                        book_master_id: id,
                        items: [{
                            condition: copyCondition,
                            quantity: copyQuantity,
                            status: 'available'
                        }]
                    });
                    showToast(`${copyQuantity} Salinan berhasil ditambahkan`, 'success');
                } else {
                    await api.addBookItem({
                        masterId: id,
                        code: '', // Backend generates code
                        condition: copyCondition,
                        status: 'available'
                    });
                    showToast('Salinan berhasil ditambahkan', 'success');
                }
            }

            fetchBookData();
            setShowCopyModal(false);
        } catch (error) {
            console.error('Error saving copy:', error);
            showToast('Gagal menyimpan salinan', 'error');
        }
    };

    const handleDeleteCopy = (itemId: string) => {
        setItemToDelete(itemId);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await api.deleteBookItem(itemToDelete);
            showToast('Salinan buku berhasil dihapus', 'success');
            fetchBookData();
            setShowDeleteModal(false);
        } catch (error) {
            console.error('Error deleting copy:', error);
            showToast('Gagal menghapus salinan', 'error');
        }
    };

    if (loading && isEditMode && !formData.id) {
        return <LoadingScreen message="Memuat data buku..." />;
    }

    return (
        <div className="min-h-screen bg-neutral-50/50 pb-32 pt-8 p-6 md:p-8 animate-in fade-in duration-500">
            <div className="mx-auto ">
                {/* Header Section */}
                <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                        <BackButton to="/dashboard/books" />
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
                                {isEditMode ? 'Edit Buku' : 'Tambah Buku Baru'}
                            </h1>
                            <p className="text-sm text-neutral-500">
                                {isEditMode ? 'Perbarui informasi dan kelola salinan buku' : 'Lengkapi formulir di bawah untuk menambahkan buku baru'}
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className={isEditMode ? "flex w-full gap-4 overflow-x-auto p-1 pb-8 lg:grid lg:grid-cols-2 lg:p-0 lg:overflow-visible snap-x snap-mandatory" : "space-y-6"}>
                    {/* Main Information Card */}
                    <div className={`flex flex-col h-full overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-neutral-200/60 ${isEditMode ? 'w-[85vw] flex-none snap-center sm:w-[500px] lg:w-auto lg:sticky lg:top-8' : ''}`}>
                        <div className="flex items-center justify-between border-b border-neutral-100 bg-neutral-50/50 px-6 py-4">
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                    <Book size={18} />
                                </div>
                                <h2 className="text-lg font-bold text-neutral-900">Informasi Buku</h2>
                            </div>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-neutral-900/20 hover:bg-neutral-800 hover:shadow-xl hover:shadow-neutral-900/10 disabled:opacity-70 disabled:shadow-none transition-all"
                            >
                                <Save size={16} />
                                {submitting ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </div>
                        <div className="p-6 md:p-8 h-[calc(100vh-18rem)] overflow-y-auto">
                            <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                                <div className="col-span-2">
                                    <label className="mb-2 block text-sm font-medium text-neutral-700">Judul Buku</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            required
                                            placeholder="Masukkan judul buku lengkap"
                                            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 py-2.5 pl-4 pr-4 transition-all focus:border-neutral-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900"
                                            value={formData.title}
                                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="col-span-2 md:col-span-1">
                                    <label className="mb-2 block text-sm font-medium text-neutral-700">
                                        <div className="flex items-center gap-2">
                                            <User size={14} className="text-neutral-400" />
                                            Penulis
                                        </div>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Nama penulis"
                                        className="w-full rounded-xl border border-neutral-200 bg-neutral-50 p-2.5 transition-all focus:border-neutral-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900"
                                        value={formData.author}
                                        onChange={e => setFormData({ ...formData, author: e.target.value })}
                                    />
                                </div>

                                <div className="col-span-2 md:col-span-1">
                                    <label className="mb-2 block text-sm font-medium text-neutral-700">
                                        <div className="flex items-center gap-2">
                                            <Building size={14} className="text-neutral-400" />
                                            Penerbit
                                        </div>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Nama penerbit"
                                        className="w-full rounded-xl border border-neutral-200 bg-neutral-50 p-2.5 transition-all focus:border-neutral-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900"
                                        value={formData.publisher}
                                        onChange={e => setFormData({ ...formData, publisher: e.target.value })}
                                    />
                                </div>

                                <div className="col-span-2 md:col-span-1">
                                    <label className="mb-2 block text-sm font-medium text-neutral-700">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={14} className="text-neutral-400" />
                                            Tahun Terbit
                                        </div>
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        placeholder="Contoh: 2023"
                                        className="w-full rounded-xl border border-neutral-200 bg-neutral-50 p-2.5 transition-all focus:border-neutral-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900"
                                        value={formData.year}
                                        onChange={e => setFormData({ ...formData, year: parseInt(e.target.value) })}
                                    />
                                </div>

                                <div className="col-span-2 md:col-span-1">
                                    <label className="mb-2 block text-sm font-medium text-neutral-700">
                                        <div className="flex items-center gap-2">
                                            <Hash size={14} className="text-neutral-400" />
                                            ISBN
                                        </div>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Nomor ISBN"
                                        className="w-full rounded-xl border border-neutral-200 bg-neutral-50 p-2.5 transition-all focus:border-neutral-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900"
                                        value={formData.isbn}
                                        onChange={e => setFormData({ ...formData, isbn: e.target.value })}
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="mb-2 block text-sm font-medium text-neutral-700">
                                        Kategori
                                    </label>
                                    <AsyncSelect
                                        placeholder="Pilih Kategori"
                                        loadOptions={loadCategoryOptions}
                                        value={selectedCategory}
                                        onChange={(option) => {
                                            setSelectedCategory(option);
                                            setFormData({ ...formData, categoryId: option?.id || '' });
                                        }}
                                    />
                                </div>

                                {!isEditMode && (
                                    <div className="col-span-2 rounded-xl border border-dashed border-neutral-200 bg-neutral-50/50 p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-xs font-bold text-neutral-600">i</div>
                                            <div className="flex-1">
                                                <label className="block text-sm font-medium text-neutral-900">
                                                    Jumlah Salinan Awal
                                                </label>
                                                <p className="mb-3 text-xs text-neutral-500">
                                                    Masukkan jumlah buku yang tersedia saat ini. Kode buku akan digenerate otomatis.
                                                </p>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    placeholder="Opsional (Default: 1)"
                                                    className="w-full max-w-xs rounded-lg border border-neutral-200 bg-white p-2 text-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                                                    value={formData.bookItemQuantity || ''}
                                                    onChange={e => setFormData({ ...formData, bookItemQuantity: parseInt(e.target.value) || undefined })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Copies Management Section (Only in Edit Mode) */}
                    {isEditMode && (
                        <div className="w-[85vw] flex-none snap-center sm:w-[500px] lg:w-auto flex flex-col h-full overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-neutral-200/60">
                            <div className="flex items-center justify-between border-b border-neutral-100 bg-neutral-50/50 px-6 py-4">
                                <h2 className="text-base font-semibold text-neutral-900">Daftar Salinan Buku</h2>
                                <button
                                    type="button"
                                    onClick={openAddModal}
                                    className="flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-neutral-900 shadow-sm ring-1 ring-neutral-200 hover:bg-neutral-50 hover:text-neutral-900 hover:ring-neutral-300 transition-all"
                                >
                                    <Plus size={14} />
                                    Tambah Salinan
                                </button>
                            </div>

                            <div className="p-6 h-[calc(100vh-18rem)] overflow-y-auto">
                                {bookItems.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-8 text-center">
                                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
                                            <Book size={20} />
                                        </div>
                                        <p className="text-sm font-medium text-neutral-900">Belum ada salinan</p>
                                        <p className="text-xs text-neutral-500">Tambahkan salinan buku fisik untuk mulai meminjamkan.</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-3 grid-cols-1">
                                        {bookItems.map(item => (
                                            <div key={item.id} className="group relative flex items-center justify-between overflow-hidden rounded-xl border border-neutral-200 bg-white p-3 transition-all hover:border-neutral-300 hover:shadow-sm">
                                                <div>
                                                    <div className="mb-1 flex items-center gap-2">
                                                        <span className="font-mono text-sm font-bold text-neutral-900">{item.code}</span>
                                                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${item.status === 'available' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                                                            }`}>
                                                            {item.status}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-neutral-500">{item.condition}</p>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(item)}
                                                        className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 opacity-0 transition-opacity hover:bg-blue-50 hover:text-blue-600 group-hover:opacity-100"
                                                        title="Edit Kondisi"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteCopy(item.id)}
                                                        className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                                                        title="Hapus Salinan"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </form>
            </div>

            <Modal
                isOpen={showCopyModal}
                onClose={() => setShowCopyModal(false)}
                title={editingItem ? 'Edit Kondisi Buku' : 'Tambah Salinan Buku'}
                width="max-w-sm"
                footer={
                    <>
                        <button
                            type="button"
                            onClick={() => setShowCopyModal(false)}
                            className="rounded-xl px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            onClick={handleSaveCopy}
                            className="rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-neutral-900/20 hover:bg-neutral-800 hover:shadow-xl hover:shadow-neutral-900/10 transition-all"
                        >
                            {editingItem ? 'Simpan Perubahan' : 'Tambahkan'}
                        </button>
                    </>
                }
            >
                <div>
                    <label className="mb-2 block text-sm font-medium text-neutral-700">Kondisi Buku</label>
                    <select
                        className="w-full rounded-xl border border-neutral-200 bg-neutral-50 p-2.5 outline-none transition-all focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                        value={copyCondition}
                        onChange={(e) => setCopyCondition(e.target.value)}
                    >
                        <option value="good">Good</option>
                        <option value="fair">Fair</option>
                        <option value="poor">Poor</option>
                    </select>
                </div>
                {!editingItem && (
                    <div className="mt-4">
                        <label className="mb-2 block text-sm font-medium text-neutral-700">Jumlah Salinan</label>
                        <input
                            type="number"
                            min="1"
                            max="100"
                            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 p-2.5 outline-none transition-all focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900"
                            value={copyQuantity}
                            onChange={(e) => setCopyQuantity(parseInt(e.target.value) || 1)}
                        />
                        <p className="mt-1 text-xs text-neutral-500">
                            Masukkan jumlah salinan yang ingin ditambahkan sekaligus.
                        </p>
                    </div>
                )}
            </Modal>

            <DeleteModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleConfirmDelete}
                title="Hapus Salinan Buku?"
                message="Apakah Anda yakin ingin menghapus salinan ini? Tindakan ini tidak dapat dibatalkan."
                confirmLabel="Ya, Hapus"
            />
        </div>
    );
};

export default BookForm;
