# InstaPulse — riwayat followers

Paket ini menambahkan penyimpanan snapshot followers dengan Supabase dan mengganti grafik contoh menjadi grafik berdasarkan snapshot asli.

## 1. Buat project Supabase
1. Buka https://supabase.com/ lalu buat project baru. Simpan password database dengan aman.
2. Buka **SQL Editor** → **New query**.
3. Salin isi `supabase/follower_snapshots.sql`, jalankan (**Run**).
4. Buka **Project Settings → API** (atau bagian API Keys pada dashboard baru). Salin Project URL dan `service_role`/secret key. Jangan pernah memasukkan service role key ke komponen client atau membagikannya.

## 2. Tambahkan environment variables
Di `.env.local` project Next.js, tambahkan dua baris berikut dengan nilai dari Supabase:

```env
SUPABASE_URL=https://PROJECT_REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=ISI_SERVICE_ROLE_KEY_DI_SINI
```

Jangan hapus variabel Instagram yang sudah ada. Jangan beri awalan `NEXT_PUBLIC_` pada service role key. Restart dev server setelah mengubah `.env.local` (Ctrl+C lalu `npm run dev`).

## 3. Pasang package
Jalankan dari folder project:

```bash
npm install @supabase/supabase-js
```

## 4. Salin file
Salin file/folder dari paket ini ke root project dengan struktur yang sama:
- `src/lib/supabaseAdmin.ts`
- `src/app/api/instagram/followers-history/route.ts`
- `src/app/page.tsx` (menggantikan dashboard lama)
- `supabase/follower_snapshots.sql` (referensi SQL)

Pastikan alias `@/*` sudah bekerja seperti pada project Next.js standar.

## 5. Tes
1. Hubungkan akun Instagram seperti biasa.
2. Buka dashboard `/`.
3. Periksa Network atau buka `/api/instagram/followers-history?days=7`. Jika sukses, respons memiliki `currentFollowers` dan `snapshots`.
4. Di Supabase → Table Editor → `follower_snapshots`, seharusnya ada satu baris untuk hari ini.

## Catatan penting
- Versi ini menyimpan/memperbarui satu snapshot per akun Instagram per hari **ketika dashboard dibuka**. Unique constraint mencegah beberapa reload di hari yang sama membuat duplikat.
- Untuk mengumpulkan snapshot setiap hari tanpa harus membuka dashboard, perlu scheduler/cron yang berjalan di server dan strategi aman untuk akses token Instagram. Jangan mengirim token Instagram ke browser atau memasukkannya ke database tanpa desain keamanan yang tepat.
- Riwayat dimulai sejak snapshot pertama. Supabase tidak dapat menciptakan data followers historis sebelum pencatatan dimulai. Grafik baru akan memiliki tren setelah ada setidaknya dua tanggal snapshot.
- Grafik ini menunjukkan **jumlah followers total per hari**, bukan followers baru per hari. Perubahan harian bisa dihitung dari selisih dua snapshot.
- RLS diaktifkan pada tabel. API menggunakan service-role key di server saja; jangan gunakan key ini pada client.
