import React from 'react';

// Skeleton for stat cards (overview cards with icon and number)
export const StatCardSkeleton: React.FC = () => {
    return (
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 animate-pulse rounded-full bg-neutral-200"></div>
                <div className="flex-1 space-y-2">
                    <div className="h-4 w-20 animate-pulse rounded bg-neutral-200"></div>
                    <div className="h-8 w-16 animate-pulse rounded bg-neutral-200"></div>
                </div>
            </div>
        </div>
    );
};

// Skeleton for list items (books, categories, etc.)
export const ListItemSkeleton: React.FC = () => {
    return (
        <div className="flex items-start gap-4 rounded-lg border border-neutral-100 p-4">
            <div className="h-10 w-10 animate-pulse rounded-full bg-neutral-200"></div>
            <div className="flex-1 space-y-2">
                <div className="h-5 w-3/4 animate-pulse rounded bg-neutral-200"></div>
                <div className="h-4 w-1/2 animate-pulse rounded bg-neutral-200"></div>
                <div className="h-4 w-20 animate-pulse rounded bg-neutral-200"></div>
            </div>
            <div className="h-6 w-24 animate-pulse rounded-full bg-neutral-200"></div>
        </div>
    );
};

// Skeleton for chart areas
export const ChartSkeleton: React.FC<{ height?: string }> = ({ height = 'h-64' }) => {
    return (
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="mb-4 h-6 w-48 animate-pulse rounded bg-neutral-200"></div>
            <div className={`${height} animate-pulse rounded bg-neutral-100`}></div>
        </div>
    );
};

// Skeleton for section loading (generic content area)
export const SectionSkeleton: React.FC<{ items?: number }> = ({ items = 3 }) => {
    return (
        <div className="space-y-4">
            {Array.from({ length: items }).map((_, i) => (
                <ListItemSkeleton key={i} />
            ))}
        </div>
    );
};

// Skeleton for overview grid (multiple stat cards)
export const OverviewSkeleton: React.FC<{ columns?: number }> = ({ columns = 5 }) => {
    return (
        <div className={`grid gap-6 md:grid-cols-${columns}`}>
            {Array.from({ length: columns }).map((_, i) => (
                <StatCardSkeleton key={i} />
            ))}
        </div>
    );
};
