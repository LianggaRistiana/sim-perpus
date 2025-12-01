import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Upload, Trash2, Search } from 'lucide-react';
import { api } from '../../services/api';
import type { Student } from '../../types';

const StudentList: React.FC = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await api.getStudents();
            setStudents(data);
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus siswa ini?')) {
            await api.deleteStudent(id);
            fetchData();
        }
    };

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.nis.includes(searchTerm)
    );

    return (
        <div className="min-h-screen bg-neutral-50 p-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Manajemen Anggota</h1>
                    <p className="text-neutral-600">Kelola data siswa/anggota perpustakaan</p>
                </div>
                <Link
                    to="/dashboard/students/upload"
                    className="flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
                >
                    <Upload size={20} />
                    Upload CSV
                </Link>
            </div>

            <div className="mb-6">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Cari nama atau NIS..."
                        className="w-full rounded-lg border border-neutral-200 py-2 pl-10 pr-4 focus:border-blue-500 focus:outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-neutral-50 text-neutral-500">
                        <tr>
                            <th className="px-6 py-4 font-medium">NIS</th>
                            <th className="px-6 py-4 font-medium">Nama Lengkap</th>
                            <th className="px-6 py-4 font-medium text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                        {loading ? (
                            <tr>
                                <td colSpan={3} className="px-6 py-8 text-center text-neutral-500">
                                    Memuat data...
                                </td>
                            </tr>
                        ) : filteredStudents.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="px-6 py-8 text-center text-neutral-500">
                                    Tidak ada siswa ditemukan.
                                </td>
                            </tr>
                        ) : (
                            filteredStudents.map((student) => (
                                <tr key={student.id} className="hover:bg-neutral-50">
                                    <td className="px-6 py-4 font-medium text-neutral-900">{student.nis}</td>
                                    <td className="px-6 py-4 text-neutral-600">{student.name}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleDelete(student.id)}
                                            className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 hover:text-red-600"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StudentList;
