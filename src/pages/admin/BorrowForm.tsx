import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Save, Trash } from "lucide-react";
import { apiClient } from "../../lib/api-client";
import { api } from "../../services/api";
import BackButton from "../../components/BackButton";
import { LoadingScreen } from "../../components/LoadingScreen";
import { useToast } from "../../components/Toast";
import { AsyncSelect, type Option } from "../../components/AsyncSelect";
import type { BookItem, PaginatedResponse } from "../../types";

const BorrowForm: React.FC = () => {
	const navigate = useNavigate();
	const { showToast } = useToast();
	const [loading, setLoading] = useState(false);

	const [selectedStudent, setSelectedStudent] = useState<Option | null>(null);
	const [selectedBookIds, setSelectedBookIds] = useState<string[]>([]);
	const [selectedBookItems, setSelectedBookItems] = useState<BookItem[]>([]);
	const [currentBook, setCurrentBook] = useState<Option | null>(null);
	const [duration, setDuration] = useState(7);

	const loadStudentOptions = async ({
		page,
		keyword,
	}: {
		page: number;
		keyword: string;
	}) => {
		try {
			const response = await api.getStudents({ page, limit: 10, keyword });
			return {
				options: response.data.map((s) => ({
					id: s.id,
					label: `${s.user_number} - ${s.name}`,
				})),
				hasMore: response.meta.page < response.meta.last_page,
			};
		} catch (error) {
			console.error("Failed to load students", error);
			return { options: [], hasMore: false };
		}
	};

	const loadBookOptions = async ({
		keyword,
		page,
	}: {
		page: number;
		keyword: string;
	}) => {
		try {
			// Direct API call to support pagination and filtering without modifying global service
			const query = new URLSearchParams();
			query.append("page", page.toString());
			query.append("limit", "20");
			query.append("status", "available");
			if (keyword) query.append("keyword", keyword);

			const response = await apiClient.get<PaginatedResponse<any>>(
				`/book-items?${query.toString()}`
			);

			// Map backend response
			const items = response.data.map((item) => ({
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
			})) as BookItem[];

			// Filter out already selected books (best effort client-side for current page)
			const availableItems = items.filter(
				(i) => !selectedBookIds.includes(i.id)
			);

			return {
				options: availableItems.map((b) => ({
					id: b.id,
					label: `${b.code} - ${b.book_master?.title || "Unknown Title"}`,
					original: b,
				})),
				hasMore: response.meta?.page < response.meta?.last_page,
			};
		} catch (error) {
			console.error("Failed to load books", error);
			return { options: [], hasMore: false };
		}
	};

	const handleAddBook = () => {
		if (!currentBook) return;
		if (selectedBookIds.includes(currentBook.id)) {
			showToast("Buku ini sudah ditambahkan ke daftar", "error");
			return;
		}

		setSelectedBookIds([...selectedBookIds, currentBook.id]);
		// Type assertion since we know 'original' exists from our loadBookOptions
		const bookItem = (currentBook as any).original as BookItem;
		setSelectedBookItems([...selectedBookItems, bookItem]);
		setCurrentBook(null);
	};

	const handleRemoveBook = (id: string) => {
		setSelectedBookIds(selectedBookIds.filter((bookId) => bookId !== id));
		setSelectedBookItems(selectedBookItems.filter((item) => item.id !== id));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedStudent || selectedBookIds.length === 0) {
			showToast("Pilih siswa dan minimal satu buku", "error");
			return;
		}

		setLoading(true);
		try {
			const borrowDate = new Date();
			const dueDate = new Date();
			dueDate.setDate(dueDate.getDate() + duration);

			await api.createBorrowTransaction({
				borrower_id: selectedStudent.id,
				borrow_date: borrowDate.toISOString().split("T")[0],
				due_date: dueDate.toISOString().split("T")[0],
				items: selectedBookIds,
			});
			showToast("Transaksi berhasil dibuat", "success");
			navigate("/dashboard/transactions");
		} catch (error: any) {
			console.error("Error creating transaction:", error);
			const message =
				error.response?.error?.message ||
				error.response?.data?.message ||
				"Buku yang dipilih sedang dipinjam";
			showToast(message, "error");
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return <LoadingScreen />;
	}

	return (
		<div className="min-h-screen bg-neutral-50 p-8">
			<div className="mx-auto max-w-6xl">
				<div className="mb-8 flex items-center gap-4">
					<BackButton to="/dashboard/transactions" />
					<div>
						<h1 className="text-2xl font-bold text-neutral-900">
							Peminjaman Baru
						</h1>
						<p className="text-neutral-600">Catat transaksi peminjaman buku</p>
					</div>
				</div>

				<form onSubmit={handleSubmit}>
					<div className="grid gap-8 lg:grid-cols-3">
						{/* Left Column: General Info & Add Book */}
						<div className="space-y-6 lg:col-span-1">
							<div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
								<h2 className="mb-4 text-lg font-bold text-neutral-900">
									Informasi Umum
								</h2>
								<div className="space-y-4">
									<div>
										<label className="mb-2 block text-sm font-medium text-neutral-700">
											Pilih Siswa
										</label>
										<AsyncSelect
											placeholder="Cari siswa..."
											loadOptions={loadStudentOptions}
											value={selectedStudent}
											onChange={setSelectedStudent}
										/>
									</div>

									<div>
										<label className="mb-2 block text-sm font-medium text-neutral-700">
											Durasi (Hari)
										</label>
										<input
											type="number"
											min="1"
											max="30"
											required
											className="w-full rounded-lg border border-neutral-300 p-2.5 focus:border-blue-500 focus:outline-none"
											value={duration}
											onChange={(e) => setDuration(parseInt(e.target.value))}
										/>
									</div>
								</div>
							</div>

							<div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
								<h2 className="mb-4 text-lg font-bold text-neutral-900">
									Tambah Buku
								</h2>
								<div className="space-y-4">
									<div>
										<label className="mb-2 block text-sm font-medium text-neutral-700">
											Cari Buku (Available)
										</label>
										<AsyncSelect
											key={selectedBookIds.length} // Force reset options when selection changes to filter out selected
											placeholder="Cari buku..."
											loadOptions={loadBookOptions}
											value={currentBook}
											onChange={setCurrentBook}
										/>
									</div>
									<button
										type="button"
										onClick={handleAddBook}
										disabled={!currentBook}
										className="w-full rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50">
										Tambah ke Daftar
									</button>
								</div>
							</div>
						</div>

						{/* Right Column: Book List */}
						<div className="lg:col-span-2">
							<div className="flex h-full flex-col rounded-xl border border-neutral-200 bg-white shadow-sm">
								<div className="border-b border-neutral-200 p-6">
									<div className="flex items-center justify-between">
										<h2 className="text-lg font-bold text-neutral-900">
											Daftar Buku Dipinjam
										</h2>
										<span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
											{selectedBookIds.length} Buku
										</span>
									</div>
								</div>

								<div className="flex-1 p-6">
									{selectedBookIds.length === 0 ? (
										<div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed border-neutral-300 text-neutral-500">
											<p>Belum ada buku yang dipilih</p>
											<p className="text-sm">
												Silakan cari dan tambahkan buku di panel kiri
											</p>
										</div>
									) : (
										<div className="space-y-4 overflow-y-auto lg:h-[calc(35vh-2rem)] pr-2">
											{selectedBookItems.map((book, index) => (
												<div
													key={book.id}
													className="flex items-center justify-between rounded-lg border border-neutral-100 bg-neutral-50 p-4">
													<div className="flex items-center gap-4">
														<div className="flex h-8 w-8 items-center justify-center rounded-full bg-white font-mono text-sm font-bold text-neutral-500 shadow-sm">
															{index + 1}
														</div>
														<div>
															<p className="font-medium text-neutral-900">
																{book.book_master?.title}
															</p>
															<p className="text-sm text-neutral-500">
																{book.code} • {book.book_master?.author}
															</p>
														</div>
													</div>
													<button
														type="button"
														onClick={() => handleRemoveBook(book.id)}
														className="rounded-lg p-2 text-red-500 hover:bg-red-50">
														<Trash size={15} />
													</button>
												</div>
											))}
										</div>
									)}
								</div>

								<div className="border-t border-neutral-200 p-6">
									<div className="flex justify-end gap-4">
										<button
											type="button"
											onClick={() => navigate("/dashboard/transactions")}
											className="rounded-lg px-6 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100">
											Batal
										</button>
										<button
											type="submit"
											disabled={
												loading ||
												selectedBookIds.length === 0 ||
												!selectedStudent
											}
											className="flex items-center gap-2 rounded-lg bg-neutral-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-70">
											<Save size={20} />
											{loading ? "Menyimpan..." : "Simpan Transaksi"}
										</button>
									</div>
								</div>
							</div>
						</div>
					</div>
				</form>
			</div>
		</div>
	);
};

export default BorrowForm;
