import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, AlertCircle, X, FileSpreadsheet, Trash2, Edit2, Check } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../components/Toast';
import { DeleteModal } from '../../components/DeleteModal';
import type { Student } from '../../types';
import BackButton from '../../components/BackButton';

const StudentUpload: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [csvContent, setCsvContent] = useState('');
    const [fileName, setFileName] = useState('');
    const [loading, setLoading] = useState(false);
    const [previewData, setPreviewData] = useState<Omit<Student, 'id'>[]>([]);
    const [isDragging, setIsDragging] = useState(false);

    // Edit state
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<Omit<Student, 'id'>>({ user_number: '', name: '' });

    // Delete Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

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

        // Prevent flickering when dragging over child elements
        if (e.currentTarget.contains(e.relatedTarget as Node)) {
            return;
        }
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // Ensure drop effect is copy
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
        const parsed: Omit<Student, 'id'>[] = [];

        for (const line of lines) {
            const [user_number, name] = line.split(',').map(item => item.trim());
            if (user_number && name) {
                // Simple header check
                const isHeader = user_number.toLowerCase() === 'user number' || user_number.toLowerCase() === 'nis';
                if (!isHeader) {
                    parsed.push({ user_number, name });
                }
            }
        }
        setPreviewData(parsed);
    };

    const handleProcess = async () => {
        if (previewData.length === 0) {
            showToast('Tidak ada data valid untuk diimpor.', 'error');
            return;
        }

        setLoading(true);
        try {
            const response = await api.batchCreateStudents(previewData);
            if (response && response.status === 'success') {
                showToast(`Berhasil mengimpor ${previewData.length} data siswa.`, 'success');
                navigate('/dashboard/students');
            } else {
                showToast('Gagal mengimpor data siswa.', 'error');
            }
        } catch (err :any) {
            console.error(err);
            let message = 'Terjadi kesalahan saat memproses data';
            showToast(message, 'error');
            
            if (err?.fields) {
                for (const field of Object.keys(err.fields)) {
                    showToast(err.fields[field][0], 'error');
                }
            }
        } finally {
            setLoading(false);
        }
    };

    // Edit Handlers
    const startEditing = (index: number, student: Omit<Student, 'id'>) => {
        setEditingIndex(index);
        setEditForm({ ...student });
    };

    const cancelEditing = () => {
        setEditingIndex(null);
        setEditForm({ user_number: '', name: '' });
    };

    const saveEditing = (index: number) => {
        const newData = [...previewData];
        newData[index] = editForm;
        setPreviewData(newData);
        setEditingIndex(null);
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
                    <BackButton to="/dashboard/students"></BackButton>
                    <div>
                        <h1 className="text-xl font-bold text-neutral-900">Upload Siswa</h1>
                        <p className="text-sm text-neutral-600">Impor data dari CSV</p>
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
                        <div className="rounded border border-blue-200 bg-white p-2 text-xs font-mono text-neutral-600">
                            User Number, Nama Lengkap<br />
                            12345, Budi Santoso
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
                            onClick={() => navigate('/dashboard/students')}
                            className="rounded-lg px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
                        >
                            Batal
                        </button>
                        <button
                            onClick={handleProcess}
                            disabled={!csvContent || loading}
                            className="flex items-center gap-2 rounded-lg bg-neutral-900 px-6 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                    Memproses...
                                </>
                            ) : (
                                'Mulai Impor'
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Right Column: Preview */}
            <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
                <div className="border-b border-neutral-200 px-6 py-4">
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

                <div className="flex-1 overflow-auto bg-white">
                    {previewData.length > 0 ? (
                        <table className="w-full text-left text-sm">
                            <thead className="sticky top-0 bg-neutral-50 text-neutral-500 z-10 shadow-sm">
                                <tr>
                                    <th className="px-6 py-3 font-medium bg-neutral-50">No</th>
                                    <th className="px-6 py-3 font-medium bg-neutral-50 w-1/3">User Number</th>
                                    <th className="px-6 py-3 font-medium bg-neutral-50 w-1/3">Nama Lengkap</th>
                                    <th className="px-6 py-3 font-medium bg-neutral-50 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {previewData.map((item, index) => (
                                    <tr key={index} className="hover:bg-neutral-50 group">
                                        <td className="px-6 py-3 text-neutral-400 w-16">{index + 1}</td>

                                        {/* User Number Column */}
                                        <td className="px-6 py-3">
                                            {editingIndex === index ? (
                                                <input
                                                    type="text"
                                                    value={editForm.user_number}
                                                    onChange={(e) => setEditForm(prev => ({ ...prev, user_number: e.target.value }))}
                                                    className="w-full rounded border border-neutral-300 px-3 py-1.5 font-mono text-sm focus:border-blue-500 focus:outline-none"
                                                />
                                            ) : (
                                                <span className="font-mono text-neutral-900">{item.user_number}</span>
                                            )}
                                        </td>

                                        {/* Name Column */}
                                        <td className="px-6 py-3">
                                            {editingIndex === index ? (
                                                <input
                                                    type="text"
                                                    value={editForm.name}
                                                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                                    className="w-full rounded border border-neutral-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                                                />
                                            ) : (
                                                <span className="text-neutral-900">{item.name}</span>
                                            )}
                                        </td>

                                        {/* Actions Column */}
                                        <td className="px-6 py-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                {editingIndex === index ? (
                                                    <>
                                                        <button
                                                            onClick={() => saveEditing(index)}
                                                            className="rounded p-1.5 text-green-600 hover:bg-green-50 hover:text-green-700"
                                                            title="Simpan"
                                                        >
                                                            <Check size={16} />
                                                        </button>
                                                        <button
                                                            onClick={cancelEditing}
                                                            className="rounded p-1.5 text-red-600 hover:bg-red-50 hover:text-red-700"
                                                            title="Batal"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => startEditing(index, item)}
                                                            className="rounded p-1.5 text-neutral-400 opacity-0 group-hover:opacity-100 hover:bg-neutral-100 hover:text-blue-600 transition-all"
                                                            title="Edit"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteRow(index)}
                                                            className="rounded p-1.5 text-neutral-400 opacity-0 group-hover:opacity-100 hover:bg-red-50 hover:text-red-500 transition-all"
                                                            title="Hapus"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
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

                {previewData.length > 0 && (
                    <div className="border-t border-neutral-200 bg-neutral-50 px-6 py-3 text-xs text-neutral-500">
                        Menampilkan {previewData.length} baris data siap impor.
                    </div>
                )}
            </div>
            <DeleteModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleConfirmDelete}
                title="Hapus Data Preview?"
                message="Apakah Anda yakin ingin menghapus data ini dari preview? Tindakan ini hanya menghapus dari daftar sementara, bukan file asli."
                confirmLabel="Ya, Hapus"
            />
        </div>
    );
};

export default StudentUpload;