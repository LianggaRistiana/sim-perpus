import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Upload, Trash2, Search, Edit, Plus } from 'lucide-react';
import { Pagination } from '../../components/Pagination';
import { api } from '../../services/api';
import type { Student, PaginatedResponse } from '../../types';
import { useToast } from '../../components/Toast';
import { DeleteModal } from '../../components/DeleteModal';
import { TableLoading, TableEmpty } from '../../components/TableState';

const StudentList: React.FC = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [keyword, setKeyword] = useState('');
    const [inputValue, setInputValue] = useState('');
    const [meta, setMeta] = useState<PaginatedResponse<Student>['meta']>({
        page: 1,
        per_page: 10,
        total: 0,
        last_page: 1,
        timestamp: ''
    });

    // Delete Modal State
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState<string | null>(null);

    const navigate = useNavigate();
    const { showToast } = useToast();

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setKeyword(inputValue);
            setPage(1); // Reset to page 1 on search
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [inputValue]);

    useEffect(() => {
        fetchData();
    }, [page, keyword, itemsPerPage]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await api.getStudents({ page, limit: itemsPerPage, keyword });
            setStudents(response.data);
            setMeta(response.meta);
        } catch (error) {
            console.error('Error fetching students:', error);
            showToast('Gagal memuat data siswa', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id: string) => {
        setStudentToDelete(id);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!studentToDelete) return;

        try {
            const response = await api.deleteStudent(studentToDelete);
            if (response) {
                showToast('Siswa berhasil dihapus', 'success');
                fetchData();
            } else {
                showToast('Gagal menghapus siswa', 'error');
            }
        } catch (error) {
            console.error('Error deleting student:', error);
            showToast('Gagal menghapus siswa', 'error');
        } finally {
            setShowDeleteModal(false);
            setStudentToDelete(null);
        }
    };

    return (
        <div className="flex h-full flex-col bg-neutral-50 px-8 pt-8">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900">Manajemen Anggota</h1>
                    <p className="text-neutral-600">Kelola data siswa/anggota perpustakaan</p>
                </div>
                <div className="flex gap-2">
                    <Link
                        to="/dashboard/students/new"
                        className="flex items-center gap-2 rounded-lg bg-white border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                    >
                        <Plus size={20} />
                        Tambah
                    </Link>
                    <Link
                        to="/dashboard/students/upload"
                        className="flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
                    >
                        <Upload size={20} />
                        Upload CSV
                    </Link>
                </div>
            </div>

            <div className="mb-6 flex gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Cari nama atau User Number..."
                        className="w-full rounded-lg border border-neutral-200 py-2.5 pl-10 pr-4 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex-1 min-h-0 rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden mb-6 flex flex-col">
                <div className="flex-1 overflow-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="sticky top-0 z-10 bg-neutral-50 text-neutral-500">
                            <tr>
                                <th className="px-6 py-4 font-medium">User Number</th>
                                <th className="px-6 py-4 font-medium">Nama Lengkap</th>
                                <th className="px-6 py-4 font-medium text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-100">
                            {loading ? (
                                <TableLoading colSpan={3} />
                            ) : students.length === 0 ? (
                                <TableEmpty
                                    colSpan={3}
                                    message="Tidak ada siswa ditemukan"
                                    description="Coba cari dengan kata kunci lain atau tambahkan siswa baru."
                                />
                            ) : (
                                students.map((student) => (
                                    <tr key={student.id} className="hover:bg-neutral-50 cursor-pointer" onClick={() => navigate(`/dashboard/students/${student.id}`)}>
                                        <td className="px-6 py-4 font-medium text-neutral-900">{student.user_number}</td>
                                        <td className="px-6 py-4 text-neutral-600">{student.name}</td>
                                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex justify-end gap-2">
                                                <Link
                                                    to={`/dashboard/students/${student.id}/edit`}
                                                    className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 hover:text-blue-600"
                                                >
                                                    <Edit size={18} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(student.id)}
                                                    className="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 hover:text-red-600"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Controls */}
            <Pagination
                currentPage={page}
                totalPages={meta.last_page}
                totalItems={meta.total}
                itemsPerPage={meta.per_page}
                onPageChange={setPage}
                onItemsPerPageChange={(limit) => {
                    setItemsPerPage(limit);
                    setPage(1);
                }}
            />


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

export default StudentList;
