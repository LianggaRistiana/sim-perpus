import React from 'react';
import { Link } from 'react-router-dom';
import { Book } from 'lucide-react';
import type { BookMaster } from '../types';

interface BookCardProps {
    book: BookMaster;
    categoryName: string;
}

const BookCard: React.FC<BookCardProps> = ({ book, categoryName }) => {

    return (
        <div className="group flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white transition-all hover:border-blue-200 hover:shadow-lg">
            <div className="flex h-48 items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 p-6 relative overflow-hidden group-hover:from-blue-600 group-hover:to-indigo-700 transition-colors">
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Book className="h-16 w-16 text-white/90 drop-shadow-sm" />

                {/* Decorative circles */}
                <div className="absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute -top-8 -left-8 h-24 w-24 rounded-full bg-white/10 blur-xl" />
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
