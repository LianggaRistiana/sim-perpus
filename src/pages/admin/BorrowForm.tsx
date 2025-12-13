import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Trash } from "lucide-react";
import { api } from "../../services/api";

import type { Student, BookItem } from "../../types";

const BorrowForm: React.FC = () => {
	const navigate = useNavigate();
	const [students, setStudents] = useState<Student[]>([]);
	const [bookItems, setBookItems] = useState<BookItem[]>([]);
	const [loading, setLoading] = useState(true);

	const [selectedStudent, setSelectedStudent] = useState("");
	const [selectedBookIds, setSelectedBookIds] = useState<string[]>([]); // Multi-book support
	const [currentBookId, setCurrentBookId] = useState(""); // For the selector
	const [duration, setDuration] = useState(7);

	useEffect(() => {
		fetchData();
	}, []);

	const fetchData = async () => {
		setLoading(true);
		try {
			const [studentsData, itemsData] = await Promise.all([
				api.getStudents(),
				api.getBookItems(undefined, "available"),
			]);

			setStudents(studentsData.data);
			setBookItems(
				itemsData.filter((item) => item.status.toLowerCase() === "available")
			);
		} catch (error) {
			console.error("Error fetching data:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleAddBook = () => {
		if (!currentBookId) return;
		if (selectedBookIds.includes(currentBookId)) {
			alert("Buku ini sudah ditambahkan ke daftar");
			return;
		}
		setSelectedBookIds([...selectedBookIds, currentBookId]);
		setCurrentBookId("");
	};

	const handleRemoveBook = (id: string) => {
		setSelectedBookIds(selectedBookIds.filter((bookId) => bookId !== id));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!selectedStudent || selectedBookIds.length === 0) {
			alert("Pilih siswa dan minimal satu buku");
			return;
		}

		setLoading(true);
		try {
			const borrowDate = new Date();
			const dueDate = new Date();
			dueDate.setDate(dueDate.getDate() + duration);

			await api.createBorrowTransaction({
				borrower_id: selectedStudent,
				borrow_date: borrowDate.toISOString().split("T")[0],
				due_date: dueDate.toISOString().split("T")[0],
				items: selectedBookIds,
			});
			navigate("/dashboard/transactions");
		} catch (error) {
			console.error("Error creating transaction:", error);
			alert("Gagal membuat transaksi");
		} finally {
			setLoading(false);
		}
	};

	// Helper to get book details
	const getBookDetails = (id: string) => bookItems.find((b) => b.id === id);

	// Filter available books for selector (exclude already selected)
	const availableToSelect = bookItems.filter(
		(b) => !selectedBookIds.includes(b.id)
	);

	return (
		<div className="min-h-screen bg-neutral-50 p-8">
			<div className="mx-auto max-w-6xl">
				<div className="mb-8 flex items-center gap-4">
					<button
						onClick={() => navigate("/dashboard/transactions")}
						className="rounded-lg p-2 hover:bg-neutral-200">
						<ArrowLeft size={24} />
					</button>
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
										<select
											required
											className="w-full rounded-lg border border-neutral-300 p-2.5 focus:border-blue-500 focus:outline-none"
											value={selectedStudent}
											onChange={(e) => setSelectedStudent(e.target.value)}>
											<option value="">-- Pilih Siswa --</option>
											{students.map((s) => (
												<option key={s.id} value={s.id}>
													{s.user_number} - {s.name}
												</option>
											))}
										</select>
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
											Pilih Buku (Available)
										</label>
										<select
											className="w-full rounded-lg border border-neutral-300 p-2.5 focus:border-blue-500 focus:outline-none"
											value={currentBookId}
											onChange={(e) => setCurrentBookId(e.target.value)}>
											<option value="">-- Pilih Buku --</option>
											{availableToSelect.map((item) => (
												<option key={item.id} value={item.id}>
													{item.code} - {item.book_master?.title}
												</option>
											))}
										</select>
										{bookItems.length === 0 && !loading && (
											<p className="mt-1 text-xs text-red-500">
												Tidak ada buku tersedia.
											</p>
										)}
									</div>
									<button
										type="button"
										onClick={handleAddBook}
										disabled={!currentBookId}
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
												Silakan pilih buku di panel kiri
											</p>
										</div>
									) : (
										<div className="space-y-4 overflow-y-auto lg:h-[calc(35vh-2rem)] pr-2">
											{selectedBookIds.map((id, index) => {
												const book = getBookDetails(id);
												if (!book) return null;
												return (
													<div
														key={id}
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
															onClick={() => handleRemoveBook(id)}
															className="rounded-lg p-2 text-red-500 hover:bg-red-50">
															<Trash size={15} />
														</button>
													</div>
												);
											})}
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
