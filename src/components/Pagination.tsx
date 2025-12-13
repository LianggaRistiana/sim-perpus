import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    onItemsPerPageChange?: (itemsPerPage: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
    onItemsPerPageChange,
}) => {
    // ... existing state ...
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    // ... useEffect and handlers ...
    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handlePageClick = () => {
        setIsEditing(true);
        setEditValue(currentPage.toString());
    };

    const handleInputBlur = () => {
        setIsEditing(false);
        const newPage = parseInt(editValue);
        if (!isNaN(newPage) && newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
            onPageChange(newPage);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            inputRef.current?.blur();
        } else if (e.key === 'Escape') {
            setIsEditing(false);
        }
    };

    return (
        <div className="flex items-center justify-between border-t border-neutral-200 px-4 py-3 sm:px-6">
            <div className="flex flex-1 items-center justify-between sm:hidden">
                <button
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
                >
                    Previous
                </button>
                <p className="text-sm text-neutral-700">
                    Hal <span className="font-medium">{currentPage}</span> / <span className="font-medium">{totalPages}</span>
                </p>
                <button
                    onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative ml-3 inline-flex items-center rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
                >
                    Next
                </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    {onItemsPerPageChange && (
                        <div className="flex items-center gap-2">
                            <select
                                value={itemsPerPage}
                                onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                                className="block items-center rounded-md border-0 h-8  px-2 text-sm text-neutral-900 ring-1 ring-inset ring-neutral-300 focus:ring-2 focus:ring-neutral-600 sm:text-sm sm:leading-6 cursor-pointer hover:bg-neutral-200"
                            >
                                <option value={10}>10 data</option>
                                <option value={25}>25 data</option>
                                <option value={50}>50 data</option>
                                <option value={100}>100 data</option>
                            </select>
                        </div>
                    )}
                    <p className="text-sm text-neutral-700">
                        Menampilkan <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> sampai <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalItems)}</span> dari <span className="font-medium">{totalItems}</span> hasil
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <p className="text-sm text-neutral-700">
                        Halaman <span className="font-medium">{currentPage}</span> dari <span className="font-medium">{totalPages}</span>
                    </p>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                        <button
                            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center rounded-l-md px-2 py-2 text-neutral-400 ring-1 ring-inset ring-neutral-300 hover:bg-neutral-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                        >
                            <span className="sr-only">Previous</span>
                            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                        </button>
                        {/* Simple pagination: show current page */}
                        {/* Simple pagination: show current page or input */}
                        {isEditing ? (
                            <input
                                ref={inputRef}
                                type="text"
                                value={editValue}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === '' || /^\d+$/.test(val)) {
                                        setEditValue(val);
                                    }
                                }}
                                onBlur={handleInputBlur}
                                onKeyDown={handleKeyDown}
                                className="relative z-10 inline-flex w-12 items-center border border-neutral-300 bg-white py-2 text-center text-sm font-semibold text-neutral-900 focus:z-20 focus:outline-none focus:ring-2 focus:ring-neutral-600"
                            />
                        ) : (
                            <button
                                aria-current="page"
                                onClick={handlePageClick}
                                className="relative z-10 inline-flex items-center bg-neutral-900 px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-600 hover:bg-neutral-500"
                            >
                                {currentPage}
                            </button>
                        )}
                        <button
                            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center rounded-r-md px-2 py-2 text-neutral-400 ring-1 ring-inset ring-neutral-300 hover:bg-neutral-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                        >
                            <span className="sr-only">Next</span>
                            <ChevronRight className="h-5 w-5" aria-hidden="true" />
                        </button>
                    </nav>
                </div>
            </div>
        </div>
    );
};
