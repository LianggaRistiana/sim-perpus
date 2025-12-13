import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Save } from "lucide-react";
import { api } from "../../services/api";
import BackButton from "../../components/BackButton";
import { LoadingScreen } from "../../components/LoadingScreen";
import { useToast } from "../../components/Toast";
import type {
	ApiBorrowTransaction,
	ReturnItemPayload,
} from "../../types/transaction-api.types";

const ReturnForm: React.FC = () => {
	const navigate = useNavigate();
	const { showToast } = useToast();
	const { id } = useParams<{ id: string }>();

	const [transaction, setTransaction] = useState<ApiBorrowTransaction | null>(
		null
	);
	const [returnItems, setReturnItems] = useState<
		Record<string, ReturnItemPayload>
	>({});
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (id) fetchData(id);
	}, [id]);

	const fetchData = async (transId: string) => {
		setLoading(true);
		try {
			const trans = await api.getBorrowTransactionById(transId);
			setTransaction(trans);

			// Initialize return items state
			const initialItems: Record<string, ReturnItemPayload> = {};
			trans.details.forEach((item) => {
				initialItems[item.book_item.id] = {
					book_item_id: item.book_item.id,
					status: "available",
					condition_at_return: "good",
					notes: "",
				};
			});
			setReturnItems(initialItems);
			setReturnItems(initialItems);
		} catch (error) {
			console.error("Error fetching data:", error);
			showToast("Transaksi tidak ditemukan", "error");
			navigate("/dashboard/transactions");
		} finally {
			setLoading(false);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!transaction) return;

		if (window.confirm("Proses pengembalian buku?")) {
			setLoading(true);
			try {
				const itemsToReturn = Object.values(returnItems);
				await api.createReturnTransaction({
					borrow_transaction_id: transaction.id,
					return_date: new Date().toISOString().split("T")[0],
					items: itemsToReturn,
				});
				navigate("/dashboard/transactions");
			} catch (error) {
				console.error("Error processing return:", error);
				showToast("Gagal memproses pengembalian", "error");
			} finally {
				setLoading(false);
			}
		}
	};

	const updateItemState = (
		itemId: string,
		field: keyof ReturnItemPayload,
		value: any
	) => {
		setReturnItems((prev) => ({
			...prev,
			[itemId]: {
				...prev[itemId],
				[field]: value,
			},
		}));
	};

	if (loading) return <LoadingScreen />;
	if (!transaction)
		return <div className="p-8">Transaksi tidak ditemukan.</div>;

	return (
		<div className="min-h-screen bg-neutral-50 p-8">
			<div className="mx-auto max-w-6xl">
				<div className="mb-8 flex items-center justify-between">
					<div className="flex items-center gap-4">
						<BackButton to="/dashboard/transactions" />
						<div>
							<h1 className="text-2xl font-bold text-neutral-900">
								Pengembalian Buku
							</h1>
							<p className="text-neutral-600">
								Proses pengembalian & cek kondisi buku
							</p>
						</div>
					</div>
				</div>

				<form
					onSubmit={handleSubmit}
					className="grid gap-8 lg:grid-cols-3 relative">
					{/* Left Column: Transaction Details (Sticky) */}
					<div className="space-y-6 lg:col-span-1 lg:sticky lg:top-8 h-fit">
						<div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
							<h3 className="mb-4 text-lg font-bold text-neutral-900 border-b border-neutral-100 pb-2">
								Informasi Peminjaman
							</h3>
							<div className="space-y-4 text-sm">
								<div>
									<p className="text-neutral-500 mb-1">ID Transaksi</p>
									<p className="font-mono font-medium bg-neutral-100 px-2 py-1 rounded inline-block text-neutral-700">
										{transaction.transaction_code}
									</p>
								</div>
								<div>
									<p className="text-neutral-500 mb-1">Peminjam</p>
									<p className="font-medium text-neutral-900 text-base">
										{transaction.borrower.name}
									</p>
									<p className="text-xs text-neutral-500">
										NIS: {transaction.borrower.user_number || "-"}
									</p>
								</div>
								<div className="grid grid-cols-2 gap-4 pt-2 border-t border-neutral-50">
									<div>
										<p className="text-neutral-500 mb-1">Tgl Pinjam</p>
										<p className="font-medium">
											{new Date(transaction.borrow_date).toLocaleDateString(
												"id-ID"
											)}
										</p>
									</div>
									<div>
										<p className="text-neutral-500 mb-1">Jatuh Tempo</p>
										<p className="font-medium text-red-600">
											{new Date(transaction.due_date).toLocaleDateString(
												"id-ID"
											)}
										</p>
									</div>
								</div>
							</div>
						</div>

						{/* Quick Actions (Desktop sticky could be added) */}
						<div className="hidden lg:block">
							<button
								type="submit"
								disabled={loading}
								className="w-full flex justify-center items-center gap-2 rounded-xl bg-neutral-900 px-6 py-4 text-sm font-bold text-white shadow-lg hover:bg-neutral-800 disabled:opacity-70 transition-all hover:scale-[1.02]">
								<Save size={20} />
								{loading ? "Memproses..." : "Simpan Pengembalian"}
							</button>
							<button
								type="button"
								onClick={() => navigate("/dashboard/transactions")}
								className="mt-3 w-full rounded-xl px-6 py-3 text-sm font-medium text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors">
								Batalkan
							</button>
						</div>
					</div>

					{/* Right Column: Return Items */}
					<div className="lg:col-span-2 space-y-6 overflow-y-auto lg:h-[calc(100vh-15rem)] pr-2">
						{/* <div className="flex items-center justify-between">
							<h3 className="text-lg font-bold text-neutral-900">
								Daftar Buku ({transaction.details.length})
							</h3>
						</div> */}

						{transaction.details.map((item, index) => {
							const state = returnItems[item.book_item.id];
							if (!state) return null;

							return (
								<div
									key={item.book_item.id}
									className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
									<div className="flex items-start justify-between mb-6">
										<div className="flex gap-4">
											<div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 font-bold">
												{index + 1}
											</div>
											<div>
												<h4 className="font-bold text-neutral-900 text-lg leading-tight">
													{item.book_item.book_master.title}
												</h4>
												<p className="text-sm text-neutral-500 mt-1">
													Penulis: {item.book_item.book_master.author} • Kode:{" "}
													<span className="font-mono text-neutral-700 bg-neutral-100 px-1 rounded">
														{item.book_item.code}
													</span>
												</p>
											</div>
										</div>
										<span className="px-3 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600">
											Kondisi Pinjam: {item.condition_at_borrow}
										</span>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
										{/* Status Input */}
										<div className="space-y-1.5">
											<label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
												Status Pengembalian
											</label>
											<select
												className={`w-full rounded-lg border p-2.5 text-sm font-medium focus:ring-2 focus:outline-none transition-colors ${
													state.status === "lost"
														? "border-red-200 bg-red-50 text-red-700 focus:ring-red-200"
														: "border-neutral-200 focus:border-blue-500 focus:ring-blue-100"
												}`}
												value={state.status}
												onChange={(e) =>
													updateItemState(
														item.book_item.id,
														"status",
														e.target.value
													)
												}>
												<option value="available">Dikembalikan (Ada)</option>
												<option value="lost">Hilang</option>
											</select>
										</div>

										{/* Condition Input (Only if Available) */}
										{state.status === "available" && (
											<div className="space-y-1.5">
												<label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
													Kondisi Fisik
												</label>
												<select
													className="w-full rounded-lg border border-neutral-200 p-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
													value={state.condition_at_return}
													onChange={(e) =>
														updateItemState(
															item.book_item.id,
															"condition_at_return",
															e.target.value
														)
													}>
													<option value="good">Baik / Bagus</option>
													<option value="fair">Cukup (Ada lecet)</option>
													<option value="poor">Rusak Berat</option>
												</select>
											</div>
										)}

										{/* Notes Input */}
										<div
											className={`space-y-1.5 ${
												state.status === "lost" ? "md:col-span-2" : ""
											}`}>
											<label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
												Catatan (Opsional)
											</label>
											<input
												type="text"
												className="w-full rounded-lg border border-neutral-200 p-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-neutral-400"
												value={state.notes || ""}
												onChange={(e) =>
													updateItemState(
														item.book_item.id,
														"notes",
														e.target.value
													)
												}
												placeholder={
													state.status === "lost"
														? "Kronologi kehilangan..."
														: "Keterangan kerusakan..."
												}
											/>
										</div>
									</div>
								</div>
							);
						})}

						{/* Mobile Action Buttons */}
						<div className="lg:hidden grid gap-4 pt-4">
							<button
								type="submit"
								disabled={loading}
								className="w-full flex justify-center items-center gap-2 rounded-xl bg-neutral-900 px-6 py-4 text-sm font-bold text-white shadow-lg active:scale-95 transition-all disabled:opacity-70">
								<Save size={20} />
								{loading ? "Memproses..." : "Simpan Pengembalian"}
							</button>
						</div>
					</div>
				</form>
			</div>
		</div>
	);
};

export default ReturnForm;
