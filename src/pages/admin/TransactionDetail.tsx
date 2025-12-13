import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
	ArrowLeft,
	User,
	Calendar,
	Clock,
	CheckCircle,
	AlertCircle,
	BookOpen,
} from "lucide-react";
import { api } from "../../services/api";
import type {
	ApiBorrowTransaction,
	ApiReturnTransaction,
} from "../../types/transaction-api.types";

const TransactionDetail: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const [transaction, setTransaction] = useState<ApiBorrowTransaction | null>(
		null
	);
	const [returnTransaction, setReturnTransaction] =
		useState<ApiReturnTransaction | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			if (!id) return;
			try {
				const transData = await api.getBorrowTransactionById(id);
				if (transData) {
					setTransaction(transData);

					if (transData.status === "returned") {
						// Attempt to find return transaction
						// Assuming we can filter or just fetch all and find.
						// Realistically backend should provide this linkage or a specific endpoint.
						// For now we fetch all return transactions and find the one matching borrow_id
						const returnsResponse = await api.getReturnTransactions(); // Assuming returns array
						// Checks if response is array or paginated? Service returns ApiReturnTransaction[] directly?
						// Service: getReturnTransactions causes: return response.data if generic.
						// Let's check service implementation. It returns response.data (array).
						const foundReturn = returnsResponse.find(
							(r) =>
								r.borrow_transaction_id === id ||
								r.borrow_transaction?.id === id
						);
						setReturnTransaction(foundReturn || null);
					}
				} else {
					console.error("Transaction not found");
				}
			} catch (error) {
				console.error("Error fetching transaction details:", error);
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, [id]);

	if (loading) {
		return (
			<div className="flex min-h-screen items-center justify-center">
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
			</div>
		);
	}

	if (!transaction) {
		return (
			<div className="flex min-h-screen flex-col items-center justify-center gap-4">
				<h1 className="text-2xl font-bold text-neutral-900">
					Transaksi tidak ditemukan
				</h1>
				<Link
					to="/dashboard/transactions"
					className="text-blue-600 hover:underline">
					Kembali ke Daftar Transaksi
				</Link>
			</div>
		);
	}

	const isOverdue =
		new Date() > new Date(transaction.due_date) &&
		transaction.status === "borrowed";

	return (
		<div className="flex h-screen flex-col bg-neutral-50 overflow-hidden">
			<div className="shrink-0 p-8 pb-4">
				<Link
					to="/dashboard/transactions"
					className="mb-4 inline-flex items-center text-sm font-medium text-neutral-600 hover:text-blue-600">
					<ArrowLeft className="mr-2 h-4 w-4" />
					Kembali ke Daftar Transaksi
				</Link>
				<div className="flex items-center justify-between">
					<h1 className="text-2xl font-bold text-neutral-900">
						Detail Transaksi #{transaction.transaction_code}
					</h1>
					{transaction.status === "borrowed" && (
						<Link
							to={`/dashboard/transactions/${transaction.id}/return`}
							className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
							Proses Pengembalian
						</Link>
					)}
				</div>
			</div>

			<div className="flex-1 overflow-y-auto p-8 pt-0">
				<div className="grid gap-6 md:grid-cols-2">
					{/* Borrowing Data Card */}
					<div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
						<div className="mb-6 flex items-center gap-3 border-b border-neutral-100 pb-4">
							<div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">
								<BookOpen size={20} />
							</div>
							<div>
								<h2 className="text-lg font-bold text-neutral-900">
									Data Peminjaman
								</h2>
								<p className="text-sm text-neutral-500">
									Informasi detail peminjaman
								</p>
							</div>
						</div>

						<div className="space-y-4">
							<div className="flex items-start gap-3">
								<User className="mt-0.5 h-5 w-5 text-neutral-400" />
								<div>
									<p className="text-sm font-medium text-neutral-500">
										Peminjam
									</p>
									<p className="font-medium text-neutral-900">
										{transaction.borrower?.name || "Unknown"}
									</p>
									<p className="text-xs text-neutral-500">
										NIS:{" "}
										{transaction.borrower?.user_number ||
											transaction.borrower?.nis ||
											"-"}
									</p>
								</div>
							</div>

							<div className="flex items-start gap-3">
								<Calendar className="mt-0.5 h-5 w-5 text-neutral-400" />
								<div>
									<p className="text-sm font-medium text-neutral-500">
										Tanggal Pinjam
									</p>
									<p className="text-neutral-900">
										{new Date(transaction.borrow_date).toLocaleDateString(
											"id-ID",
											{
												weekday: "long",
												year: "numeric",
												month: "long",
												day: "numeric",
											}
										)}
									</p>
								</div>
							</div>

							<div className="flex items-start gap-3">
								<Clock className="mt-0.5 h-5 w-5 text-neutral-400" />
								<div>
									<p className="text-sm font-medium text-neutral-500">
										Jatuh Tempo
									</p>
									<p
										className={`font-medium ${
											isOverdue ? "text-red-600" : "text-neutral-900"
										}`}>
										{new Date(transaction.due_date).toLocaleDateString(
											"id-ID",
											{
												weekday: "long",
												year: "numeric",
												month: "long",
												day: "numeric",
											}
										)}
									</p>
									{isOverdue && (
										<span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-red-600">
											<AlertCircle size={12} /> Terlambat
										</span>
									)}
								</div>
							</div>

							<div className="flex items-start gap-3">
								<div className="mt-0.5">
									{transaction.status === "returned" ? (
										<CheckCircle className="h-5 w-5 text-green-500" />
									) : (
										<Clock className="h-5 w-5 text-blue-500" />
									)}
								</div>
								<div>
									<p className="text-sm font-medium text-neutral-500">Status</p>
									<span
										className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
											transaction.status === "returned"
												? "bg-green-50 text-green-700"
												: isOverdue
												? "bg-red-50 text-red-700"
												: "bg-blue-50 text-blue-700"
										}`}>
										{transaction.status === "returned"
											? "Dikembalikan"
											: isOverdue
											? "Terlambat"
											: "Dipinjam"}
									</span>
								</div>
							</div>
						</div>
					</div>

					{/* Return Data Card */}
					{returnTransaction ? (
						<div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
							<div className="mb-6 flex items-center gap-3 border-b border-neutral-100 pb-4">
								<div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600">
									<CheckCircle size={20} />
								</div>
								<div>
									<h2 className="text-lg font-bold text-neutral-900">
										Data Pengembalian
									</h2>
									<p className="text-sm text-neutral-500">
										Informasi pengembalian buku
									</p>
								</div>
							</div>

							<div className="space-y-4">
								<div className="flex items-start gap-3">
									<Calendar className="mt-0.5 h-5 w-5 text-neutral-400" />
									<div>
										<p className="text-sm font-medium text-neutral-500">
											Tanggal Kembali
										</p>
										<p className="text-neutral-900">
											{new Date(
												returnTransaction.return_date
											).toLocaleDateString("id-ID", {
												weekday: "long",
												year: "numeric",
												month: "long",
												day: "numeric",
											})}
										</p>
									</div>
								</div>

								<div className="flex items-start gap-3">
									<User className="mt-0.5 h-5 w-5 text-neutral-400" />
									<div>
										<p className="text-sm font-medium text-neutral-500">
											Admin Penerima
										</p>
										<p className="text-neutral-900">
											Admin #
											{returnTransaction.admin?.id ||
												returnTransaction.admin?.name ||
												"-"}
										</p>
									</div>
								</div>
							</div>
						</div>
					) : (
						<div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-6 text-center">
							<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-200 text-neutral-400">
								<Clock size={24} />
							</div>
							<h3 className="text-lg font-medium text-neutral-900">
								Belum Dikembalikan
							</h3>
							<p className="mt-1 text-sm text-neutral-500">
								Buku ini masih dalam status peminjaman.
							</p>
						</div>
					)}
				</div>

				{/* Borrowed Books List */}
				<div className="mt-6 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
					<div className="mb-6 flex items-center gap-3 border-b border-neutral-100 pb-4">
						<div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
							<BookOpen size={20} />
						</div>
						<div>
							<h2 className="text-lg font-bold text-neutral-900">
								Buku yang Dipinjam
							</h2>
							<p className="text-sm text-neutral-500">
								Daftar buku dalam transaksi ini
							</p>
						</div>
					</div>

					<div className="overflow-x-auto">
						<table className="w-full text-left text-sm">
							<thead className="bg-neutral-50 text-neutral-500">
								<tr>
									<th className="px-4 py-3 font-medium">Kode Buku</th>
									<th className="px-4 py-3 font-medium">Judul</th>
									<th className="px-4 py-3 font-medium">Penulis</th>
									<th className="px-4 py-3 font-medium">Kondisi Awal</th>
									<th className="px-4 py-3 font-medium">Kondisi Kembali</th>
									<th className="px-4 py-3 font-medium">Status Buku</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-neutral-200">
								{transaction.details?.map((item) => (
									<tr key={item.id || Math.random()}>
										<td className="px-4 py-3 font-mono text-neutral-600">
											{item.book_item?.code || "-"}
										</td>
										<td className="px-4 py-3 font-medium text-neutral-900">
											{item.book_item?.book_master.title || "Unknown Book"}
										</td>
										<td className="px-4 py-3 text-neutral-600">
											{item.book_item?.book_master.author || "-"}
										</td>
										<td className="px-4 py-3">
											<span className="inline-flex rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700">
												{item.condition_at_borrow}
											</span>
										</td>

										<td className="px-4 py-3">
											{/* Since return condition is in returnTransaction items, we need to map it if we really want it here.
                                            But ApiBorrowTransaction items might not have return condition directly unless we enrich it.
                                            Api docs say items have 'condition_at_borrow'. 
                                            The return condition is in ApiReturnTransaction.items.
                                            Realistically, we should find the matching item in returnTransaction to show return condition.
                                            */}

											{returnTransaction ? (
												(() => {
													const returnItem = returnTransaction.details?.find(
														(ri) => ri.book_item?.id === item.book_item?.id
													);
													return returnItem &&
														returnItem.condition_at_return ? (
														<span
															className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
																returnItem.condition_at_return.toLowerCase() ===
																"good"
																	? "bg-green-100 text-green-700"
																	: returnItem.condition_at_return.toLowerCase() ===
																	  "new"
																	? "bg-blue-100 text-blue-700"
																	: "bg-red-100 text-red-700"
															}`}>
															{returnItem.condition_at_return}
														</span>
													) : (
														<span className="text-neutral-400">-</span>
													);
												})()
											) : (
												<span className="text-neutral-400">-</span>
											)}
										</td>
										<td className="px-4 py-3">
											<span
												className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
													(
														item.book_item?.status || "unknown"
													).toLowerCase() === "available"
														? "bg-green-100 text-green-700"
														: (
																item.book_item?.status || "unknown"
														  ).toLowerCase() === "borrowed"
														? "bg-blue-100 text-blue-700"
														: (
																item.book_item?.status || "unknown"
														  ).toLowerCase() === "lost"
														? "bg-red-100 text-red-700"
														: "bg-neutral-100 text-neutral-700"
												}`}>
												{item.book_item?.status || "-"}
											</span>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	);
};

export default TransactionDetail;
