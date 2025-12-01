export type Role = 'ADMIN' | 'STAFF';

export interface Admin {
  id: string;
  username: string;
  passwordHash: string;
  name: string;
  role: Role;
  createdAt: Date;
}

export interface Student {
  id: string;
  nis: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
}

export interface BookMaster {
  id: string;
  title: string;
  author: string;
  publisher: string;
  year: number;
  categoryId: string;
  isbn: string;
}

export interface BookItem {
  id: string;
  masterId: string;
  code: string;
  condition: string;
  status: string;
  createdAt: Date;
}

export interface BorrowTransaction {
  id: string;
  adminId: string;
  studentId: string;
  borrowedAt: Date;
  dueDate: Date;
  status: string;
}

export interface BorrowDetail {
  id: string;
  borrowId: string;
  bookItemId: string;
  conditionAtBorrow: string;
}

export interface ReturnTransaction {
  id: string;
  borrowId: string;
  adminId: string;
  returnedAt: Date;
}

export interface ReturnDetail {
  id: string;
  returnId: string;
  bookItemId: string;
  conditionAtReturn: string;
  notes: string;
}

export interface BookReportItem {
  id: string;
  title: string;
  value: number; // count or days
}

export interface CategoryReportItem {
  id: string;
  name: string;
  value: number; // count or days
}
