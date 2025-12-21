import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Plus, CheckCircle, Clock, AlertCircle, Search } from "lucide-react";
import { api } from "../../services/api";
import type {
	ApiBorrowTransaction,
	ApiPaginatedResponse,
} from "../../types/transaction-api.types";
import { Pagination } from "../../components/Pagination";
import { TableEmpty, TableLoading } from "../../components/TableState";

const TransactionList: React.FC = () => {
	const navigate = useNavigate();

	// Data State
	const [transactions, setTransactions] = useState<ApiBorrowTransaction[]>([]);
	const [loading, setLoading] = useState(true);
	const [meta, setMeta] = useState<ApiPaginatedResponse<any>["meta"] | null>(
		null
	);

	// Filter State
	const [searchParams] = useSearchParams();
	const [page, setPage] = useState(1);
	const [perPage, setPerPage] = useState(10);
	const [search, setSearch] = useState(() => searchParams.get('search') || "");
	const [status, setStatus] = useState("");
	const [overdue] = useState(false);
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");

	// Debounce search
	const [debouncedSearch, setDebouncedSearch] = useState(search);

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedSearch(search);
		}, 500);
		return () => clearTimeout(handler);
	}, [search]);

	// Reset page when filters change (except page itself)
	useEffect(() => {
		setPage(1);
	}, [debouncedSearch, status, overdue, startDate, endDate]);

	useEffect(() => {
		fetchData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [page, perPage, debouncedSearch, status, overdue, startDate, endDate]);

	const fetchData = async () => {
		setLoading(true);
		try {
			const response = await api.getBorrowTransactions({
				page,
				per_page: perPage,
				search: debouncedSearch,
				status: status === "all" ? undefined : status,
				overdue: overdue ? true : undefined,
				start_date: startDate || undefined,
				end_date: endDate || undefined,
			});

			setTransactions(response.data);
			setMeta(response.meta);
		} catch (error) {
			console.error("Error fetching data:", error);
			setTransactions([]); // Clear data on error
		} finally {
			setLoading(false);
		}
	};

	const getStatusBadge = (status: string, dueDate: string) => {
		const normalizedStatus = status.toLowerCase();
		const isOverdue =
			new Date() > new Date(dueDate) && normalizedStatus === "borrowed";

		if (normalizedStatus === "returned") {
			return (
				<span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
					<CheckCircle size={12} /> Dikembalikan
				</span>
			);
		}
		if (isOverdue) {
			return (
				<span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700">
					<AlertCircle size={12} /> Terlambat
				</span>
			);
		}
		return (
			<span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
				<Clock size={12} /> Dipinjam
			</span>
		);
	};

	return (
		<div className="flex h-full flex-col bg-neutral-50 px-8 pt-8">
			<div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<div>
					<h1 className="text-2xl font-bold text-neutral-900">
						Transaksi Peminjaman
					</h1>
					<p className="text-neutral-600">
						Kelola peminjaman dan pengembalian buku
					</p>
				</div>
				<Link
					to="/dashboard/transactions/new"
					className="flex items-center justify-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800">
					<Plus size={20} />
					Peminjaman Baru
				</Link>
			</div>

			{/* Filters */}
			<div className="mb-6 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
					<div className="relative lg:col-span-2">
						<Search
							className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
							size={18}
						/>
						<input
							type="text"
							placeholder="Cari kode transaksi, nama siswa..."
							className="w-full rounded-lg border border-neutral-200 py-2 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
					</div>

					<div>
						<select
							className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
							value={status}
							onChange={(e) => setStatus(e.target.value)}>
							<option value="">Semua Status</option>
							<option value="borrowed">Dipinjam</option>
							<option value="returned">Dikembalikan</option>
							<option value="overdue">Terlambat</option>
						</select>
					</div>

					<div>
						<input
							type="date"
							className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
							value={startDate}
							onChange={(e) => setStartDate(e.target.value)}
							placeholder="Dari Tanggal"
						/>
					</div>
					<div>
						<input
							type="date"
							className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
							value={endDate}
							onChange={(e) => setEndDate(e.target.value)}
							placeholder="Sampai Tanggal"
						/>
					</div>
				</div>
			</div>

			<div className="flex-1 min-h-0 rounded-xl border mb-6 border-neutral-200 bg-white shadow-sm overflow-hidden flex flex-col">
				<div className="flex-1 overflow-auto">
					<table className="w-full text-left text-sm">
						<thead className="sticky top-0 z-10 bg-neutral-50 text-neutral-500">
							<tr>
								<th className="px-6 py-4 font-medium">ID Transaksi</th>
								<th className="px-6 py-4 font-medium">Peminjam</th>
								<th className="px-6 py-4 font-medium">Tanggal Pinjam</th>
								<th className="px-6 py-4 font-medium">Jatuh Tempo</th>
								<th className="px-6 py-4 font-medium">Status</th>
								<th className="px-6 py-4 font-medium text-right">Aksi</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-neutral-100">
							{loading ? (
								<TableLoading colSpan={6} />
							) : transactions.length === 0 ? (
								<TableEmpty
									colSpan={6}
									message="Tidak ada transaksi ditemukan"
									description="Coba cari dengan kata kunci lain atau tambahkan transaksi baru."
								/>
							) : (
								transactions.map((t) => (
									<tr
										key={t.id || Math.random()}
										className="hover:bg-neutral-50 cursor-pointer transition-colors"
										onClick={() => navigate(`/dashboard/transactions/${t.id}`)}>
										<td className="px-6 py-4 font-mono text-neutral-500">
											<span className="rounded bg-neutral-100 px-2 py-0.5">
												{t.transaction_code}
											</span>
										</td>
										<td className="px-6 py-4 font-medium text-neutral-900">
											{t.borrower?.name || "Unknown"}
											<div className="text-xs text-neutral-500">
												{t.borrower?.user_number || t.borrower?.nis}
											</div>
										</td>
										<td className="px-6 py-4 text-neutral-600">
											{t.borrow_date
												? new Date(t.borrow_date).toLocaleDateString("id-ID")
												: "-"}
										</td>
										<td className="px-6 py-4 text-neutral-600">
											{t.due_date
												? new Date(t.due_date).toLocaleDateString("id-ID")
												: "-"}
										</td>
										<td className="px-6 py-4">
											{getStatusBadge(t.status || "borrowed", t.due_date || "")}
										</td>
										<td className="px-6 py-4 text-right">
											{(t.status || "").toLowerCase() === "borrowed" && (
												<Link
													to={`/dashboard/transactions/${t.id}/return`}
													className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors"
													onClick={(e) => e.stopPropagation()}>
													Proses Kembali
												</Link>
											)}
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>
			{meta && (
				<Pagination
					currentPage={meta.current_page}
					totalPages={meta.last_page}
					totalItems={meta.total}
					itemsPerPage={meta.per_page}
					onPageChange={setPage}
					onItemsPerPageChange={setPerPage}
				/>
			)}
		</div>
	);
};

export default TransactionList;
