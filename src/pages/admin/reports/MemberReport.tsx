import React, { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import type { Student } from '../../../types';
import ReportChart from '../../../components/ReportChart';
import { ArrowLeft, User, BarChart2, Clock, AlertCircle } from 'lucide-react';

const MemberReport: React.FC = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [studentStats, setStudentStats] = useState<{
        monthlyActivity: { label: string; value: number }[];
        totalBorrows: number;
        currentlyBorrowed: number;
        overdueCount: number;
    } | null>(null);

    // Global stats
    const [mostActiveStudents, setMostActiveStudents] = useState<{ label: string; value: number }[]>([]);

    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [allStudents, mostActive] = await Promise.all([
                    api.getStudents(),
                    api.getMostActiveStudents()
                ]);

                setStudents(allStudents.data);
                setMostActiveStudents(mostActive.map(i => ({ label: i.name, value: i.count })));
            } catch (error) {
                console.error('Error fetching member report data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleStudentClick = async (student: Student) => {
        setSelectedStudent(student);
        setDetailLoading(true);
        try {
            const stats = await api.getStudentReportDetails(student.id);
            setStudentStats({
                monthlyActivity: stats.monthlyActivity.map(i => ({ label: i.month, value: i.count })),
                totalBorrows: stats.totalBorrows,
                currentlyBorrowed: stats.currentlyBorrowed,
                overdueCount: stats.overdueCount
            });
        } catch (error) {
            console.error('Error fetching student details:', error);
        } finally {
            setDetailLoading(false);
        }
    };

    const handleBack = () => {
        setSelectedStudent(null);
        setStudentStats(null);
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            </div>
        );
    }

    if (selectedStudent) {
        return (
            <div className="flex h-screen flex-col overflow-hidden p-6">
                <button
                    onClick={handleBack}
                    className="mb-6 flex items-center text-sm font-medium text-neutral-600 hover:text-blue-600"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Kembali ke Daftar Laporan
                </button>

                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-neutral-900">{selectedStudent.name}</h1>
                    <p className="text-neutral-600">User Number: {selectedStudent.user_number}</p>
                </div>

                {detailLoading ? (
                    <div className="flex h-64 items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                    </div>
                ) : studentStats && (
                    <div className="flex-1 space-y-6 overflow-y-auto pr-2">
                        <div className="grid gap-6 md:grid-cols-3">
                            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="rounded-full bg-blue-100 p-3 text-blue-600">
                                        <BarChart2 size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-neutral-600">Total Peminjaman</p>
                                        <p className="text-2xl font-bold text-neutral-900">{studentStats.totalBorrows}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="rounded-full bg-orange-100 p-3 text-orange-600">
                                        <Clock size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-neutral-600">Sedang Dipinjam</p>
                                        <p className="text-2xl font-bold text-neutral-900">{studentStats.currentlyBorrowed}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="rounded-full bg-red-100 p-3 text-red-600">
                                        <AlertCircle size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-neutral-600">Terlambat</p>
                                        <p className="text-2xl font-bold text-neutral-900">{studentStats.overdueCount}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <ReportChart
                            title={`Aktivitas Peminjaman - ${selectedStudent.name}`}
                            data={studentStats.monthlyActivity}
                            color="bg-orange-500"
                        />
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="flex h-screen flex-col overflow-hidden p-6">
            <h1 className="mb-6 text-2xl font-bold text-neutral-900">Laporan Anggota</h1>

            <div className="flex-1 space-y-8 overflow-y-auto pr-2">
                {/* Global Stats */}
                <div className="grid gap-6 md:grid-cols-2">
                    <ReportChart
                        title="Anggota Paling Aktif (Jumlah Peminjaman)"
                        data={mostActiveStudents}
                        color="bg-orange-500"
                    />
                </div>

                <div>
                    <h2 className="mb-4 text-lg font-bold text-neutral-900">Detail per Anggota</h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {students.map((student) => (
                            <button
                                key={student.id}
                                onClick={() => handleStudentClick(student)}
                                className="flex flex-col items-start rounded-xl border border-neutral-200 bg-white p-6 text-left shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
                            >
                                <div className="mb-3 rounded-full bg-neutral-100 p-2 text-neutral-600">
                                    <User size={20} />
                                </div>
                                <h3 className="mb-1 font-bold text-neutral-900">{student.name}</h3>
                                <p className="text-sm text-neutral-600">User Number: {student.user_number}</p>
                                <div className="mt-4 flex items-center text-xs font-medium text-blue-600">
                                    Lihat Statistik <BarChart2 size={14} className="ml-1" />
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MemberReport;
