import { apiClient } from "../lib/api-client";
import type {
	BookMaster,
	BookItem,
	PaginatedResponse,
	ApiResponse,
} from "../types";

export const bookService = {
	getBooks: async (params?: {
		page?: number;
		limit?: number;
		keyword?: string;
		category_id?: string;
	}): Promise<PaginatedResponse<BookMaster>> => {
		try {
			const query = new URLSearchParams();
			if (params?.page) query.append("page", params.page.toString());
			if (params?.limit) query.append("limit", params.limit.toString());
			if (params?.keyword) query.append("keyword", params.keyword);
			if (params?.category_id) query.append("category_id", params.category_id);

			const response = await apiClient.get<PaginatedResponse<BookMaster>>(
				`/books?${query.toString()}`
			);
			return response;
		} catch (error) {
			console.error("Failed to fetch books:", error);
			return {
				status: "error",
				data: [],
				meta: {
					page: 1,
					per_page: 10,
					total: 0,
					last_page: 1,
					timestamp: new Date().toISOString(),
				},
			};
		}
	},
	getBookById: async (id: string): Promise<BookMaster | undefined> => {
		try {
			const response = await apiClient.get<{ data: BookMaster }>(
				`/books/${id}`
			);
			return response.data;
		} catch (error) {
			console.error("Failed to fetch book:", error);
			return undefined;
		}
	},
	addBook: async (
		book: Omit<BookMaster, "id"> & { bookItemQuantity?: number }
	): Promise<ApiResponse<BookMaster>> => {
		const response = await apiClient.post<ApiResponse<BookMaster>>(
			"/books",
			book
		);
		return response;
	},
	updateBook: async (
		id: string,
		book: Partial<BookMaster>
	): Promise<ApiResponse<BookMaster> | null> => {
		try {
			const response = await apiClient.put<ApiResponse<BookMaster>>(
				`/books/${id}`,
				book
			);
			return response;
		} catch (error) {
			console.error("Failed to update book:", error);
			return null;
		}
	},
	deleteBook: async (id: string): Promise<ApiResponse<null> | null> => {
		try {
			const response = await apiClient.delete<ApiResponse<null>>(
				`/books/${id}`
			);
			return response;
		} catch (error) {
			console.error("Failed to delete book:", error);
			return null;
		}
	},

	// Book Items
	getBookItems: async (
		masterId?: string,
		status?: string
	): Promise<BookItem[]> => {
		try {
			let url = "/book-items?limit=100";
			if (masterId) url += `&book_master_id=${masterId}`;
			if (status) url += `&status=${status}`;

			const response = await apiClient.get<PaginatedResponse<any>>(url);

			// Map backend snake_case to frontend camelCase if needed
			return response.data.map((item) => ({
				id: item.id,
				masterId: item.book_master_id,
				code: item.code,
				condition: item.condition,
				status: item.status,
				createdAt: new Date(item.createdAt),
				book_master: item.book_master
					? {
							...item.book_master,
							categoryId:
								item.book_master.category_id || item.book_master.categoryId,
					  }
					: undefined,
			}));
		} catch (error) {
			console.error("Failed to fetch book items:", error);
			return [];
		}
	},

	addBookItem: async (
		item: Omit<BookItem, "id" | "createdAt">
	): Promise<ApiResponse<BookItem> | null> => {
		try {
			// Docs: POST /api/book-items
			// Body: book_master_id, condition, status. (code is auto-generated? Docs don't mention code in request body, but response has it. However, previously User used prompt to get code. I will assume we might need to send code if prompt is active or backend generates it. Docs say "Create a new book item (copy)" but Request Body table doesn't list `code`. It lists `book_master_id` (required), `condition`, `status`.
			// User's previous code in BookForm sent `code`.
			// If I look at the response "d": "uuid...", "code": "BK-001"
			// If backend generates code, we shouldn't send it. But if user manually wants to input, maybe backend allows?
			// For now, I'll map keys to snake_case.

			const payload: any = {
				book_master_id: item.masterId,
				condition: item.condition,
				status: item.status,
			};
			if (item.code) {
				payload.code = item.code;
			}

			const response = await apiClient.post<ApiResponse<any>>(
				"/book-items",
				payload
			);

			// Map response back
			const data = response.data;
			const newItem: BookItem = {
				id: data.id,
				masterId: data.book_master_id,
				code: data.code,
				condition: data.condition,
				status: data.status,
				createdAt: new Date(data.createdAt || new Date()),
			};

			return { ...response, data: newItem };
		} catch (error) {
			console.error("Failed to add book item:", error);
			return null;
		}
	},

	updateBookItem: async (
		id: string,
		item: Partial<BookItem>
	): Promise<ApiResponse<BookItem> | null> => {
		try {
			const payload: any = {};
			if (item.condition) payload.condition = item.condition;
			if (item.status) payload.status = item.status;
			// book_master_id cannot be updated

			const response = await apiClient.put<ApiResponse<any>>(
				`/book-items/${id}`,
				payload
			);

			const data = response.data;
			const updatedItem: BookItem = {
				id: data.id,
				masterId: data.book_master_id,
				code: data.code,
				condition: data.condition,
				status: data.status,
				createdAt: new Date(data.createdAt),
			};

			return { ...response, data: updatedItem };
		} catch (error) {
			console.error("Failed to update book item:", error);
			return null;
		}
	},

	deleteBookItem: async (id: string): Promise<ApiResponse<null> | null> => {
		try {
			const response = await apiClient.delete<ApiResponse<null>>(
				`/book-items/${id}`
			);
			return response;
		} catch (error) {
			console.error("Failed to delete book item:", error);
			return null;
		}
	},

	getDamagedBooks: async (): Promise<BookItem[]> => {
		try {
			const response = await apiClient.get<PaginatedResponse<any>>(
				"/book-items?condition=damaged"
			);
			return response.data.map((item) => ({
				id: item.id,
				masterId: item.book_master_id,
				code: item.code,
				condition: item.condition,
				status: item.status,
				createdAt: new Date(item.createdAt),
			}));
		} catch (error) {
			console.error("Failed to fetch damaged books:", error);
			return [];
		}
	},
};
