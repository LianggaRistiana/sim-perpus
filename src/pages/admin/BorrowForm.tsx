import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Search } from 'lucide-react';
import { api } from '../../services/api';
import type { Student, BookItem, BookMaster } from '../../types';

const BorrowForm: React.FC = () => {
    const navigate = useNavigate();
    const [students, setStudents] = useState<Student[]>([]);
    const [bookItems, setBookItems] = useState<(BookItem & { master?: BookMaster })[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedStudent, setSelectedStudent] = useState('');
    const [selectedBookItem, setSelectedBookItem] = useState('');
    const [duration, setDuration] = useState(7);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [studentsData, itemsData, booksData] = await Promise.all([
                api.getStudents(),
                api.getBookItems(),
                api.getBooks()
            ]);

            // Enrich items with master data
            // const enrichedItems = itemsData.map(item => ({
            //     ...item,
            //     master: booksData.find(b => b.id === item.masterId)
            // })).filter(item => item.status === 'Available'); // Only available books

            // setStudents(studentsData.data);
            // setBookItems(enrichedItems);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStudent || !selectedBookItem) {
            alert('Pilih siswa dan buku terlebih dahulu');
            return;
        }

        setLoading(true);
        try {
            // Dummy admin ID
            const adminId = '1';
            await api.createBorrowTransaction({
                studentId: selectedStudent,
                bookItemIds: [selectedBookItem],
                adminId,
                durationDays: duration
            });
            navigate('/dashboard/transactions');
        } catch (error) {
            console.error('Error creating transaction:', error);
            alert('Gagal membuat transaksi');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-50 p-8">
            <div className="mx-auto max-w-2xl">
                <div className="mb-8 flex items-center gap-4">
                    <button
                        onClick={() => navigate('/dashboard/transactions')}
                        className="rounded-lg p-2 hover:bg-neutral-200"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-900">Peminjaman Baru</h1>
                        <p className="text-neutral-600">Catat transaksi peminjaman buku</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                        <div className="space-y-6">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-neutral-700">Pilih Siswa</label>
                                <select
                                    required
                                    className="w-full rounded-lg border border-neutral-300 p-2.5 focus:border-blue-500 focus:outline-none"
                                    value={selectedStudent}
                                    onChange={e => setSelectedStudent(e.target.value)}
                                >
                                    <option value="">-- Pilih Siswa --</option>
                                    {students.map(s => (
                                        <option key={s.id} value={s.id}>{s.user_number} - {s.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-neutral-700">Pilih Buku (Salinan)</label>
                                <select
                                    required
                                    className="w-full rounded-lg border border-neutral-300 p-2.5 focus:border-blue-500 focus:outline-none"
                                    value={selectedBookItem}
                                    onChange={e => setSelectedBookItem(e.target.value)}
                                >
                                    <option value="">-- Pilih Buku --</option>
                                    {bookItems.map(item => (
                                        <option key={item.id} value={item.id}>
                                            {item.code} - {item.master?.title} ({item.condition})
                                        </option>
                                    ))}
                                </select>
                                {bookItems.length === 0 && !loading && (
                                    <p className="mt-1 text-xs text-red-500">Tidak ada buku tersedia saat ini.</p>
                                )}
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-neutral-700">Durasi Peminjaman (Hari)</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="30"
                                    required
                                    className="w-full rounded-lg border border-neutral-300 p-2.5 focus:border-blue-500 focus:outline-none"
                                    value={duration}
                                    onChange={e => setDuration(parseInt(e.target.value))}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard/transactions')}
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
                            {loading ? 'Menyimpan...' : 'Simpan Transaksi'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BorrowForm;
