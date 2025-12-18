// Reusing existing types where possible, but API has specific structures

// Based on api_docs/book-transaction.md

export interface ApiBorrower {
	id: string;
	name: string;
	email?: string;
	nis?: string;
	user_number?: string; // Legacy/Fallback
}

export interface ApiAdmin {
	id: string;
	name: string;
	email?: string;
}

export interface ApiBookItemLite {
	id: string;
	code: string;
	status?: string; // Added to display book status
	book_master: {
		title: string;
		author: string;
	};
}

export interface ApiTransactionDetail {
	id: string;
	book_item: ApiBookItemLite;
	condition_at_borrow?: string; // For borrow details
	condition_at_return?: string; // For return details
	notes?: string; // For return details
}

export interface ApiBorrowTransaction {
	id: string;
	transaction_code: string;
	borrower: ApiBorrower;
	admin: ApiAdmin;
	borrow_date: string;
	due_date: string;
	status: "borrowed" | "returned" | "overdue";
	details: ApiTransactionDetail[];
	created_at?: string;
	updated_at?: string;
}

export interface CreateBorrowTransactionPayload {
	borrower_id: string;
	borrow_date: string;
	due_date: string;
	items: string[]; // Array of book_item_ids
}

export interface ReturnItemPayload {
	book_item_id: string;
	status: "available" | "lost";
	condition_at_return?: "good" | "fair" | "poor";
	notes?: string;
}

export interface CreateReturnTransactionPayload {
	borrow_transaction_id: string;
	return_date: string;
	items: ReturnItemPayload[];
}

export interface ApiReturnTransaction {
	id: string;
	borrow_transaction?: {
		id: string;
		transaction_code: string;
	};
	borrow_transaction_id?: string; // Flattened or in object
	return_date: string;
	admin: ApiAdmin;
	details: ApiTransactionDetail[];
}

export interface TransactionQueryParams {
	page?: number;
	per_page?: number;
	status?: string;
	borrower_id?: string;
	overdue?: boolean;
	start_date?: string;
	end_date?: string;
	search?: string;
}

export interface ApiPaginatedResponse<T> {
	status: string;
	data: T[];
	meta: {
		current_page: number;
		per_page: number;
		total: number;
		last_page: number;
		from?: number;
		to?: number;
	};
}

export interface ApiResponse<T> {
	status: string;
	message?: string;
	data: T;
}
