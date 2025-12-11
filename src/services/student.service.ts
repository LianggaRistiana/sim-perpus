import type { Student, Admin } from '../types';
import { students, admins } from './mock-db';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const studentService = {
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
  
  // Admins (kept here or separate? Api.ts had it with students/admins)
  getAdmins: async (): Promise<Admin[]> => {
    await delay(500);
    return admins;
  },

  getMostActiveStudents: async (): Promise<{ name: string; count: number }[]> => {
    await delay(500);
    return [
      { name: 'John Doe', count: 15 },
      { name: 'Jane Smith', count: 12 },
      { name: 'Alice Johnson', count: 8 },
    ].sort((a, b) => b.count - a.count);
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
