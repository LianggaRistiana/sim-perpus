import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import React from 'react';

interface StatusBookBadgeProps {
    status?: string;
    className?: string; // Allow additional classes if needed
}

export const StatusBookBadge: React.FC<StatusBookBadgeProps> = ({ status = 'unknown', className = '' }) => {
    const getStatusStyle = (status: string) => {
        switch (status.toLowerCase()) {
            case 'available':
                return 'bg-green-50 text-green-700';
            case 'borrowed':
                return 'bg-yellow-50 text-yellow-700';
            case 'lost':
                return 'bg-red-50 text-red-700';
            default:
                return 'bg-neutral-50 text-neutral-700';
        }
    };

    const getStatusText = (status: string) => {
        switch (status.toLowerCase()) {
            case 'available':
                return 'Tersedia';
            case 'borrowed':
                return 'Dipinjam';
            case 'lost':
                return 'Hilang';
            default:
                return 'Tidak Diketahui';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'available':
                return <CheckCircle size={8} className="mr-1" />;
            case 'borrowed': ``
                return <Clock size={8} className="mr-1" />;
            case 'lost':
                return <AlertCircle size={8} className="mr-1" />;
            default:
                return <AlertCircle size={8} className="mr-1" />;
        }
    };

    return (
        <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${getStatusStyle(status)} ${className}`}
        >
            {getStatusIcon(status)}
            {getStatusText(status)}
        </span>
    );
};

export default StatusBookBadge;
