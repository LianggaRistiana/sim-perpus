import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronDown, Search, X, Loader2 } from 'lucide-react';

export interface Option {
    id: string;
    label: string;
}

interface AsyncSelectProps {
    label?: string;
    placeholder?: string;
    value?: Option | null;
    onChange: (value: Option | null) => void;
    loadOptions: (params: { page: number; keyword: string }) => Promise<{ options: Option[]; hasMore: boolean }>;
    className?: string;
    borderActive?: string;
    ringActive?: string;
}

export const AsyncSelect: React.FC<AsyncSelectProps> = ({
    label,
    placeholder = 'Select...',
    value,
    onChange,
    loadOptions,
    className = '',
    borderActive = 'border-neutral-900',
    ringActive = 'ring-neutral-900',
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [options, setOptions] = useState<Option[]>([]);
    const [loading, setLoading] = useState(false);
    const [keyword, setKeyword] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [initialLoaded, setInitialLoaded] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const observerTarget = useRef<HTMLDivElement>(null);

    const fetchOptions = useCallback(async (pageNum: number, search: string, replace: boolean) => {
        setLoading(true);
        try {
            const result = await loadOptions({ page: pageNum, keyword: search });
            setOptions(prev => replace ? result.options : [...prev, ...result.options]);
            setHasMore(result.hasMore);
            setPage(pageNum);
            setInitialLoaded(true);
        } catch (error) {
            console.error('Failed to load options', error);
        } finally {
            setLoading(false);
        }
    }, [loadOptions]);

    // Initial load when opening
    useEffect(() => {
        if (isOpen && !initialLoaded) {
            fetchOptions(1, '', true);
        }
    }, [isOpen, initialLoaded, fetchOptions]);

    // Debounced search
    useEffect(() => {
        if (!isOpen) return;
        const timeoutId = setTimeout(() => {
            if (initialLoaded) {
                // Reset to page 1 for new search
                fetchOptions(1, keyword, true);
            }
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [keyword, isOpen, initialLoaded, fetchOptions]);

    // Infinite scroll observer
    const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
        const target = entries[0];
        if (target.isIntersecting && hasMore && !loading) {
            fetchOptions(page + 1, keyword, false);
        }
    }, [hasMore, loading, page, keyword, fetchOptions]);

    useEffect(() => {
        const option = {
            root: listRef.current, // Use the proper container as root
            rootMargin: '20px',
            threshold: 0.1 // Lower threshold for better triggering
        };
        const observer = new IntersectionObserver(handleObserver, option);
        if (observerTarget.current) observer.observe(observerTarget.current);
        return () => observer.disconnect();
    }, [handleObserver, isOpen]); // Re-attach when isOpen changes to ensure ref is mounted

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (option: Option) => {
        onChange(option);
        setIsOpen(false);
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(null);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {label && <label className="mb-2 block text-sm font-medium text-neutral-700">{label}</label>}
            <div
                className={`flex w-full cursor-pointer items-center justify-between rounded-xl border p-2.5 transition-all ${isOpen
                    ? `${borderActive} bg-white ring-1 ${ringActive}`
                    : 'border-neutral-200 bg-neutral-50 hover:bg-white hover:border-neutral-300'
                    } ${className}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={`block truncate ${!value ? 'text-neutral-400' : 'text-neutral-900'}`}>
                    {value ? value.label : placeholder}
                </span>
                <div className="flex items-center gap-2">
                    {value && (
                        <div role="button" onClick={handleClear} className="text-neutral-400 hover:text-neutral-600">
                            <X size={16} />
                        </div>
                    )}
                    <ChevronDown size={20} className={`text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </div>

            {isOpen && (
                <div className="absolute z-100 mt-1 max-h-60 w-full overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-lg">
                    <div className="border-b border-neutral-100 p-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                            <input
                                type="text"
                                className="w-full rounded-md border border-neutral-200 bg-transparent py-1.5 pl-9 pr-3 text-sm focus:border-blue-500 focus:outline-none"
                                placeholder="Search..."
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>
                    <div ref={listRef} className="max-h-48 overflow-y-auto">
                        {options.map((option) => (
                            <div
                                key={option.id}
                                className={`cursor-pointer px-4 py-2 text-sm hover:bg-neutral-50 ${value?.id === option.id ? 'bg-blue-50 text-blue-600' : 'text-neutral-700'}`}
                                onClick={() => handleSelect(option)}
                            >
                                {option.label}
                            </div>
                        ))}
                        {options.length === 0 && !loading && (
                            <div className="px-4 py-3 text-center text-sm text-neutral-500">No options found</div>
                        )}
                        <div ref={observerTarget} className="h-4 w-full" />
                        {loading && (
                            <div className="flex justify-center py-2">
                                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
