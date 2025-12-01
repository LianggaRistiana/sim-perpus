import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Book } from 'lucide-react';
import type { BookMaster } from '../types';
import dummyCover from '../assets/images/dummy_cover_book.jpg';

interface BookCardProps {
    book: BookMaster;
    categoryName: string;
}

const BookCard: React.FC<BookCardProps> = ({ book, categoryName }) => {
    const [imageError, setImageError] = useState(false);

    return (
        <div className="group flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white transition-all hover:border-blue-200 hover:shadow-lg">
            <div className="flex h-48 items-center justify-center bg-neutral-100 overflow-hidden relative">
                {!imageError ? (
                    <img
                        src={dummyCover}
                        alt={`Cover of ${book.title}`}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <Book className="h-16 w-16 text-neutral-300 transition-colors group-hover:text-blue-400" />
                )}
            </div>
            <div className="flex flex-1 flex-col p-4">
                <div className="mb-2">
                    <span className="inline-block rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                        {categoryName}
                    </span>
                </div>
                <h3 className="mb-1 text-lg font-bold text-neutral-900 line-clamp-1">{book.title}</h3>
                <p className="mb-4 text-sm text-neutral-600">{book.author}</p>
                <div className="mt-auto pt-4">
                    <Link
                        to={`/books/${book.id}`}
                        className="block w-full rounded-lg bg-neutral-900 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-neutral-800"
                    >
                        Lihat Detail
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default BookCard;
