import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, AlertCircle, X, FileSpreadsheet, Trash2, Edit2, Check } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../components/Toast';
import { DeleteModal } from '../../components/DeleteModal';
import BackButton from '../../components/BackButton';
import { AsyncSelect, type Option } from '../../components/AsyncSelect';
import type { Category } from '../../types';
import { ApiError } from '../../lib/api-client';

interface BookPreview {
    title: string;
    author: string;
    publisher: string;
    year: number;
    isbn: string;
    // categoryCode removed
    goodQty: number;
    fairQty: number;
    poorQty: number;
    categoryId?: string; // Resolved ID (Manual selection)
    categoryOption?: Option | null;
    isValid?: boolean;
    error?: string;
}

const BookUpload: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [csvContent, setCsvContent] = useState('');
    const [fileName, setFileName] = useState('');
    const [loading, setLoading] = useState(false);
    const [previewData, setPreviewData] = useState<BookPreview[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [bulkCategoryOption, setBulkCategoryOption] = useState<Option | null>(null);

    // Edit state
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<BookPreview | null>(null);

    // Delete Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

    const loadCategoryOptions = async ({ page, keyword }: { page: number; keyword: string }) => {
        try {
            const response = await api.getCategories({ page, keyword, limit: 10 });
            return {
                options: response.data.map((c: Category) => ({ id: c.id, label: `${c.name} (${c.code})` })),
                hasMore: response.meta.current_page < response.meta.last_page
            };
        } catch (error) {
            console.error('Failed to load categories', error);
            return { options: [], hasMore: false };
        }
    };

    const processFile = (file: File) => {
        if (!file.name.endsWith('.csv')) {
            showToast('Harap upload file CSV yang valid', 'error');
            return;
        }

        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target?.result as string;
            setCsvContent(text);
            parsePreview(text);
        };
        reader.readAsText(file);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.currentTarget.contains(e.relatedTarget as Node)) {
            return;
        }
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'copy';
        setIsDragging(true);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const file = e.dataTransfer.files?.[0];
        if (file) {
            processFile(file);
        }
    };

    const handleRemoveFile = () => {
        setCsvContent('');
        setFileName('');
        setPreviewData([]);
        setEditingIndex(null);
    };

    const parsePreview = (content: string) => {
        const lines = content.split('\n');
        const parsed: BookPreview[] = [];

        for (const line of lines) {
            if (!line.trim()) continue;

            // Basic CSV parsing
            const parts = line.split(',').map(item => item.trim());
            // Expected: Title, Author, Publisher, Year, ISBN, GoodQty, FairQty, PoorQty
            if (parts.length >= 8) {
                const [title, author, publisher, yearStr, isbn, goodQtyStr, fairQtyStr, poorQtyStr] = parts;

                // Skip header
                if (title.toLowerCase() === 'title' || title.toLowerCase() === 'judul') continue;

                // Validate & Map
                const year = parseInt(yearStr) || new Date().getFullYear();
                const goodQty = parseInt(goodQtyStr) || 0;
                const fairQty = parseInt(fairQtyStr) || 0;
                const poorQty = parseInt(poorQtyStr) || 0;

                // Find Category ID by Code (or Name as fallback)
                // Removed auto-mapping for now as requested, manual selection required

                parsed.push({
                    title,
                    author,
                    publisher,
                    year,
                    isbn,
                    goodQty,
                    fairQty,
                    poorQty,
                    categoryId: undefined, // Must be selected manually
                    categoryOption: null,
                    isValid: false, // Invalid until category selected
                    error: 'Pilih kategori'
                });
            }
        }
        setPreviewData(parsed);
    };

    const handleProcess = async () => {
        const validData = previewData.filter(item => item.isValid);
        if (validData.length === 0) {
            showToast('Tidak ada data valid untuk diimpor.', 'error');
            return;
        }

        setLoading(true);
        try {
            const payload = validData.map(item => ({
                title: item.title,
                author: item.author,
                publisher: item.publisher,
                year: item.year,
                categoryId: item.categoryId!, // Safe assertion due to filter
                isbn: item.isbn,
                items: [
                    { condition: 'good', quantity: item.goodQty },
                    { condition: 'fair', quantity: item.fairQty },
                    { condition: 'poor', quantity: item.poorQty }
                ].filter(i => i.quantity > 0)
            }));

            const response = await api.createBookBatch(payload);
            if (response && response.status === 'success') {
                showToast(`Berhasil mengimpor ${response.meta.created_books} buku dan ${response.meta.created_items} salinan.`, 'success');
                navigate('/dashboard/books');
            } else {
                showToast('Gagal mengimpor data buku. ', 'error');
            }
        } catch (err) {
            console.error(err);
            if (err instanceof ApiError) {
                showToast(err.message, 'error');
                if (err.fields) {
                    Object.entries(err.fields).forEach(([_, messages]) => {
                        showToast(messages[0], 'error');
                    });
                }
            } else {
                showToast('Terjadi kesalahan saat memproses data.', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleBulkCategoryApply = () => {
        if (!bulkCategoryOption) return;

        const newData = previewData.map(item => {
            const hasQty = (item.goodQty + item.fairQty + item.poorQty > 0);
            return {
                ...item,
                categoryId: bulkCategoryOption.id,
                categoryOption: bulkCategoryOption,
                isValid: !!bulkCategoryOption.id && hasQty,
                error: !bulkCategoryOption.id ? 'Pilih kategori' : (!hasQty ? 'Total quantity 0' : undefined)
            };
        });
        setPreviewData(newData);
        showToast('Kategori diterapkan ke semua data', 'success');
    };

    // Edit Handlers
    const startEditing = (index: number, item: BookPreview) => {
        setEditingIndex(index);
        setEditForm({ ...item });
    };

    const cancelEditing = () => {
        setEditingIndex(null);
        setEditForm(null);
    };

    const handleCategoryChange = (index: number, option: Option | null) => {
        const newData = [...previewData];
        const item = newData[index];
        const hasQty = (item.goodQty + item.fairQty + item.poorQty > 0);

        newData[index] = {
            ...item,
            categoryId: option?.id,
            categoryOption: option,
            isValid: !!option?.id && hasQty,
            error: !option?.id ? 'Pilih kategori' : (!hasQty ? 'Total quantity 0' : undefined)
        };
        setPreviewData(newData);
    };

    const saveEditing = (index: number) => {
        if (!editForm) return;

        const newData = [...previewData];
        const hasQty = (editForm.goodQty + editForm.fairQty + editForm.poorQty > 0);

        newData[index] = {
            ...editForm,
            // categoryId preserved from editForm or existing
            isValid: !!editForm.categoryId && hasQty,
            error: !editForm.categoryId ? 'Pilih kategori' : (!hasQty ? 'Total quantity 0' : undefined)
        };

        setPreviewData(newData);
        setEditingIndex(null);
        setEditForm(null);
        showToast('Data berhasil diperbarui', 'success');
    };

    const handleDeleteRow = (index: number) => {
        setDeleteIndex(index);
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = () => {
        if (deleteIndex === null) return;

        const newData = previewData.filter((_, i) => i !== deleteIndex);
        setPreviewData(newData);
        if (editingIndex === deleteIndex) {
            cancelEditing();
        } else if (editingIndex !== null && editingIndex > deleteIndex) {
            setEditingIndex(editingIndex - 1);
        }

        setShowDeleteModal(false);
        setDeleteIndex(null);
    };

    return (
        <div className="flex h-[calc(100vh-64px)] flex-col gap-4 bg-neutral-50 p-6 md:flex-row animate-in fade-in duration-500">
            {/* Left Column: Upload & Config */}
            <div className="flex w-full flex-col gap-6 md:w-1/3 md:min-w-[400px]">
                <div className="flex items-center gap-4">
                    <BackButton to="/dashboard/books"></BackButton>
                    <div>
                        <h1 className="text-xl font-bold text-neutral-900">Upload Buku</h1>
                        <p className="text-sm text-neutral-600">Impor data buku dari CSV</p>
                    </div>
                </div>

                <div className="flex flex-1 flex-col rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                    {/* Instructions */}
                    <div className="mb-6 rounded-xl bg-blue-50 p-4">
                        <h3 className="mb-2 text-sm font-bold text-blue-900 flex items-center gap-2">
                            <AlertCircle size={16} />
                            Format CSV
                        </h3>
                        <p className="mb-2 text-xs text-blue-800">
                            Pastikan file CSV memiliki kolom:
                        </p>
                        <div className="rounded border border-blue-200 bg-white p-2 text-xs font-mono text-neutral-600 overflow-x-auto whitespace-nowrap">
                            Title, Author, Publisher, Year, ISBN, GoodQty, FairQty, PoorQty<br />
                            Laskar Pelangi, Andrea Hirata, Bentang, 2005, 978-..., 5, 2, 0
                        </div>
                    </div>

                    {/* Upload Area */}
                    <div className="flex-1">
                        {!csvContent ? (
                            <div
                                onClick={() => document.getElementById('csv-input')?.click()}
                                onDragEnter={handleDragEnter}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`
                                    pointer-events-auto group relative flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-all
                                    ${isDragging
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-neutral-300 bg-neutral-50 hover:border-blue-500 hover:bg-blue-50'}
                                `}
                            >
                                <div className="pointer-events-none flex flex-col items-center justify-center text-center">
                                    <div className={`
                                        mb-4 rounded-full p-4 transition-transform
                                        ${isDragging ? 'bg-blue-200 text-blue-700 scale-110' : 'bg-blue-100 text-blue-600 group-hover:scale-110'}
                                    `}>
                                        <Upload size={32} />
                                    </div>
                                    <p className="mb-1 text-base font-medium text-neutral-900">
                                        {isDragging ? 'Lepaskan file disini' : 'Upload File CSV'}
                                    </p>
                                    <p className="text-xs text-neutral-500">
                                        {isDragging ? 'File CSV saja' : 'Klik atau drag & drop'}
                                    </p>
                                </div>
                                <input id="csv-input" type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
                            </div>
                        ) : (
                            <div className="relative flex items-center gap-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-green-600">
                                    <FileSpreadsheet size={24} />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="truncate text-sm font-medium text-neutral-900">{fileName}</p>
                                    <p className="text-xs text-neutral-500">{previewData.length} baris data ditemukan</p>
                                </div>
                                <button
                                    onClick={handleRemoveFile}
                                    className="rounded-lg p-2 text-neutral-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                                    title="Hapus file"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="mt-6 flex justify-end gap-3 pt-6 border-t border-neutral-100">
                        <button
                            onClick={() => navigate('/dashboard/books')}
                            className="rounded-lg px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleProcess}
                            disabled={!csvContent || loading || previewData.filter(i => i.isValid).length === 0}
                            className="flex items-center gap-2 rounded-lg bg-neutral-900 px-6 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                    Memproses...
                                </>
                            ) : (
                                `Impor (${previewData.filter(i => i.isValid).length})`
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Right Column: Preview */}
            <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
                <div className="border-b border-neutral-200 px-6 py-4 flex items-center justify-between">
                    <h3 className="flex items-center gap-2 font-bold text-neutral-900">
                        <FileText size={20} />
                        Preview Data
                        {previewData.length > 0 && (
                            <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs font-medium text-neutral-600">
                                {previewData.length}
                            </span>
                        )}
                    </h3>
                </div>

                {/* Bulk Actions */}
                {previewData.length > 0 && (
                    <div className="flex flex-wrap items-center gap-3 border-b border-neutral-200 bg-white px-6 py-3">
                        <span className="text-sm font-medium text-neutral-600">Set Kategori Massal:</span>
                        <div className="w-[300px]">
                            <AsyncSelect
                                placeholder="Cari kategori..."
                                loadOptions={loadCategoryOptions}
                                value={bulkCategoryOption}
                                onChange={setBulkCategoryOption}
                                className="bg-white"
                            />
                        </div>
                        <button
                            onClick={handleBulkCategoryApply}
                            disabled={!bulkCategoryOption}
                            className="rounded-lg bg-neutral-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50 transition-colors"
                        >
                            Terapkan ke Semua
                        </button>
                    </div>
                )}

                <div className="flex-1 overflow-auto bg-white">
                    {previewData.length > 0 ? (
                        <table className="w-full text-left text-sm">
                            <thead className="sticky top-0 bg-neutral-50 text-neutral-500 z-10 shadow-sm">
                                <tr>
                                    <th className="px-6 py-3 bg-neutral-50 font-bold">Judul</th>
                                    <th className="px-6 py-3 bg-neutral-50 font-bold">ISBN</th>
                                    <th className="px-6 py-3 bg-neutral-50 font-bold">Penulis</th>
                                    <th className="px-6 py-3 bg-neutral-50 border-r border-neutral-100 font-bold">Kategori</th>
                                    <th className="px-6 py-3 bg-neutral-50 text-right w-20 font-bold">Good</th>
                                    <th className="px-6 py-3 bg-neutral-50 text-right w-20 font-bold">Fair</th>
                                    <th className="px-6 py-3 bg-neutral-50 text-right w-20 font-bold">Poor</th>
                                    <th className="px-6 py-3 bg-neutral-50 text-right w-20 font-bold">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {previewData.map((item, index) => (
                                    <tr key={index} className={`hover:bg-neutral-50 group ${!item.isValid ? 'bg-red-100/50' : ''}`}>
                                        {editingIndex === index && editForm ? (
                                            <>
                                                <td className="px-2 py-3">
                                                    <input
                                                        className="w-full rounded-xl border border-neutral-200 bg-neutral-50 p-2.5 transition-all focus:border-neutral-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900"
                                                        value={editForm.title}
                                                        onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                                                    />
                                                </td>
                                                <td className="px-2 py-3">
                                                    <input
                                                        className="w-full rounded-xl border border-neutral-200 bg-neutral-50 p-2.5 transition-all focus:border-neutral-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900"
                                                        value={editForm.isbn}
                                                        onChange={e => setEditForm({ ...editForm, isbn: e.target.value })}
                                                    />
                                                </td>
                                                <td className="px-2 py-3">
                                                    <input
                                                        className="w-full rounded-xl border border-neutral-200 bg-neutral-50 p-2.5 transition-all focus:border-neutral-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900"
                                                        value={editForm.author}
                                                        onChange={e => setEditForm({ ...editForm, author: e.target.value })}
                                                    />
                                                </td>
                                                <td className="px-6 py-3 border-r border-neutral-100 min-w-[200px]">
                                                    <AsyncSelect
                                                        placeholder="Pilih Kategori"
                                                        loadOptions={loadCategoryOptions}
                                                        value={editForm.categoryOption}
                                                        onChange={(option) => setEditForm({ ...editForm, categoryId: option?.id, categoryOption: option })}
                                                        className="text-xs"
                                                    />
                                                </td>
                                                <td className="px-2 py-3 text-right">
                                                    <input
                                                        type="number"
                                                        className="w-full rounded-xl border border-neutral-200 bg-neutral-50 p-2.5 transition-all focus:border-neutral-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900 "
                                                        value={editForm.goodQty}
                                                        onChange={e => setEditForm({ ...editForm, goodQty: parseInt(e.target.value) || 0 })}
                                                    />
                                                </td>
                                                <td className="px-2 py-3 text-right">
                                                    <input
                                                        type="number"
                                                        className="w-full rounded-xl border border-neutral-200 bg-neutral-50 p-2.5 transition-all focus:border-neutral-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900 "
                                                        value={editForm.fairQty}
                                                        onChange={e => setEditForm({ ...editForm, fairQty: parseInt(e.target.value) || 0 })}
                                                    />
                                                </td>
                                                <td className="px-2 py-3 text-right">
                                                    <input
                                                        type="number"
                                                        className="w-full rounded-xl border border-neutral-200 bg-neutral-50 p-2.5 transition-all focus:border-neutral-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900 "
                                                        value={editForm.poorQty}
                                                        onChange={e => setEditForm({ ...editForm, poorQty: parseInt(e.target.value) || 0 })}
                                                    />
                                                </td>
                                                <td className="px-6 py-3 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button onClick={() => saveEditing(index)} className="text-green-600"><Check size={16} /></button>
                                                        <button onClick={cancelEditing} className="text-red-600"><X size={16} /></button>
                                                    </div>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td className="px-6 py-3">
                                                    <div className="font-medium text-neutral-900">{item.title}</div>
                                                </td>
                                                <td className="px-6 py-3">
                                                    <div className="font-medium text-neutral-900">{item.isbn}</div>
                                                </td>
                                                <td className="px-6 py-3 text-neutral-600">{item.author}</td>
                                                <td className="px-6 py-3 border-r border-neutral-100 min-w-[200px]">
                                                    <AsyncSelect
                                                        placeholder="Pilih Kategori"
                                                        loadOptions={loadCategoryOptions}
                                                        value={item.categoryOption}
                                                        onChange={(option) => handleCategoryChange(index, option)}
                                                        className={`text-xs ${!item.categoryId ? 'border-red-200' : ''}`}
                                                    />
                                                </td>
                                                <td className="px-6 py-3 text-right font-mono text-green-600">
                                                    {item.goodQty > 0 ? item.goodQty : '-'}
                                                </td>
                                                <td className="px-6 py-3 text-right font-mono text-yellow-600">
                                                    {item.fairQty > 0 ? item.fairQty : '-'}
                                                </td>
                                                <td className="px-6 py-3 text-right font-mono text-red-600">
                                                    {item.poorQty > 0 ? item.poorQty : '-'}
                                                </td>
                                                <td className="px-6 py-3 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => startEditing(index, item)}
                                                            className="rounded p-1.5 text-neutral-400 opacity-0 group-hover:opacity-100 hover:bg-neutral-100 hover:text-blue-600 transition-all"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteRow(index)}
                                                            className="rounded p-1.5 text-neutral-400 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 transition-all"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="flex h-full flex-col items-center justify-center text-neutral-400">
                            <FileSpreadsheet size={48} className="mb-4 opacity-20" />
                            <p className="text-sm">Upload file CSV untuk melihat preview data</p>
                        </div>
                    )}
                </div>
            </div>
            <DeleteModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleConfirmDelete}
                title="Hapus Data Preview?"
                message="Apakah Anda yakin ingin menghapus data ini dari preview?"
                confirmLabel="Ya, Hapus"
            />
        </div>
    );
};

export default BookUpload;
