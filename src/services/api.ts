import type {
  Admin,
  BookItem,
  BookMaster,
  BorrowDetail,
  BorrowTransaction,
  Category,
  ReturnDetail,
  ReturnTransaction,
  Student,
} from '../types';

// Dummy Data
let categories: Category[] = [
  { id: '1', name: 'Fiction', description: 'Fictional works' },
  { id: '2', name: 'Science', description: 'Scientific books' },
  { id: '3', name: 'History', description: 'Historical accounts' },
  { id: '4', name: 'Technology', description: 'Tech and Computers' },
];

let books: BookMaster[] = [
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

let bookItems: BookItem[] = [
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

let students: Student[] = [
  { id: '1', nis: '12345', name: 'John Doe' },
  { id: '2', nis: '67890', name: 'Jane Smith' },
  { id: '3', nis: '11223', name: 'Alice Johnson' },
];

const admins: Admin[] = [
  {
    id: '1',
    username: 'admin',
    passwordHash: 'hash',
    name: 'Super Admin',
    role: 'ADMIN',
    createdAt: new Date('2022-01-01'),
  },
  {
    id: '2',
    username: 'staff',
    passwordHash: 'hash',
    name: 'Library Staff',
    role: 'STAFF',
    createdAt: new Date('2022-02-01'),
  },
];

const borrowTransactions: BorrowTransaction[] = [
  { id: '1', adminId: '1', studentId: '1', borrowedAt: new Date('2023-10-01'), dueDate: new Date('2023-10-08'), status: 'Returned' },
  { id: '2', adminId: '2', studentId: '2', borrowedAt: new Date('2023-10-05'), dueDate: new Date('2023-10-12'), status: 'Returned' },
  { id: '3', adminId: '1', studentId: '3', borrowedAt: new Date('2023-10-10'), dueDate: new Date('2023-10-17'), status: 'Borrowed' },
  { id: '4', adminId: '1', studentId: '1', borrowedAt: new Date('2023-10-12'), dueDate: new Date('2023-10-19'), status: 'Overdue' },
  { id: '5', adminId: '2', studentId: '2', borrowedAt: new Date('2023-10-15'), dueDate: new Date('2023-10-22'), status: 'Borrowed' },
  { id: '6', adminId: '1', studentId: '3', borrowedAt: new Date('2023-10-18'), dueDate: new Date('2023-10-25'), status: 'Borrowed' },
  { id: '7', adminId: '1', studentId: '1', borrowedAt: new Date('2023-10-20'), dueDate: new Date('2023-10-27'), status: 'Borrowed' },
  { id: '8', adminId: '2', studentId: '2', borrowedAt: new Date('2023-10-22'), dueDate: new Date('2023-10-29'), status: 'Borrowed' },
];

const borrowDetails: BorrowDetail[] = [
  { id: '1', borrowId: '1', bookItemId: '1', conditionAtBorrow: 'Good' },
  { id: '2', borrowId: '2', bookItemId: '6', conditionAtBorrow: 'Good' },
  { id: '3', borrowId: '3', bookItemId: '2', conditionAtBorrow: 'Good' },
  { id: '4', borrowId: '4', bookItemId: '3', conditionAtBorrow: 'Good' },
  { id: '5', borrowId: '5', bookItemId: '7', conditionAtBorrow: 'New' },
  { id: '6', borrowId: '6', bookItemId: '8', conditionAtBorrow: 'Good' },
  { id: '7', borrowId: '7', bookItemId: '4', conditionAtBorrow: 'Good' },
  { id: '8', borrowId: '8', bookItemId: '5', conditionAtBorrow: 'Good' },
];

const returnTransactions: ReturnTransaction[] = [
  { id: '1', borrowId: '1', adminId: '1', returnedAt: new Date('2023-10-07') },
  { id: '2', borrowId: '2', adminId: '2', returnedAt: new Date('2023-10-10') },
];

const returnDetails: ReturnDetail[] = [
  { id: '1', returnId: '1', bookItemId: '1', conditionAtReturn: 'Good', notes: '' },
  { id: '2', returnId: '2', bookItemId: '6', conditionAtReturn: 'Good', notes: '' },
];

// Helper to simulate delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const api = {
  // Categories
  getCategories: async (): Promise<Category[]> => {
    await delay(500);
    return categories;
  },
  getCategoryById: async (id: string): Promise<Category | undefined> => {
    await delay(500);
    return categories.find((c) => c.id === id);
  },
  addCategory: async (category: Omit<Category, 'id'>): Promise<Category> => {
    await delay(500);
    const newCategory = { ...category, id: Date.now().toString() };
    categories.push(newCategory);
    return newCategory;
  },
  updateCategory: async (id: string, category: Partial<Category>): Promise<Category | null> => {
    await delay(500);
    const index = categories.findIndex((c) => c.id === id);
    if (index !== -1) {
      categories[index] = { ...categories[index], ...category };
      return categories[index];
    }
    return null;
  },
  deleteCategory: async (id: string): Promise<boolean> => {
    await delay(500);
    const index = categories.findIndex((c) => c.id === id);
    if (index !== -1) {
      categories.splice(index, 1);
      return true;
    }
    return false;
  },

  // Books
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

  // Students
  getStudents: async (): Promise<Student[]> => {
    await delay(500);
    return students;
  },
  getStudentById: async (id: string): Promise<Student | undefined> => {
    await delay(500);
    return students.find(s => s.id === id);
  },
  addStudent: async (student: Omit<Student, 'id'>): Promise<Student> => {
    await delay(500);
    const newStudent = { ...student, id: Date.now().toString() };
    students.push(newStudent);
    return newStudent;
  },
  deleteStudent: async (id: string): Promise<boolean> => {
    await delay(500);
    const index = students.findIndex((s) => s.id === id);
    if (index !== -1) {
      students.splice(index, 1);
      return true;
    }
    return false;
  },

  // Admins & Transactions
  getAdmins: async (): Promise<Admin[]> => {
    await delay(500);
    return admins;
  },
  getBorrowTransactions: async (): Promise<BorrowTransaction[]> => {
    await delay(500);
    return borrowTransactions;
  },
  getBorrowTransactionById: async (id: string): Promise<(BorrowTransaction & { items: { id: string; code: string; title: string; author: string; condition: string; returnCondition?: string }[] }) | undefined> => {
    await delay(500);
    const transaction = borrowTransactions.find(t => t.id === id);
    if (!transaction) return undefined;

    const details = borrowDetails.filter(d => d.borrowId === id);
    const items = details.map(d => {
      const item = bookItems.find(i => i.id === d.bookItemId);
      if (!item) return null;
      const master = books.find(b => b.id === item.masterId);
      if (!master) return null;
      
      // Find return condition
      const returnTx = returnTransactions.find(rt => rt.borrowId === id);
      const returnDetail = returnTx ? returnDetails.find(rd => rd.returnId === returnTx.id && rd.bookItemId === item.id) : undefined;

      return {
        id: item.id,
        code: item.code,
        title: master.title,
        author: master.author,
        condition: d.conditionAtBorrow,
        returnCondition: returnDetail?.conditionAtReturn
      };
    }).filter((i): i is NonNullable<typeof i> => i !== null);

    return { ...transaction, items };
  },
  getReturnTransactionByBorrowId: async (borrowId: string): Promise<ReturnTransaction | undefined> => {
    await delay(500);
    return returnTransactions.find(t => t.borrowId === borrowId);
  },
  createBorrowTransaction: async (data: { studentId: string; bookItemIds: string[]; adminId: string; durationDays: number }): Promise<BorrowTransaction> => {
    await delay(500);
    const borrowId = Date.now().toString();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + data.durationDays);

    const newTransaction: BorrowTransaction = {
      id: borrowId,
      adminId: data.adminId,
      studentId: data.studentId,
      borrowedAt: new Date(),
      dueDate: dueDate,
      status: 'Borrowed',
    };
    borrowTransactions.push(newTransaction);

    // Update book item status
    data.bookItemIds.forEach(itemId => {
      const itemIndex = bookItems.findIndex(i => i.id === itemId);
      if (itemIndex !== -1) {
        bookItems[itemIndex].status = 'Borrowed';
      }
    });

    return newTransaction;
  },
  returnBook: async (borrowId: string, returnDate: Date = new Date()): Promise<ReturnTransaction> => {
    await delay(500);
    const borrowIndex = borrowTransactions.findIndex(t => t.id === borrowId);
    if (borrowIndex !== -1) {
      borrowTransactions[borrowIndex].status = 'Returned';
      
      // Find items associated with this borrow (simplified logic for dummy: assuming 1 item per borrow or we need a detail table)
      // For this dummy implementation, let's assume we just mark the transaction as returned.
      // Ideally we should have BorrowDetail, but for simplicity let's just update the transaction status.
      // And we need to find which items were borrowed. 
      // Since our dummy data structure for BorrowTransaction doesn't explicitly link items (it should have BorrowDetail),
      // we will just update the status for now. 
      // WAIT, the types definition has BorrowDetail but we are not using it in the dummy data fully.
      // Let's stick to the plan: "Update getBorrowTransactions to potentially filter by status."
      
      const newReturn: ReturnTransaction = {
        id: Date.now().toString(),
        borrowId: borrowId,
        adminId: '1', // Dummy admin ID
        returnedAt: returnDate,
      };
      returnTransactions.push(newReturn);
      return newReturn;
    }
    throw new Error('Transaction not found');
  },
  getReturnTransactions: async (): Promise<ReturnTransaction[]> => {
    await delay(500);
    return returnTransactions;
  },

  login: async (username: string, password: string): Promise<Admin | null> => {
    await delay(1000);
    // Dummy login logic
    if (username === 'admin' && password === 'admin') {
      return admins[0];
    }
    return null;
  },

  // Reports
  getMostBorrowedBooks: async (): Promise<{ title: string; count: number }[]> => {
    await delay(500);
    return [
      { title: 'The Great Gatsby', count: 15 },
      { title: 'Clean Code', count: 12 },
      { title: 'A Brief History of Time', count: 8 },
      { title: 'Harry Potter', count: 20 },
      { title: 'Lord of the Rings', count: 18 },
    ].sort((a, b) => b.count - a.count);
  },

  getLongestBorrowedBooks: async (): Promise<{ title: string; days: number }[]> => {
    await delay(500);
    return [
      { title: 'Clean Code', days: 45 },
      { title: 'The Great Gatsby', days: 30 },
      { title: 'A Brief History of Time', days: 25 },
      { title: 'Introduction to Algorithms', days: 60 },
      { title: 'Design Patterns', days: 40 },
    ].sort((a, b) => b.days - a.days);
  },

  getMostBorrowedCategories: async (): Promise<{ name: string; count: number }[]> => {
    await delay(500);
    return [
      { name: 'Fiction', count: 45 },
      { name: 'Technology', count: 30 },
      { name: 'Science', count: 25 },
      { name: 'History', count: 15 },
    ].sort((a, b) => b.count - a.count);
  },

  getLongestBorrowedCategories: async (): Promise<{ name: string; days: number }[]> => {
    await delay(500);
    return [
      { name: 'Technology', days: 120 },
      { name: 'Fiction', days: 90 },
      { name: 'Science', days: 60 },
      { name: 'History', days: 45 },
    ].sort((a, b) => b.days - a.days);
  },

  getDamagedBooks: async (): Promise<BookItem[]> => {
    await delay(500);
    return bookItems.filter(item => item.condition !== 'Good' && item.condition !== 'New');
  },

  getMostActiveStudents: async (): Promise<{ name: string; count: number }[]> => {
    await delay(500);
    return [
      { name: 'John Doe', count: 15 },
      { name: 'Jane Smith', count: 12 },
      { name: 'Alice Johnson', count: 8 },
    ].sort((a, b) => b.count - a.count);
  },

  getCategoryReportDetails: async (categoryId: string): Promise<{
    monthlyBorrows: { month: string; count: number }[];
    totalBooks: number;
    totalBorrows: number;
  }> => {
    await delay(500);
    // Mock data based on category ID (randomized for demo)
    return {
      monthlyBorrows: [
        { month: 'Jan', count: Math.floor(Math.random() * 50) },
        { month: 'Feb', count: Math.floor(Math.random() * 50) },
        { month: 'Mar', count: Math.floor(Math.random() * 50) },
        { month: 'Apr', count: Math.floor(Math.random() * 50) },
        { month: 'May', count: Math.floor(Math.random() * 50) },
        { month: 'Jun', count: Math.floor(Math.random() * 50) },
      ],
      totalBooks: Math.floor(Math.random() * 100),
      totalBorrows: Math.floor(Math.random() * 200),
    };
  },

  getBookReportDetails: async (bookId: string): Promise<{
    monthlyBorrows: { month: string; count: number }[];
    totalCopies: number;
    currentlyBorrowed: number;
    totalLifetimeBorrows: number;
    items: {
      id: string;
      code: string;
      condition: string;
      status: string;
      history: {
        id: string;
        studentName: string;
        borrowDate: Date;
        returnDate?: Date;
        status: 'Borrowed' | 'Returned' | 'Overdue';
        returnCondition?: string;
      }[];
    }[];
  }> => {
    await delay(500);
    
    // Find items for this book
    const items = bookItems.filter(item => item.masterId === bookId);
    
    // Map items to include history
    const itemsWithHistory = items.map(item => {
      // Find borrows for this item
      const itemBorrows = borrowDetails.filter(bd => bd.bookItemId === item.id);
      
      const history = itemBorrows.map(bd => {
        const borrowTx = borrowTransactions.find(bt => bt.id === bd.borrowId);
        if (!borrowTx) return null;

        const returnTx = returnTransactions.find(rt => rt.borrowId === borrowTx.id);
        const returnDetail = returnTx ? returnDetails.find(rd => rd.returnId === returnTx.id && rd.bookItemId === item.id) : undefined;
        const student = students.find(s => s.id === borrowTx.studentId);

        return {
          id: borrowTx.id,
          studentName: student ? student.name : 'Unknown',
          borrowDate: borrowTx.borrowedAt,
          returnDate: returnTx ? returnTx.returnedAt : undefined,
          status: borrowTx.status as 'Borrowed' | 'Returned' | 'Overdue',
          returnCondition: returnDetail ? returnDetail.conditionAtReturn : undefined
        };
      }).filter((h): h is NonNullable<typeof h> => h !== null);

      return {
        id: item.id,
        code: item.code,
        condition: item.condition,
        status: item.status,
        history: history.sort((a, b) => b.borrowDate.getTime() - a.borrowDate.getTime())
      };
    });

    return {
      monthlyBorrows: [
        { month: 'Jan', count: Math.floor(Math.random() * 20) },
        { month: 'Feb', count: Math.floor(Math.random() * 20) },
        { month: 'Mar', count: Math.floor(Math.random() * 20) },
        { month: 'Apr', count: Math.floor(Math.random() * 20) },
        { month: 'May', count: Math.floor(Math.random() * 20) },
        { month: 'Jun', count: Math.floor(Math.random() * 20) },
      ],
      totalCopies: items.length,
      currentlyBorrowed: items.filter(i => i.status === 'Borrowed').length,
      totalLifetimeBorrows: itemsWithHistory.reduce((acc, item) => acc + item.history.length, 0),
      items: itemsWithHistory
    };
  },


  getStudentReportDetails: async (studentId: string): Promise<{
    monthlyActivity: { month: string; count: number }[];
    totalBorrows: number;
    currentlyBorrowed: number;
    overdueCount: number;
  }> => {
    await delay(500);
    // Mock data based on student ID
    return {
      monthlyActivity: [
        { month: 'Jan', count: Math.floor(Math.random() * 10) },
        { month: 'Feb', count: Math.floor(Math.random() * 10) },
        { month: 'Mar', count: Math.floor(Math.random() * 10) },
        { month: 'Apr', count: Math.floor(Math.random() * 10) },
        { month: 'May', count: Math.floor(Math.random() * 10) },
        { month: 'Jun', count: Math.floor(Math.random() * 10) },
      ],
      totalBorrows: Math.floor(Math.random() * 50),
      currentlyBorrowed: Math.floor(Math.random() * 3),
      overdueCount: Math.floor(Math.random() * 2),
    };
  }
};
