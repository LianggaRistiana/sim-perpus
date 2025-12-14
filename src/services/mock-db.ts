import type {
  Admin,
  BookItem,
  BookMaster,
  BorrowDetail,
  BorrowTransaction,
  ReturnDetail,
  ReturnTransaction,
  Student,
} from '../types';

export let books: BookMaster[] = [
  {
    id: '1',
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    publisher: 'Scribner',
    year: 1925,
    categoryId: '1',
    isbn: '9780743273565',
  },
  {
    id: '2',
    title: 'A Brief History of Time',
    author: 'Stephen Hawking',
    publisher: 'Bantam Books',
    year: 1988,
    categoryId: '2',
    isbn: '9780553380163',
  },
  {
    id: '3',
    title: 'Clean Code',
    author: 'Robert C. Martin',
    publisher: 'Prentice Hall',
    year: 2008,
    categoryId: '4',
    isbn: '9780132350884',
  },
];

export let bookItems: BookItem[] = [
  {
    id: '1',
    masterId: '1',
    code: 'B001-1',
    condition: 'Good',
    status: 'Available',
    createdAt: new Date('2023-01-01'),
  },
  {
    id: '2',
    masterId: '1',
    code: 'B001-1',
    condition: 'Good',
    status: 'Available',
    createdAt: new Date('2023-01-01'),
  },
  {
    id: '3',
    masterId: '1',
    code: 'B001-1',
    condition: 'Good',
    status: 'Available',
    createdAt: new Date('2023-01-01'),
  },
  {
    id: '4',
    masterId: '1',
    code: 'B001-1',
    condition: 'Good',
    status: 'Available',
    createdAt: new Date('2023-01-01'),
  },
  {
    id: '5',
    masterId: '1',
    code: 'B001-1',
    condition: 'Good',
    status: 'Available',
    createdAt: new Date('2023-01-01'),
  },
  {
    id: '6',
    masterId: '1',
    code: 'B001-2',
    condition: 'Fair',
    status: 'Borrowed',
    createdAt: new Date('2023-01-01'),
  },
  {
    id: '7',
    masterId: '2',
    code: 'B002-1',
    condition: 'New',
    status: 'Available',
    createdAt: new Date('2023-02-15'),
  },
  {
    id: '8',
    masterId: '3',
    code: 'B003-1',
    condition: 'Good',
    status: 'Available',
    createdAt: new Date('2023-03-10'),
  },
];

export let students: Student[] = [
  { id: '1', user_number: '12345', name: 'John Doe' },
  { id: '2', user_number: '67890', name: 'Jane Smith' },
  { id: '3', user_number: '11223', name: 'Alice Johnson' },
];

export const admins: Admin[] = [
  {
    id: '1',
    username: 'admin',
    name: 'Super Admin',
    role: 'ADMIN',
    createdAt: new Date('2022-01-01'),
    user_number: 'admin'
  },
  {
    id: '2',
    username: 'staff',
    name: 'Library Staff',
    role: 'STAFF',
    createdAt: new Date('2022-02-01'),
    user_number: 'staff'
  },
];

export const borrowTransactions: BorrowTransaction[] = [
  { id: '1', adminId: '1', studentId: '1', borrowedAt: new Date('2023-10-01'), dueDate: new Date('2023-10-08'), status: 'Returned' },
  { id: '2', adminId: '2', studentId: '2', borrowedAt: new Date('2023-10-05'), dueDate: new Date('2023-10-12'), status: 'Returned' },
  { id: '3', adminId: '1', studentId: '3', borrowedAt: new Date('2023-10-10'), dueDate: new Date('2023-10-17'), status: 'Borrowed' },
  { id: '4', adminId: '1', studentId: '1', borrowedAt: new Date('2023-10-12'), dueDate: new Date('2023-10-19'), status: 'Overdue' },
  { id: '5', adminId: '2', studentId: '2', borrowedAt: new Date('2023-10-15'), dueDate: new Date('2023-10-22'), status: 'Borrowed' },
  { id: '6', adminId: '1', studentId: '3', borrowedAt: new Date('2023-10-18'), dueDate: new Date('2023-10-25'), status: 'Borrowed' },
  { id: '7', adminId: '1', studentId: '1', borrowedAt: new Date('2023-10-20'), dueDate: new Date('2023-10-27'), status: 'Borrowed' },
  { id: '8', adminId: '2', studentId: '2', borrowedAt: new Date('2023-10-22'), dueDate: new Date('2023-10-29'), status: 'Borrowed' },
];

export const borrowDetails: BorrowDetail[] = [
  { id: '1', borrowId: '1', bookItemId: '1', conditionAtBorrow: 'Good' },
  { id: '2', borrowId: '2', bookItemId: '6', conditionAtBorrow: 'Good' },
  { id: '3', borrowId: '3', bookItemId: '2', conditionAtBorrow: 'Good' },
  { id: '4', borrowId: '4', bookItemId: '3', conditionAtBorrow: 'Good' },
  { id: '5', borrowId: '5', bookItemId: '7', conditionAtBorrow: 'New' },
  { id: '6', borrowId: '6', bookItemId: '8', conditionAtBorrow: 'Good' },
  { id: '7', borrowId: '7', bookItemId: '4', conditionAtBorrow: 'Good' },
  { id: '8', borrowId: '8', bookItemId: '5', conditionAtBorrow: 'Good' },
];

export const returnTransactions: ReturnTransaction[] = [
  { id: '1', borrowId: '1', adminId: '1', returnedAt: new Date('2023-10-07') },
  { id: '2', borrowId: '2', adminId: '2', returnedAt: new Date('2023-10-10') },
];

export const returnDetails: ReturnDetail[] = [
  { id: '1', returnId: '1', bookItemId: '1', conditionAtReturn: 'Good', notes: '' },
  { id: '2', returnId: '2', bookItemId: '6', conditionAtReturn: 'Good', notes: '' },
];
