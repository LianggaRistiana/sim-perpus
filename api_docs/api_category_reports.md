# Category Reports API Documentation

## Overview
Dokumentasi ini mencakup endpoint-endpoint untuk laporan kategori perpustakaan.

---

## 1. Most Borrowed Categories

### Endpoint
```
GET /api/library/reports/most-borrowed-categories
```

### Description
Mengembalikan daftar kategori buku yang paling sering dipinjam berdasarkan jumlah transaksi peminjaman aktual, diurutkan dari yang terbanyak ke yang paling sedikit.

### Authentication
Bearer Token required

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `limit` | integer | No | 10 | Jumlah maksimal kategori yang dikembalikan |

### Success Response (200 OK)

```json
{
  "status": "success",
  "data": [
    {
      "category_id": 1,
      "category_name": "Fiction",
      "description": "Fictional books and novels",
      "total_books": 25,
      "total_borrows": 150,
      "currently_borrowed": 8,
      "avg_borrows_per_book": 6.00
    }
  ],
  "error": null,
  "meta": null
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `category_id` | integer | ID unik kategori |
| `category_name` | string | Nama kategori |
| `description` | string\|null | Deskripsi kategori |
| `total_books` | integer | Total jumlah buku master dalam kategori |
| `total_borrows` | integer | Total jumlah peminjaman untuk semua buku dalam kategori |
| `currently_borrowed` | integer | Jumlah buku dari kategori yang sedang dipinjam saat ini |
| `avg_borrows_per_book` | decimal | Rata-rata peminjaman per buku (total_borrows / total_books) |

### Error Response (500)

```json
{
  "status": "error",
  "data": null,
  "error": "Failed to generate most borrowed categories report: [error message]",
  "meta": null
}
```

### Notes
- Data mencakup semua transaksi peminjaman (selesai dan sedang berlangsung)
- Hasil diurutkan berdasarkan `total_borrows` secara descending
- Kategori tanpa peminjaman tetap akan muncul dengan nilai 0

---

## 2. Longest Borrowed Categories

### Endpoint
```
GET /api/library/reports/longest-borrowed-categories
```

### Description
Mengembalikan daftar kategori buku dengan durasi peminjaman rata-rata terpanjang, diurutkan dari durasi terpanjang ke terpendek.

### Authentication
Bearer Token required

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `limit` | integer | No | 10 | Jumlah maksimal kategori yang dikembalikan |

### Success Response (200 OK)

```json
{
  "status": "success",
  "data": [
    {
      "category_id": 3,
      "category_name": "Reference",
      "description": "Reference and encyclopedia books",
      "total_borrows": 45,
      "total_books": 12,
      "avg_borrow_days": 18.5,
      "min_borrow_days": 7,
      "max_borrow_days": 30
    }
  ],
  "error": null,
  "meta": null
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `category_id` | integer | ID unik kategori |
| `category_name` | string | Nama kategori |
| `description` | string\|null | Deskripsi kategori |
| `total_borrows` | integer | Total jumlah transaksi peminjaman yang sudah dikembalikan |
| `total_books` | integer | Total jumlah buku master dalam kategori |
| `avg_borrow_days` | decimal | Rata-rata durasi peminjaman dalam hari (1 desimal) |
| `min_borrow_days` | integer | Durasi peminjaman terpendek dalam kategori (hari) |
| `max_borrow_days` | integer | Durasi peminjaman terpanjang dalam kategori (hari) |

### Error Response (500)

```json
{
  "status": "error",
  "data": null,
  "error": "Failed to generate longest borrowed categories report: [error message]",
  "meta": null
}
```

### Notes
- Hanya menghitung transaksi yang **sudah dikembalikan** (memiliki return transaction)
- Peminjaman yang masih berlangsung **tidak** dihitung
- Durasi dihitung dengan: `DATEDIFF(return_date, borrow_date)`
- Kategori tanpa transaksi pengembalian **tidak** akan muncul dalam hasil
- Hasil diurutkan berdasarkan `avg_borrow_days` secara descending

---

## Comparison

| Aspect | Most Borrowed Categories | Longest Borrowed Categories |
|--------|-------------------------|----------------------------|
| **Metric** | Jumlah peminjaman | Durasi peminjaman (hari) |
| **Data Source** | Semua transaksi | Hanya transaksi selesai |
| **Main Field** | `total_borrows` | `avg_borrow_days` |
| **Sorting** | Total borrows DESC | Avg borrow days DESC |
| **Empty Categories** | Included (value 0) | Not included |
| **Use Case** | Popularitas kategori | Kedalaman penggunaan |

---

## TypeScript Interfaces

```typescript
export interface MostBorrowedCategory {
  category_id: number;
  category_name: string;
  description: string | null;
  total_books: number;
  total_borrows: number;
  currently_borrowed: number;
  avg_borrows_per_book: number;
}

export interface LongestBorrowedCategory {
  category_id: number;
  category_name: string;
  description: string | null;
  total_borrows: number;
  total_books: number;
  avg_borrow_days: number;
  min_borrow_days: number;
  max_borrow_days: number;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T | null;
  error: string | null;
  meta: any | null;
}
```

---

**Last Updated**: December 22, 2025  
**Version**: 1.0.0
