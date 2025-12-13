import React from 'react';
import { FileSearch } from 'lucide-react';

interface TableLoadingProps {
    colSpan: number;
}

export const TableLoading: React.FC<TableLoadingProps> = ({ colSpan }) => {
    return (
        <tr>
            <td colSpan={colSpan} className="p-0 border-b border-neutral-100 relative h-96 align-top">
                <style>{`
                    @keyframes progress {
                        0% { left: -30%; }
                        100% { left: 100%; }
                    }
                `}</style>
                <div className="absolute top-0 left-0 w-full h-0.5 bg-neutral-100 overflow-hidden">
                    <div
                        className="h-full bg-neutral-900 absolute top-0"
                        style={{
                            width: '30%',
                            animation: 'progress 1s infinite linear'
                        }}
                    ></div>
                </div>
                <div className="flex h-full flex-col items-center justify-center gap-2 opacity-50">
                    <span className="text-sm text-neutral-500">Memuat data...</span>
                </div>
            </td>
        </tr>
    );
};

interface TableEmptyProps {
    colSpan: number;
    message?: string;
    description?: string;
}

export const TableEmpty: React.FC<TableEmptyProps> = ({
    colSpan,
    message = 'Data tidak ditemukan',
    description = 'Belum ada data yang tersedia untuk saat ini.'
}) => {
    return (
        <tr>
            <td colSpan={colSpan} className="px-6 py-12">
                <div className="flex flex-col items-center justify-center text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
                        <FileSearch size={32} />
                    </div>
                    <h3 className="mb-1 text-lg font-medium text-neutral-900">{message}</h3>
                    <p className="max-w-sm text-sm text-neutral-500">{description}</p>
                </div>
            </td>
        </tr>
    );
};
