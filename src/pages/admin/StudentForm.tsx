import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, User, Hash } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../components/Toast';
import type { Student } from '../../types';
import BackButton from '../../components/BackButton';

const StudentForm: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [formData, setFormData] = useState<Partial<Student>>({
        name: '',
        user_number: '',
    });
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        if (isEditMode) {
            fetchData();
        }
    }, [id]);


    const fetchData = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const data = await api.getStudentById(id);
            if (data) {
                setFormData({
                    name: data.name,
                    user_number: data.user_number,
                });
            }
        } catch (error) {
            console.error('Error fetching student:', error);
            showToast('Gagal memuat data siswa', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isEditMode && id) {
                const response = await api.updateStudent(id, formData);
                if (response) {
                    showToast('Siswa berhasil diperbarui', 'success');
                    navigate('/dashboard/students');
                } else {
                    showToast('Gagal memperbarui siswa', 'error');
                }
            } else {
                const response = await api.addStudent(formData as Omit<Student, 'id'>);
                if (response) {
                    showToast('Siswa berhasil ditambahkan', 'success');
                    navigate('/dashboard/students');
                } else {
                    showToast('Gagal menambahkan siswa', 'error');
                }
            }
        } catch (error) {
            console.error('Error saving student:', error);
            showToast('Terjadi kesalahan saat menyimpan siswa', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEditMode && !formData.name) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-neutral-50">
                <div className="text-center">
                    <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-neutral-300 border-t-neutral-900 mx-auto"></div>
                    <p className="text-neutral-600">Memuat data siswa...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50/50 pb-32 pt-8 p-6 md:p-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                    <BackButton to='/dashboard/students' />
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
                            {isEditMode ? 'Edit Siswa' : 'Tambah Siswa Baru'}
                        </h1>
                        <p className="text-sm text-neutral-500">
                            {isEditMode ? 'Perbarui informasi dan data siswa' : 'Tambahkan data siswa baru ke dalam sistem'}
                        </p>
                    </div>
                </div>
            </div>
            <div className="mx-auto max-w-2xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-neutral-200/60">
                        <div className="flex items-center justify-between border-b border-neutral-100 bg-neutral-50/50 px-6 py-4">
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                    <User size={18} />
                                </div>
                                <h2 className="text-lg font-bold text-neutral-900">Informasi Siswa</h2>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-neutral-900/20 hover:bg-neutral-800 hover:shadow-xl hover:shadow-neutral-900/10 disabled:opacity-70 disabled:shadow-none transition-all"
                            >
                                <Save size={16} />
                                {loading ? 'Menyimpan...' : 'Simpan'}
                            </button>
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
                                    <input
                                        type="text"
                                        required
                                        placeholder="Contoh: Budi Santoso"
                                        className="w-full rounded-xl border border-neutral-200 bg-neutral-50 p-2.5 transition-all focus:border-neutral-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-neutral-700">
                                        <div className="flex items-center gap-2">
                                            <Hash size={14} className="text-neutral-400" />
                                            NIS / User Number
                                        </div>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Contoh: 12345678"
                                        className="w-full rounded-xl border border-neutral-200 bg-neutral-50 p-2.5 transition-all focus:border-neutral-900 focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900"
                                        value={formData.user_number}
                                        onChange={e => setFormData({ ...formData, user_number: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StudentForm;
