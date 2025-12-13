export type Role = "ADMIN" | "STAFF" | "LIBRARIAN";

export interface User {
	id: string;
	name: string;
	user_number: string;
	role: Role;
	username?: string; // Optional as it might not be in the me response directly or named differently
}

export interface Admin extends User {
	// Extending User for compatibility with existing code where possible
	// Adjusting based on existing usage
	passwordHash?: string;
	createdAt?: Date;
}

export interface Student {
	id: string;
	user_number: string;
	name: string;
}

export interface Category {
	id: string;
	code?: string;
	name: string;
	description: string;
	created_at?: string;
	updated_at?: string;
}

export interface PaginatedResponse<T> {
	status: string;
	data: T[];
	meta: {
		page: number;
		per_page: number;
		total: number;
		last_page: number;
		timestamp: string;
	};
}

export interface ApiResponse<T> {
	status: string;
	message: string;
	data: T;
}

export interface BookMaster {
	id: string;
	title: string;
	author: string;
	publisher: string;
	year: number;
	categoryId: string;
	isbn: string;
	bookItemQuantity?: number; // Added for creation payload
	category?: Category;
}

export interface BookItem {
	id: string;
	masterId: string;
	code: string;
	condition: string;
	status: string;
	createdAt: Date;
	book_master?: BookMaster;
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
