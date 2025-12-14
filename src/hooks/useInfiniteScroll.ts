import { useCallback } from 'react';

interface UseInfiniteScrollProps {
    onLoadMore: () => void;
    hasMore: boolean;
    isLoading: boolean;
    threshold?: number;
}

export const useInfiniteScroll = ({ 
    onLoadMore, 
    hasMore, 
    isLoading, 
    threshold = 50 
}: UseInfiniteScrollProps) => {
    const handleScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
        const target = e.target as HTMLElement;
        
        // Calculate validity of scroll event
        if (!target) return;

        // Check if we are close to the bottom
        const isBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + threshold;
        
        if (isBottom && hasMore && !isLoading) {
            onLoadMore();
        }
    }, [onLoadMore, hasMore, isLoading, threshold]);

    return handleScroll;
};
