# 📸 Fitur Upload Foto Host - Dokumentasi Lengkap

## ✅ Fitur Upload Foto Telah Ditambahkan

### Fitur Baru:

#### 1. **Upload Foto Properti** ✓
- Host dapat upload hingga 10 foto properti
- Foto otomatis tersimpan di database
- Validasi tipe file (JPEG, PNG, WebP)
- Validasi ukuran file (max 5MB per file)
- Foto ditampilkan di hasil pencarian traveler

#### 2. **Hapus Foto** ✓
- Host dapat menghapus foto yang sudah diupload
- Validasi kepemilikan foto
- Admin logging untuk tracking

#### 3. **Keamanan & Validasi** ✓
- File type validation (hanya image)
- File size limit (max 5MB)
- Maximum 10 photos per host
- Sanitized file names
- Admin monitoring logs

---

## 📋 API Endpoints

### 1. Upload Foto Properti

**Endpoint**: `POST /api/host/photos`

**Headers**:
```
Authorization: Bearer YOUR_HOST_TOKEN
Content-Type: multipart/form-data
```

**Body** (form-data):
```
photos: [file1.jpg, file2.jpg, file3.jpg]  // Max 10 files total
```

**Validasi**:
- Maximum 10 photos total per host
- Each file max 5MB
- Allowed formats: JPEG, JPG, PNG, WebP
- Must have host profile created first

**Response Success**:
```json
{
  "success": true,
  "message": "Photos uploaded successfully",
  "data": {
    "photos": [
      "/uploads/properties/photos-1234567890-123456789.jpg",
      "/uploads/properties/photos-1234567891-987654321.jpg",
      "/uploads/properties/photos-1234567892-456789123.png"
    ],
    "uploadedCount": 3,
    "totalCount": 3
  }
}
```

**Response Error - No Profile**:
```json
{
  "success": false,
  "message": "Host profile not found. Please create a profile first."
}
```

**Response Error - File Too Large**:
```json
{
  "success": false,
  "message": "File too large: photo1.jpg. Maximum size is 5MB."
}
```

**Response Error - Invalid Type**:
```json
{
  "success": false,
  "message": "Invalid file type: document.pdf. Only JPEG, PNG, and WebP images are allowed."
}
```

**Response Error - Too Many Photos**:
```json
{
  "success": false,
  "message": "Maximum 10 photos allowed. Please delete some photos first."
}
```

**Admin Log**:
```
[ADMIN LOG] Photos uploaded - User ID: 2, Host ID: 1, Photos count: 3, Total: 3
```

---

### 2. Hapus Foto

**Endpoint**: `DELETE /api/host/photos`

**Headers**:
```
Authorization: Bearer YOUR_HOST_TOKEN
Content-Type: application/json
```

**Body**:
```json
{
  "photoUrl": "/uploads/properties/photos-1234567890-123456789.jpg"
}
```

**Response Success**:
```json
{
  "success": true,
  "message": "Photo deleted successfully",
  "data": {
    "photos": [
      "/uploads/properties/photos-1234567891-987654321.jpg",
      "/uploads/properties/photos-1234567892-456789123.png"
    ]
  }
}
```

**Response Error - Not Found**:
```json
{
  "success": false,
  "message": "Photo not found in your profile"
}
```

**Admin Log**:
```
[ADMIN LOG] Photo deleted - User ID: 2, Host ID: 1, Photo: /uploads/properties/photos-1234567890-123456789.jpg
```

---

### 3. Foto Tampil di Hasil Pencarian

**Endpoint**: `GET /api/traveler/search?city=Jakarta`

**Headers**:
```
Authorization: Bearer YOUR_TRAVELER_TOKEN
```

**Response**:
```json
{
  "success": true,
  "data": {
    "hosts": [
      {
        "id": 1,
        "user_id": 2,
        "title": "Cozy Room in Central Jakarta",
        "description": "A comfortable room...",
        "city": "Jakarta",
        "country": "Indonesia",
        "max_guests": 2,
        "photos": [
          "/uploads/properties/photos-1234567890-123456789.jpg",
          "/uploads/properties/photos-1234567891-987654321.jpg",
          "/uploads/properties/photos-1234567892-456789123.png"
        ],
        "amenities": ["WiFi", "AC", "Kitchen"],
        "avg_rating": 4.5,
        "review_count": 10,
        "name": "Host Name",
        "avatar": "/uploads/profiles/avatar-123.jpg"
      }
    ]
  }
}
```

**Foto otomatis muncul di hasil pencarian!** ✓

---

## 🧪 Testing

### PowerShell Testing Script:

```powershell
# 1. Login sebagai host
$hostLogin = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" `
  -Method Post `
  -Body (@{email="host@travelnest.com"; password="host123"} | ConvertTo-Json) `
  -ContentType "application/json"

$hostToken = $hostLogin.data.token

# 2. Buat profil jika belum ada
$profileBody = @{
  title = "Beautiful House in Jakarta"
  description = "A lovely place to stay with all modern amenities"
  city = "Jakarta"
  country = "Indonesia"
  max_guests = 4
  amenities = @("WiFi", "AC", "Kitchen", "Pool")
} | ConvertTo-Json

try {
  Invoke-RestMethod -Uri "http://localhost:3000/api/host/profile" `
    -Method Post `
    -Body $profileBody `
    -ContentType "application/json" `
    -Headers @{Authorization="Bearer $hostToken"}
} catch {
  Write-Host "Profile already exists or error: $($_.Exception.Message)"
}

# 3. Upload foto (prepare your test images first)
$files = @(
  "E:\Kuliah\Project\travelnest\test-images\room1.jpg",
  "E:\Kuliah\Project\travelnest\test-images\room2.jpg",
  "E:\Kuliah\Project\travelnest\test-images\room3.jpg"
)

$form = @{}
$boundary = [System.Guid]::NewGuid().ToString()

# Create multipart form data
$formData = New-Object System.Net.Http.MultipartFormDataContent
foreach ($file in $files) {
  if (Test-Path $file) {
    $fileStream = [System.IO.File]::OpenRead($file)
    $fileName = [System.IO.Path]::GetFileName($file)
    $fileContent = New-Object System.Net.Http.StreamContent($fileStream)
    $fileContent.Headers.ContentType = [System.Net.Http.Headers.MediaTypeHeaderValue]::Parse("image/jpeg")
    $formData.Add($fileContent, "photos", $fileName)
  }
}

# Upload (using Invoke-WebRequest for multipart/form-data)
$uploadResult = Invoke-WebRequest -Uri "http://localhost:3000/api/host/photos" `
  -Method Post `
  -Headers @{Authorization="Bearer $hostToken"} `
  -Body $formData `
  -ContentType "multipart/form-data; boundary=$boundary"

Write-Host "Upload result: $($uploadResult.Content)"

# 4. Verify photos in search results
Start-Sleep -Seconds 1

$travelerLogin = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" `
  -Method Post `
  -Body (@{email="traveler@travelnest.com"; password="traveler123"} | ConvertTo-Json) `
  -ContentType "application/json"

$travelerToken = $travelerLogin.data.token

$searchResult = Invoke-RestMethod -Uri "http://localhost:3000/api/traveler/search?city=Jakarta" `
  -Method Get `
  -Headers @{Authorization="Bearer $travelerToken"}

Write-Host "Search result photos:"
$searchResult.data.hosts | ForEach-Object {
  Write-Host "Host: $($_.title)"
  Write-Host "Photos count: $($_.photos.Count)"
  $_.photos | ForEach-Object { Write-Host "  - $_" }
}

# 5. Delete a photo
$photoToDelete = $searchResult.data.hosts[0].photos[0]

$deleteResult = Invoke-RestMethod -Uri "http://localhost:3000/api/host/photos" `
  -Method Delete `
  -Body (@{photoUrl=$photoToDelete} | ConvertTo-Json) `
  -ContentType "application/json" `
  -Headers @{Authorization="Bearer $hostToken"}

Write-Host "Delete result: $($deleteResult.message)"
Write-Host "Remaining photos: $($deleteResult.data.photos.Count)"
```

---

### Manual Testing with cURL (Bash):

```bash
# 1. Login
HOST_TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"host@travelnest.com","password":"host123"}' \
  | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

# 2. Upload photos
curl -X POST http://localhost:3000/api/host/photos \
  -H "Authorization: Bearer $HOST_TOKEN" \
  -F "photos=@/path/to/photo1.jpg" \
  -F "photos=@/path/to/photo2.jpg" \
  -F "photos=@/path/to/photo3.jpg"

# 3. Search and see photos
TRAVELER_TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"traveler@travelnest.com","password":"traveler123"}' \
  | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

curl -X GET "http://localhost:3000/api/traveler/search?city=Jakarta" \
  -H "Authorization: Bearer $TRAVELER_TOKEN"

# 4. Delete photo
curl -X DELETE http://localhost:3000/api/host/photos \
  -H "Authorization: Bearer $HOST_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"photoUrl":"/uploads/properties/photos-1234567890-123456789.jpg"}'
```

---

## 📁 File Structure

```
backend/
  uploads/
    properties/          # Host property photos
      photos-1234567890-123456789.jpg
      photos-1234567891-987654321.jpg
    profiles/            # User avatars
    kyc/                # KYC documents
  src/
    controllers/
      host.controller.js  # uploadPhotos, deletePhoto
    routes/
      host.routes.js     # POST /photos, DELETE /photos
    middleware/
      upload.middleware.js  # File upload configuration
    models/
      host.model.js      # Photos stored in JSON field
```

---

## 🔒 Security Features

### 1. File Type Validation
```javascript
// Only images allowed for property photos
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
```

### 2. File Size Validation
```javascript
// Maximum 5MB per file
const MAX_FILE_SIZE = 5 * 1024 * 1024;
```

### 3. Total Photos Limit
```javascript
// Maximum 10 photos per host
const MAX_PHOTOS = 10;
```

### 4. Filename Sanitization
```javascript
// Auto-generated secure filenames
// Format: photos-{timestamp}-{random}.{ext}
// Example: photos-1704067200000-123456789.jpg
```

### 5. Authorization
```javascript
// Only host can upload/delete their own photos
// Verified via JWT token and host profile ownership
```

### 6. Admin Logging
```javascript
// All photo operations logged
[ADMIN LOG] Photos uploaded - User ID: 2, Host ID: 1, Photos count: 3, Total: 3
[ADMIN LOG] Photo deleted - User ID: 2, Host ID: 1, Photo: /uploads/properties/...
```

---

## 🎯 Use Cases

### Use Case 1: Host Upload Foto Saat Buat Profil
```
1. Host buat profil (POST /api/host/profile)
2. Host upload foto (POST /api/host/photos)
3. Foto tersimpan dan muncul di profil
4. Traveler bisa lihat foto saat search
```

### Use Case 2: Host Update Foto
```
1. Host lihat profil current (GET /api/host/profile)
2. Host upload foto tambahan (POST /api/host/photos)
3. Host hapus foto lama (DELETE /api/host/photos)
4. Foto terupdate di database
```

### Use Case 3: Traveler Lihat Foto di Search
```
1. Traveler search host (GET /api/traveler/search?city=Jakarta)
2. Response include array photos untuk tiap host
3. Frontend display photos di gallery/carousel
4. Traveler bisa lihat detail properti
```

---

## 💡 Best Practices

### 1. Image Optimization (Recommended)
```javascript
// Frontend: Compress images before upload
// Use libraries like browser-image-compression

import imageCompression from 'browser-image-compression';

const options = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true
};

const compressedFile = await imageCompression(file, options);
```

### 2. Progressive Image Loading
```javascript
// Frontend: Show thumbnails first, load full images on demand
<img src={thumbnail} data-full={fullImage} loading="lazy" />
```

### 3. Error Handling
```javascript
// Always handle errors gracefully
try {
  await uploadPhotos(files);
} catch (error) {
  if (error.response?.status === 400) {
    // Show user-friendly message
    showError('File too large or invalid format');
  }
}
```

### 4. Progress Indicator
```javascript
// Show upload progress
const onUploadProgress = (progressEvent) => {
  const percentCompleted = Math.round(
    (progressEvent.loaded * 100) / progressEvent.total
  );
  setProgress(percentCompleted);
};
```

---

## 📊 Database Schema

### hosts table - photos field:
```sql
photos TEXT  -- JSON array of photo URLs
```

**Example Data**:
```json
[
  "/uploads/properties/photos-1704067200000-123456789.jpg",
  "/uploads/properties/photos-1704067201000-987654321.jpg",
  "/uploads/properties/photos-1704067202000-456789123.png"
]
```

---

## ✅ Checklist Implementasi

- ✅ Upload multiple photos (max 10)
- ✅ File type validation (JPEG, PNG, WebP)
- ✅ File size validation (max 5MB)
- ✅ Secure filename generation
- ✅ Delete photos endpoint
- ✅ Photos display in search results
- ✅ Admin logging for all operations
- ✅ Error handling & validation
- ✅ Authorization checks
- ✅ API documentation

---

## 🚀 Quick Start

1. **Start server**:
   ```powershell
   cd e:\Kuliah\Project\travelnest\backend
   npm run dev
   ```

2. **Login sebagai host**:
   ```
   POST /api/auth/login
   ```

3. **Upload foto** (gunakan Postman atau frontend):
   ```
   POST /api/host/photos
   Content-Type: multipart/form-data
   Body: photos[] = [file1, file2, file3]
   ```

4. **Verify di search**:
   ```
   GET /api/traveler/search?city=Jakarta
   ```

---

## 📝 Notes

- Foto tersimpan di `/backend/uploads/properties/`
- URL foto relatif: `/uploads/properties/filename.jpg`
- Frontend perlu prefix dengan base URL: `http://localhost:3000/uploads/properties/filename.jpg`
- Foto otomatis muncul di hasil pencarian traveler
- Admin bisa monitor via console logs: `[ADMIN LOG]`

---

**Fitur upload foto telah diimplementasikan dengan lengkap! 📸✨**
