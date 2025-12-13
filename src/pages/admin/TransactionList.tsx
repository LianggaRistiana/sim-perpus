import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { api } from "../../services/api";
import type { ApiBorrowTransaction } from "../../types/transaction-api.types";

const TransactionList: React.FC = () => {
	const [transactions, setTransactions] = useState<ApiBorrowTransaction[]>([]);
	// const [students, setStudents] = useState<Student[]>([]); // Removed as student info is embedded
	const [loading, setLoading] = useState(true);

	const navigate = useNavigate();

	useEffect(() => {
		fetchData();
	}, []);

	const fetchData = async () => {
		setLoading(true);
		try {
			const transData = await api.getBorrowTransactions();

			// Sort by date desc
			setTransactions(
				transData.sort(
					(a, b) =>
						new Date(b.borrow_date).getTime() -
						new Date(a.borrow_date).getTime()
				)
			);
		} catch (error) {
			console.error("Error fetching data:", error);
		} finally {
			setLoading(false);
		}
	};

	const getStatusBadge = (status: string, dueDate: string) => {
		// Status from API might be lowercase 'borrowed' | 'returned' | 'overdue'
		// Or Title Check based on mock usage. Let's normalize.
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
		<div className="min-h-screen bg-neutral-50 p-8">
			<div className="mb-8 flex items-center justify-between">
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
					className="flex items-center gap-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800">
					<Plus size={20} />
					Peminjaman Baru
				</Link>
			</div>

			<div className="rounded-xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
				<table className="w-full text-left text-sm">
					<thead className="bg-neutral-50 text-neutral-500">
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
							<tr>
								<td
									colSpan={6}
									className="px-6 py-8 text-center text-neutral-500">
									Memuat data...
								</td>
							</tr>
						) : transactions.length === 0 ? (
							<tr>
								<td
									colSpan={6}
									className="px-6 py-8 text-center text-neutral-500">
									Belum ada transaksi.
								</td>
							</tr>
						) : (
							transactions.map((t) => (
								<tr
									key={t.id || Math.random()}
									className="hover:bg-neutral-50 cursor-pointer"
									onClick={() => navigate(`/dashboard/transactions/${t.id}`)}>
									<td className="px-6 py-4 font-mono text-neutral-500">
										#{t.transaction_code}
									</td>
									<td className="px-6 py-4 font-medium text-neutral-900">
										{t.borrower?.name || "Unknown"}
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
												className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100"
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
	);
};

export default TransactionList;
