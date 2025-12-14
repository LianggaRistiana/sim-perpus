import { apiClient } from "../lib/api-client";
import type {
	ApiBorrowTransaction,
	ApiReturnTransaction,
	CreateBorrowTransactionPayload,
	CreateReturnTransactionPayload,
	ApiResponse,
	TransactionQueryParams,
	ApiPaginatedResponse,
} from "../types/transaction-api.types";

export const transactionApiService = {
	getBorrowTransactions: async (
		params?: TransactionQueryParams
	): Promise<ApiPaginatedResponse<ApiBorrowTransaction>> => {
		const query = new URLSearchParams();
		if (params) {
			if (params.page) query.append("page", params.page.toString());
			if (params.per_page) query.append("per_page", params.per_page.toString());
			if (params.status) query.append("status", params.status);
			if (params.borrower_id) query.append("borrower_id", params.borrower_id);
			if (params.overdue) query.append("overdue", "1");
			if (params.search) query.append("search", params.search);
			if (params.start_date) query.append("start_date", params.start_date);
			if (params.end_date) query.append("end_date", params.end_date);
		}

		return await apiClient.get<ApiPaginatedResponse<ApiBorrowTransaction>>(
			`/transactions?${query.toString()}`
		);
	},

	getBorrowTransactionById: async (
		id: string
	): Promise<ApiBorrowTransaction> => {
		const response = await apiClient.get<ApiResponse<ApiBorrowTransaction>>(
			`/transactions/${id}`
		);
		return response.data;
	},

	createBorrowTransaction: async (
		payload: CreateBorrowTransactionPayload
	): Promise<ApiBorrowTransaction> => {
		const response = await apiClient.post<ApiResponse<ApiBorrowTransaction>>(
			`/transactions`,
			payload
		);
		// apiClient throws if !ok. response.status in body is "success"
		if (response.status !== "success") {
			throw new Error(
				`Failed to create transaction: ${response.message || "Unknown error"}`
			);
		}

		return response.data;
	},

	deleteBorrowTransaction: async (id: string): Promise<void> => {
		await apiClient.delete<ApiResponse<null>>(`/transactions/${id}`);
		return;
	},

	// Return Transactions
	getReturnTransactions: async (): Promise<ApiReturnTransaction[]> => {
		const response = await apiClient.get<ApiResponse<ApiReturnTransaction[]>>(
			`/return-transactions`
		);
		return response.data;
	},

	createReturnTransaction: async (
		payload: CreateReturnTransactionPayload
	): Promise<ApiReturnTransaction> => {
		const response = await apiClient.post<ApiResponse<ApiReturnTransaction>>(
			`/return-transactions`,
			payload
		);

		if (response.status !== "success") {
			throw new Error(
				`Failed to create return transaction: ${
					response.message || "Unknown error"
				}`
			);
		}

		return response.data;
	},
};
