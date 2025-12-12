import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../components/Toast';
import type { Student } from '../../types';

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

    return (
        <div className="min-h-screen bg-neutral-50 p-8">
            <div className="mx-auto max-w-2xl">
                <div className="mb-8 flex items-center gap-4">
                    <button
                        onClick={() => navigate('/dashboard/students')}
                        className="rounded-lg p-2 hover:bg-neutral-200"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900">
                            {isEditMode ? 'Edit Siswa' : 'Tambah Siswa Baru'}
                        </h1>
                        <p className="text-neutral-600">
                            {isEditMode ? 'Perbarui informasi siswa' : 'Masukkan detail siswa baru'}
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                        <div className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-neutral-700">Nama Lengkap</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full rounded-lg border border-neutral-300 p-2.5 focus:border-blue-500 focus:outline-none"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium text-neutral-700">User Number</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full rounded-lg border border-neutral-300 p-2.5 focus:border-blue-500 focus:outline-none"
                                    value={formData.user_number}
                                    onChange={e => setFormData({ ...formData, user_number: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard/students')}
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
                            {loading ? 'Menyimpan...' : 'Simpan Siswa'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default StudentForm;
