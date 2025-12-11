import { authService } from './auth.service';
import { categoryService } from './category.service';
import { bookService } from './book.service';
import { studentService } from './student.service';
import { transactionService } from './transaction.service';
import { reportService } from './report.service';

export const api = {
  ...authService,
  ...categoryService,
  ...bookService,
  ...studentService,
  ...transactionService,
  ...reportService,
};
