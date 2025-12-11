import type { BorrowTransaction, ReturnTransaction } from '../types';
import { borrowTransactions, borrowDetails, returnTransactions, returnDetails, bookItems, books } from './mock-db';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const transactionService = {
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
};
