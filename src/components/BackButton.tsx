import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
    to: string;
    className?: string;
}

const BackButton: React.FC<BackButtonProps> = ({ to, className = '' }) => {
    const navigate = useNavigate();

    return (
        <button
            onClick={() => navigate(to)}
            className={`group flex h-10 w-10 items-center justify-center rounded-xl text-neutral-500 transition-all hover:bg-neutral-200 hover:text-neutral-900 ${className}`}
            aria-label="Go back"
        >
            <ArrowLeft size={20} className="transition-transform group-hover:-translate-x-1" />
        </button>
    );
};

export default BackButton;
