import { apiClient } from "../lib/api-client";
import type {
	ApiBorrowTransaction,
	ApiReturnTransaction,
	CreateBorrowTransactionPayload,
	CreateReturnTransactionPayload,
	ApiResponse,
} from "../types/transaction-api.types";

export const transactionApiService = {
	getBorrowTransactions: async (): Promise<ApiBorrowTransaction[]> => {
		const response = await apiClient.get<ApiResponse<ApiBorrowTransaction[]>>(
			`/transactions`
		);
		return response.data;
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
