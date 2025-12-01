import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import BookCatalog from './pages/BookCatalog';
import BookDetail from './pages/BookDetail';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import DashboardHome from './pages/DashboardHome';
import { useOutletContext } from 'react-router-dom';
import type { Admin } from './types';

// Wrapper to get user from Outlet context
const DashboardHomeWrapper = () => {
  const { user } = useOutletContext<{ user: Admin }>();
  return <DashboardHome user={user} />;
};
import BookList from './pages/admin/BookList';
import BookForm from './pages/admin/BookForm';
import StudentList from './pages/admin/StudentList';
import StudentUpload from './pages/admin/StudentUpload';
import CategoryList from './pages/admin/CategoryList';
import CategoryDetail from './pages/admin/CategoryDetail';
import CategoryForm from './pages/admin/CategoryForm';
import TransactionList from './pages/admin/TransactionList';
import TransactionDetail from './pages/admin/TransactionDetail';
import BorrowForm from './pages/admin/BorrowForm';
import ReturnForm from './pages/admin/ReturnForm';
import BookReport from './pages/admin/reports/BookReport';
import CategoryReport from './pages/admin/reports/CategoryReport';
import MemberReport from './pages/admin/reports/MemberReport';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/books" element={<BookCatalog />} />
        <Route path="/books/:id" element={<BookDetail />} />
        <Route path="/login" element={<LoginPage />} />

        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<DashboardHomeWrapper />} />

          {/* Master Data Routes */}
          <Route path="books" element={<BookList />} />
          <Route path="books/new" element={<BookForm />} />
          <Route path="books/:id" element={<BookForm />} />

          <Route path="students" element={<StudentList />} />
          <Route path="students/upload" element={<StudentUpload />} />

          <Route path="categories" element={<CategoryList />} />
          <Route path="categories/new" element={<CategoryForm />} />
          <Route path="categories/:id" element={<CategoryDetail />} />
          <Route path="categories/edit/:id" element={<CategoryForm />} />

          {/* Transaction Routes */}
          <Route path="transactions" element={<TransactionList />} />
          <Route path="transactions/new" element={<BorrowForm />} />
          <Route path="transactions/:id" element={<TransactionDetail />} />
          <Route path="transactions/:id/return" element={<ReturnForm />} />

          {/* Report Routes */}
          <Route path="reports/books" element={<BookReport />} />
          <Route path="reports/categories" element={<CategoryReport />} />
          <Route path="reports/members" element={<MemberReport />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
