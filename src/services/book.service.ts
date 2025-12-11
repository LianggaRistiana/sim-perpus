import type { BookMaster, BookItem } from '../types';
import { books, bookItems } from './mock-db';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const bookService = {
  getBooks: async (): Promise<BookMaster[]> => {
    await delay(500);
    return books;
  },
  getBookById: async (id: string): Promise<BookMaster | undefined> => {
    await delay(500);
    return books.find((book) => book.id === id);
  },
  addBook: async (book: Omit<BookMaster, 'id'>): Promise<BookMaster> => {
    await delay(500);
    const newBook = { ...book, id: Date.now().toString() };
    books.push(newBook);
    return newBook;
  },
  updateBook: async (id: string, book: Partial<BookMaster>): Promise<BookMaster | null> => {
    await delay(500);
    const index = books.findIndex((b) => b.id === id);
    if (index !== -1) {
      books[index] = { ...books[index], ...book };
      return books[index];
    }
    return null;
  },
  deleteBook: async (id: string): Promise<boolean> => {
    await delay(500);
    const index = books.findIndex((b) => b.id === id);
    if (index !== -1) {
      books.splice(index, 1);
      return true;
    }
    return false;
  },

  // Book Items
  getBookItems: async (masterId?: string): Promise<BookItem[]> => {
    await delay(500);
    if (masterId) {
      return bookItems.filter((item) => item.masterId === masterId);
    }
    return bookItems;
  },
  addBookItem: async (item: Omit<BookItem, 'id' | 'createdAt'>): Promise<BookItem> => {
    await delay(500);
    const newItem = { ...item, id: Date.now().toString(), createdAt: new Date() };
    bookItems.push(newItem);
    return newItem;
  },
  updateBookItem: async (id: string, item: Partial<BookItem>): Promise<BookItem | null> => {
    await delay(500);
    const index = bookItems.findIndex((i) => i.id === id);
    if (index !== -1) {
      bookItems[index] = { ...bookItems[index], ...item };
      return bookItems[index];
    }
    return null;
  },
  deleteBookItem: async (id: string): Promise<boolean> => {
    await delay(500);
    const index = bookItems.findIndex((i) => i.id === id);
    if (index !== -1) {
      bookItems.splice(index, 1);
      return true;
    }
    return false;
  },
  
  getDamagedBooks: async (): Promise<BookItem[]> => {
    await delay(500);
    return bookItems.filter(item => item.condition !== 'Good' && item.condition !== 'New');
  },
};
