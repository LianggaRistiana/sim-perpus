import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { api } from '../../services/api';
import type { BorrowTransaction, Student } from '../../types';

const ReturnForm: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [transaction, setTransaction] = useState<BorrowTransaction | null>(null);
    const [student, setStudent] = useState<Student | null>(null);
    const [loading, setLoading] = useState(true);

    const [condition, setCondition] = useState('Good');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (id) fetchData(id);
    }, [id]);

    const fetchData = async (transId: string) => {
        setLoading(true);
        try {
            const transactions = await api.getBorrowTransactions();
            const trans = transactions.find(t => t.id === transId);

            if (!trans) {
                alert('Transaksi tidak ditemukan');
                navigate('/dashboard/transactions');
                return;
            }
            setTransaction(trans);

            const studentsData = await api.getStudents();
            const foundStudent = studentsData.find(s => s.id === trans.studentId);
            setStudent(foundStudent || null);

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!transaction) return;

        if (window.confirm('Proses pengembalian buku?')) {
            setLoading(true);
            try {
                await api.returnBook(transaction.id);
                navigate('/dashboard/transactions');
            } catch (error) {
                console.error('Error processing return:', error);
                alert('Gagal memproses pengembalian');
            } finally {
                setLoading(false);
            }
        }
    };

    if (loading) return <div className="p-8">Memuat...</div>;
    if (!transaction) return <div className="p-8">Transaksi tidak ditemukan.</div>;

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
                        <h1 className="text-2xl font-bold text-neutral-900">Pengembalian Buku</h1>
                        <p className="text-neutral-600">Proses pengembalian buku</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                        <h3 className="mb-4 text-lg font-bold text-neutral-900">Detail Peminjaman</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-neutral-500">ID Transaksi</p>
                                <p className="font-mono font-medium">{transaction.id}</p>
                            </div>
                            <div>
                                <p className="text-neutral-500">Peminjam</p>
                                <p className="font-medium">{student?.name || 'Unknown'}</p>
                            </div>
                            <div>
                                <p className="text-neutral-500">Tanggal Pinjam</p>
                                <p className="font-medium">{new Date(transaction.borrowedAt).toLocaleDateString('id-ID')}</p>
                            </div>
                            <div>
                                <p className="text-neutral-500">Jatuh Tempo</p>
                                <p className="font-medium">{new Date(transaction.dueDate).toLocaleDateString('id-ID')}</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                        <h3 className="mb-4 text-lg font-bold text-neutral-900">Kondisi Buku</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-neutral-700">Kondisi Buku</label>
                                <select
                                    className="w-full rounded-lg border border-neutral-300 p-2.5 focus:border-blue-500 focus:outline-none"
                                    value={condition}
                                    onChange={e => setCondition(e.target.value)}
                                >
                                    <option value="Good">Baik</option>
                                    <option value="Damaged">Rusak</option>
                                    <option value="Lost">Hilang</option>
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-neutral-700">Catatan</label>
                                <textarea
                                    className="w-full rounded-lg border border-neutral-300 p-2.5 focus:border-blue-500 focus:outline-none"
                                    rows={3}
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                    placeholder="Catatan tambahan..."
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
                            {loading ? 'Memproses...' : 'Selesai & Simpan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ReturnForm;
