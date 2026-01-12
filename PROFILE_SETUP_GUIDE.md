# Panduan Setup Profil Host & Upload Foto

## ⚠️ PENTING: Urutan yang Benar

### 1️⃣ Buat Profil Terlebih Dahulu
Sebelum bisa upload foto, Anda **HARUS** membuat profil host terlebih dahulu.

### 2️⃣ Upload Foto
Setelah profil tersimpan, baru bisa upload foto.

---

## 📋 Langkah-Langkah Lengkap

### Step 1: Login sebagai Host
1. Buka `http://localhost:5173/login`
2. Login dengan akun host (contoh: sarah@example.com / password123)
3. Anda akan masuk ke dashboard host

### Step 2: Buat/Update Profil
1. Klik menu **"Kelola Profil"** di sidebar kiri
2. Isi semua field yang required:

   **Field Required:**
   - ✅ **Title** - Judul properti (min 3 karakter, max 100)
     - Contoh: "Cozy Apartment in Jakarta"
   
   - ✅ **Description** - Deskripsi lengkap (min 10 karakter, max 2000)
     - Contoh: "Beautiful apartment with city view, fully furnished, near shopping mall"
   
   - ✅ **City** - Nama kota
     - Contoh: "Jakarta"
   
   - ✅ **Country** - Nama negara
     - Contoh: "Indonesia"
   
   - ✅ **Max Guests** - Jumlah tamu maksimal (1-100)
     - Contoh: 2
   
   - ✅ **Amenities** - Pilih fasilitas (klik untuk select/deselect)
     - Contoh: WiFi, Kitchen, Parking

   **Field Optional:**
   - Address - Alamat lengkap

3. Klik tombol **"Save Changes"** (biru, di bawah form)
4. Tunggu notifikasi hijau: ✅ "Profile saved successfully!"

### Step 3: Upload Foto
Setelah profil berhasil disimpan:

1. Tombol **"Upload Photos (0/10)"** sekarang AKTIF (tidak abu-abu)
2. Klik tombol tersebut
3. Pilih 1 atau lebih foto dari komputer Anda
4. Foto akan langsung diupload dan muncul di gallery

**Aturan Upload:**
- ✅ Format: JPEG, PNG, atau WebP
- ✅ Ukuran: Max 5MB per file
- ✅ Jumlah: Max 10 foto total
- ❌ Format lain (PDF, GIF, SVG, dll) akan ditolak

### Step 4: Kelola Foto
- **Lihat Foto**: Semua foto ditampilkan dalam grid 2 kolom
- **Hapus Foto**: 
  1. Hover mouse pada foto
  2. Klik tombol ❌ (merah) di pojok kanan atas
  3. Klik OK pada dialog konfirmasi
  4. Foto akan terhapus

---

## ❌ Error Messages & Solusinya

### 1. "Host profile not found. Please create a profile first."
**Penyebab:** Profil belum dibuat

**Solusi:**
1. Isi form profil lengkap
2. Klik "Save Changes"
3. Tunggu notifikasi sukses
4. Baru bisa upload foto

### 2. "Title is required" (atau field lain)
**Penyebab:** Ada field required yang kosong

**Solusi:**
Pastikan semua field berikut terisi:
- Title
- Description
- City
- Country
- Max Guests (minimal 1)

### 3. "You can only upload up to 10 photos"
**Penyebab:** Sudah mencapai batas maksimal

**Solusi:**
1. Hapus foto lama terlebih dahulu
2. Baru upload foto baru

### 4. "Invalid file type"
**Penyebab:** Format file tidak didukung

**Solusi:**
Gunakan hanya:
- ✅ JPEG (.jpg, .jpeg)
- ✅ PNG (.png)
- ✅ WebP (.webp)

### 5. "File too large"
**Penyebab:** File lebih dari 5MB

**Solusi:**
1. Kompres foto menggunakan tools online
2. Atau resize foto menjadi lebih kecil
3. Recommended: 1920x1080 atau lebih kecil

---

## 🎨 UI States

### State 1: Belum Ada Profil
```
┌─────────────────────────────┐
│   [Camera Icon]             │
│   No photos yet             │
│                             │
│ [Upload Photos (0/10)] 🔒   │ ← DISABLED (abu-abu)
│                             │
│ ⚠️ Save your profile first  │
│    before uploading photos  │
└─────────────────────────────┘
```

### State 2: Profil Sudah Ada, Belum Ada Foto
```
┌─────────────────────────────┐
│   [Camera Icon]             │
│   No photos yet             │
│                             │
│ [Upload Photos (0/10)] ✅   │ ← ENABLED (putih/biru)
│                             │
│ 📝 Upload up to 10 photos.  │
│    Max 5MB each. JPEG,      │
│    PNG, or WebP format.     │
└─────────────────────────────┘
```

### State 3: Sudah Ada Foto
```
┌─────────────────────────────┐
│  [Photo 1] ❌  [Photo 2] ❌  │
│  [Photo 3] ❌  [Photo 4] ❌  │
│                             │
│ [Upload Photos (4/10)] ✅   │
│                             │
│ 📝 Upload up to 10 photos.  │
└─────────────────────────────┘
```

### State 4: Foto Penuh (10 foto)
```
┌─────────────────────────────┐
│  [10 photos displayed...]   │
│                             │
│ [Upload Photos (10/10)] 🔒  │ ← DISABLED (abu-abu)
└─────────────────────────────┘
```

---

## 🔧 Testing Checklist

- [ ] Login sebagai host berhasil
- [ ] Bisa buka halaman Kelola Profil
- [ ] Tombol upload foto DISABLED sebelum save profil
- [ ] Isi form profil lengkap
- [ ] Klik "Save Changes"
- [ ] Muncul notifikasi "Profile saved successfully!"
- [ ] Tombol upload foto ENABLED setelah save profil
- [ ] Hilang warning "Save your profile first"
- [ ] Klik "Upload Photos" membuka file picker
- [ ] Pilih 1 foto JPEG
- [ ] Foto berhasil diupload dan muncul di gallery
- [ ] Upload multiple foto sekaligus (2-3 foto)
- [ ] Semua foto muncul di gallery
- [ ] Hover pada foto, muncul tombol X merah
- [ ] Klik X, muncul dialog konfirmasi
- [ ] Klik OK, foto terhapus dari gallery
- [ ] Counter "Upload Photos (X/10)" update dengan benar
- [ ] Coba upload file .txt (harus ditolak)
- [ ] Coba upload file besar >5MB (harus ditolak)
- [ ] Coba upload 11 foto total (harus ditolak)
- [ ] Logout dan login lagi, foto masih ada

---

## 🔍 Troubleshooting

### Tombol upload tetap disabled setelah save?
1. Refresh halaman (F5)
2. Logout dan login lagi
3. Cek console browser (F12) untuk error

### Foto tidak muncul setelah upload?
1. Cek Network tab di browser DevTools
2. Pastikan response API success: true
3. Cek apakah backend server running
4. Cek folder `backend/uploads/properties/`

### Error "Failed to save profile"?
1. Cek semua field required sudah terisi
2. Pastikan token JWT masih valid
3. Cek backend console untuk error details
4. Restart backend server jika perlu

### Photo URL 404 Not Found?
1. Pastikan backend static files configured
2. Cek `server.js` ada: `app.use('/uploads', express.static('uploads'))`
3. Pastikan folder `backend/uploads/properties/` exists
4. Cek file permission (readable)

---

## 📁 File Locations

### Frontend
- UI Component: `frontend/src/pages/host/Profile.jsx`
- API Service: `frontend/src/services/host.service.js`

### Backend
- Controller: `backend/src/controllers/host.controller.js`
- Routes: `backend/src/routes/host.routes.js`
- Upload Middleware: `backend/src/middleware/upload.middleware.js`
- Photo Storage: `backend/uploads/properties/`

### Database
- Table: `hosts`
- Column: `photos` (JSON array)
- Example: `["path1.jpg", "path2.jpg"]`

---

## 💡 Tips

1. **Kompres foto sebelum upload** untuk loading lebih cepat
2. **Gunakan foto landscape** (horizontal) untuk hasil terbaik
3. **Upload foto ruang utama dulu** (kamar tidur, living room)
4. **Foto pertama** akan jadi thumbnail di hasil pencarian
5. **Hapus foto blur/gelap** untuk presentasi lebih baik

---

## 📞 Need Help?

Jika masih ada masalah:
1. Cek console browser (F12 → Console tab)
2. Cek backend terminal untuk error logs
3. Pastikan database sudah di-migrate dan di-seed
4. Restart backend dan frontend server

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```
