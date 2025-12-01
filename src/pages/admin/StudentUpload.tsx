import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, FileText } from 'lucide-react';
import { api } from '../../services/api';

const StudentUpload: React.FC = () => {
    const navigate = useNavigate();
    const [csvContent, setCsvContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const text = event.target?.result as string;
                setCsvContent(text);
            };
            reader.readAsText(file);
        }
    };

    const handleProcess = async () => {
        if (!csvContent) {
            setError('Silakan upload file CSV terlebih dahulu.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const lines = csvContent.split('\n');
            let successCount = 0;

            for (const line of lines) {
                const [nis, name] = line.split(',').map(item => item.trim());
                if (nis && name && nis !== 'NIS') { // Skip header if exists
                    await api.addStudent({ nis, name });
                    successCount++;
                }
            }

            alert(`Berhasil mengimpor ${successCount} data siswa.`);
            navigate('/dashboard/students');
        } catch (err) {
            console.error(err);
            setError('Terjadi kesalahan saat memproses data.');
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
                        <h1 className="text-2xl font-bold text-neutral-900">Upload Data Siswa</h1>
                        <p className="text-neutral-600">Impor data siswa dari file CSV</p>
                    </div>
                </div>

                <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
                    <div className="mb-6 rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
                        <p className="font-bold">Format CSV:</p>
                        <p>NIS, Nama Lengkap</p>
                        <p className="mt-2 text-xs opacity-75">Contoh:</p>
                        <code className="block bg-blue-100 p-2 mt-1 rounded">
                            12345, Budi Santoso<br />
                            12346, Siti Aminah
                        </code>
                    </div>

                    <div className="mb-6">
                        <label className="flex w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 py-10 hover:bg-neutral-100">
                            <div className="flex flex-col items-center justify-center pb-6 pt-5">
                                <Upload className="mb-3 h-10 w-10 text-neutral-400" />
                                <p className="mb-2 text-sm text-neutral-500">
                                    <span className="font-semibold">Klik untuk upload</span> atau drag and drop
                                </p>
                                <p className="text-xs text-neutral-500">File CSV saja</p>
                            </div>
                            <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
                        </label>
                    </div>

                    {csvContent && (
                        <div className="mb-6">
                            <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-neutral-900">
                                <FileText size={16} />
                                Preview Data ({csvContent.split('\n').filter(l => l.trim()).length} baris)
                            </h3>
                            <div className="max-h-48 overflow-y-auto rounded-lg border border-neutral-200 bg-neutral-50 p-4 text-xs font-mono text-neutral-600">
                                <pre>{csvContent}</pre>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end">
                        <button
                            onClick={handleProcess}
                            disabled={!csvContent || loading}
                            className="flex items-center gap-2 rounded-lg bg-neutral-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-70"
                        >
                            {loading ? 'Memproses...' : 'Proses Impor'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentUpload;
