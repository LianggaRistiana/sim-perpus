import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { User, Hash, Edit, Trash2, Mail, Shield } from 'lucide-react';
import { api } from '../../services/api';
import type { Librarian } from '../../types';
import BackButton from '../../components/BackButton';
import { LoadingScreen } from '../../components/LoadingScreen';
import { useToast } from '../../components/Toast';
import { DeleteModal } from '../../components/DeleteModal';

const LibrarianDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [librarian, setLibrarian] = useState<Librarian | null>(null);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const data = await api.getLibrarianById(id);
            if (data) {
                setLibrarian(data);
            } else {
                navigate('/dashboard/librarians');
            }
        } catch (error) {
            console.error('Error fetching librarian:', error);
            navigate('/dashboard/librarians');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = () => {
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!id) return;

        try {
            const response = await api.deleteLibrarian(id);
            if (response) {
                showToast('Pustakawan berhasil dihapus', 'success');
                navigate('/dashboard/librarians');
            } else {
                showToast('Gagal menghapus pustakawan', 'error');
            }
        } catch (error: any) {
            console.error('Error deleting librarian:', error);
            let message = error?.message || 'Gagal menghapus pustakawan';
            
            if (error?.fields) {
                const fieldErrors = Object.values(error.fields).flat();
                if (fieldErrors.length > 0) {
                    message = `${message}: ${fieldErrors[0]}`;
                }
            }

            showToast(message, 'error');
        } finally {
            setShowDeleteModal(false);
        }
    };

    if (loading) {
        return <LoadingScreen message="Memuat data pustakawan..." />;
    }

    if (!librarian) {
        return null;
    }

    return (
        <div className="min-h-screen bg-neutral-50/50 pb-32 pt-8 p-6 md:p-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                    <BackButton to='/dashboard/librarians' />
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
                            Detail Pustakawan
                        </h1>
                        <p className="text-sm text-neutral-500">
                            Informasi detail data pustakawan
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link
                        to={`/dashboard/librarians/${id}/edit`}
                        className="flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
                    >
                        <Edit size={18} />
                        Edit Pustakawan
                    </Link>
                    <button
                        onClick={handleDelete}
                        className="flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                        <Trash2 size={18} />
                        Hapus
                    </button>
                </div>
            </div>

            <div className="mx-auto max-w-2xl space-y-8">
                <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-neutral-200/60">
                    <div className="flex items-center justify-between border-b border-neutral-100 bg-neutral-50/50 px-6 py-4">
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                <User size={18} />
                            </div>
                            <h2 className="text-lg font-bold text-neutral-900">Informasi Pustakawan</h2>
                        </div>
                    </div>

                    <div className="p-6 md:p-8">
                        <div className="space-y-6">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-neutral-700">
                                    <div className="flex items-center gap-2">
                                        <User size={14} className="text-neutral-400" />
                                        Nama Lengkap
                                    </div>
                                </label>
                                <div className="w-full rounded-xl border border-neutral-200 bg-neutral-50 p-2.5 text-neutral-900">
                                    {librarian.name}
                                </div>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-neutral-700">
                                    <div className="flex items-center gap-2">
                                        <Hash size={14} className="text-neutral-400" />
                                        NIP / User Number
                                    </div>
                                </label>
                                <div className="w-full rounded-xl border border-neutral-200 bg-neutral-50 p-2.5 text-neutral-900">
                                    {librarian.user_number}
                                </div>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-neutral-700">
                                    <div className="flex items-center gap-2">
                                        <Mail size={14} className="text-neutral-400" />
                                        Email
                                    </div>
                                </label>
                                <div className="w-full rounded-xl border border-neutral-200 bg-neutral-50 p-2.5 text-neutral-900">
                                    {librarian.email}
                                </div>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-neutral-700">
                                    <div className="flex items-center gap-2">
                                        <Shield size={14} className="text-neutral-400" />
                                        Role
                                    </div>
                                </label>
                                <div className="w-full rounded-xl border border-neutral-200 bg-neutral-50 p-2.5 text-neutral-900 capitalize">
                                    {librarian.role}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <DeleteModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Hapus Pustakawan?"
                message="Apakah Anda yakin ingin menghapus pustakawan ini? Tindakan ini tidak dapat dibatalkan."
                confirmLabel="Ya, Hapus"
            />
        </div>
    );
};

export default LibrarianDetail;
