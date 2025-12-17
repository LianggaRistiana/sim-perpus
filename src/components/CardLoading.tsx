import React from 'react';

interface CardLoadingProps {
    height?: string;
}

export const CardLoading: React.FC<CardLoadingProps> = ({ height = 'h-32' }) => {
    return (
        <div className={`flex ${height} items-center justify-center`}>
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        </div>
    );
};
