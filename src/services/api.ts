import { authService } from './auth.service';
import { categoryService } from './category.service';
import { bookService } from './book.service';
import { studentService } from './student.service';
import { transactionApiService } from './transaction-api.service';
import { reportService } from './report.service';
import { librarianService } from './librarian.service';


export const api = {
  ...authService,
  ...categoryService,
  ...bookService,
  ...studentService,
  ...transactionApiService,
  ...reportService,
  ...librarianService,
};
