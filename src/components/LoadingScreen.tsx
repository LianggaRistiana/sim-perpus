import React from 'react';

interface LoadingScreenProps {
    message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = 'Memuat data...' }) => {
    return (
        <div className="flex min-h-screen items-center justify-center bg-neutral-50">
            <div className="text-center">
                <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-neutral-300 border-t-neutral-900 mx-auto"></div>
                <p className="text-neutral-600">{message}</p>
            </div>
        </div>
    );
};
