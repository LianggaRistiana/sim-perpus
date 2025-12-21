import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { User, Hash, Edit, Trash2, FileText } from 'lucide-react';
import { api } from '../../services/api';
import type { Student } from '../../types';
import BackButton from '../../components/BackButton';
import { LoadingScreen } from '../../components/LoadingScreen';
import { useToast } from '../../components/Toast';
import { DeleteModal } from '../../components/DeleteModal';

const StudentDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [student, setStudent] = useState<Student | null>(null);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const data = await api.getStudentById(id);
            if (data) {
                setStudent(data);
            } else {
                navigate('/dashboard/students');
            }
        } catch (error) {
            console.error('Error fetching student:', error);
            navigate('/dashboard/students');
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
            const response = await api.deleteStudent(id);
            if (response) {
                showToast('Siswa berhasil dihapus', 'success');
                navigate('/dashboard/students');
            } else {
                showToast('Gagal menghapus siswa', 'error');
            }
        } catch (error) {
            console.error('Error deleting student:', error);
            showToast('Gagal menghapus siswa', 'error');
        } finally {
            setShowDeleteModal(false);
        }
    };

    if (loading) {
        return <LoadingScreen message="Memuat data siswa..." />;
    }

    if (!student) {
        return null;
    }

    return (
        <div className="min-h-screen bg-neutral-50/50 pb-32 pt-8 p-6 md:p-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                    <BackButton to='/dashboard/students' />
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
                            Detail Siswa
                        </h1>
                        <p className="text-sm text-neutral-500">
                            Informasi detail data siswa
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Link
                        to={`/dashboard/students/${id}/edit`}
                        className="flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
                    >
                        <Edit size={18} />
                        Edit Siswa
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
                            <h2 className="text-lg font-bold text-neutral-900">Informasi Siswa</h2>
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
                                    {student.name}
                                </div>
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-neutral-700">
                                    <div className="flex items-center gap-2">
                                        <Hash size={14} className="text-neutral-400" />
                                        NIS / User Number
                                    </div>
                                </label>
                                <div className="w-full rounded-xl border border-neutral-200 bg-neutral-50 p-2.5 text-neutral-900">
                                    {student.user_number}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Search Box */}
                <div className="grid gap-4 grid-cols-2">
                    <div
                        onClick={() => navigate(`/dashboard/transactions?search=${encodeURIComponent(student.name)}`)}
                        className="group relative flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 p-4 md:p-8 transition-all hover:border-blue-500 hover:bg-blue-50"
                    >
                        <div className="flex flex-col items-center justify-center text-center">
                            <div className="mb-4 rounded-full bg-blue-50 p-3 md:p-4 text-blue-600 group-hover:bg-white transition-transform group-hover:scale-110">
                                <User size={24} className="md:w-8 md:h-8" />
                            </div>
                            <p className="mb-1 text-base font-medium text-neutral-900">
                                Lihat semua peminjaman {student.name}
                            </p>
                            <p className="text-xs text-neutral-500">
                                Lihat semua peminjaman yang dilakukan oleh {student.name}
                            </p>
                        </div>
                    </div>
                    <div
                        onClick={() => navigate(`/dashboard/reports/members?search=${encodeURIComponent(student.user_number)}`)}
                        className="group relative flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 p-4 md:p-8 transition-all hover:border-blue-500 hover:bg-blue-50"
                    >
                        <div className="flex flex-col items-center justify-center text-center">
                            <div className="mb-4 rounded-full bg-blue-50 p-3 md:p-4 text-blue-600 group-hover:bg-white transition-transform group-hover:scale-110">
                                <FileText size={24} className="md:w-8 md:h-8" />
                            </div>
                            <p className="mb-1 text-base font-medium text-neutral-900">
                                Lihat laporan peminjaman {student.name}
                            </p>
                            <p className="text-xs text-neutral-500">
                                Lihat laporan peminjaman yang dilakukan oleh {student.name}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <DeleteModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Hapus Siswa?"
                message="Apakah Anda yakin ingin menghapus siswa ini? Tindakan ini tidak dapat dibatalkan."
                confirmLabel="Ya, Hapus"
            />
        </div>
    );
};

export default StudentDetail;
