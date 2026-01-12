# Hands-on Monitoring dengan Prometheus + Grafana (Windows)

Dokumen ini memandu Anda menambahkan dan mencoba monitoring untuk aplikasi TravelNest menggunakan Prometheus (scraping metrics) dan Grafana (dashboard). Panduan difokuskan untuk Windows (Docker Desktop) dan menggunakan Docker Compose.

## Ringkasan Arsitektur
- Backend `express` mengekspose metrics Prometheus di `/metrics` menggunakan `prom-client`.
- Prometheus scrape metrics dari `backend` dan `cAdvisor` (metrics kontainer).
- Grafana otomatis memiliki datasource Prometheus dan memuat dashboard awal "TravelNest Backend".

Komponen diprovisikan di:
- konfigurasi Prometheus: `monitoring/prometheus/prometheus.yml`
- provisioning Grafana: `monitoring/grafana/provisioning/*`
- dashboard JSON: `monitoring/grafana/dashboards/travelnest-backend.json`

## Prasyarat
- Docker Desktop (Windows) aktif dengan backend WSL2.
- Port yang bebas: 3001 (Grafana), 9090 (Prometheus), 8081 (cAdvisor), 3000/80 sesuai stack.
- File `.env` berisi `JWT_SECRET` (opsional untuk dev, sudah ada default).

## Menjalankan (Development)
Jalankan semua service termasuk monitoring:

```powershell
# Dari root repo
docker compose -f docker-compose.dev.yml up -d --build
```

Akses:
- Backend API: http://localhost:3000
- Metrics backend: http://localhost:3000/metrics
- Prometheus: http://localhost:9090
- cAdvisor: http://localhost:8081
- Grafana: http://localhost:3001 (user: admin, pass: admin)

## Menjalankan (Production Compose)
```powershell
# Dari root repo
docker compose up -d --build
```
Akses layanan sama seperti di atas (Grafana pada http://localhost:3001).

## Validasi Scrape Target
1. Buka Prometheus → menu "Status" → "Targets" → pastikan `backend` dan `cadvisor` status UP.
2. Cek query cepat (Prometheus → "Graph"):
   - `up{job="backend"}` → 1
   - `rate(http_request_duration_seconds_count[1m])`
   - `nodejs_eventloop_lag_seconds`

Jika `backend` belum ada traffic, hasil bisa 0. Lihat bagian "Generate Traffic" di bawah.

## Dashboard Grafana
Grafana otomatis memiliki:
- Datasource `Prometheus` (default)
- Dashboard: "TravelNest Backend" (Folder: TravelNest)

Buka http://localhost:3001 → Login (admin/admin) → Dashboards → TravelNest → "TravelNest Backend".

### Panel-Panel Dashboard
Dashboard "TravelNest Backend" memiliki 14 panel monitoring lengkap:

**Overview (Row 1)**
- **Backend Status**: Indikator UP/DOWN dengan background color
- **Uptime**: Process uptime dalam detik
- **Memory Usage**: Gauge memory resident dengan threshold
- **CPU Usage**: Gauge CPU dengan threshold (green < 50%, yellow < 80%, red >= 80%)
- **Open File Descriptors**: Jumlah FD yang terbuka

**HTTP Metrics (Row 2)**
- **HTTP Request Rate**: RPS per method, route, status_code (rate 1m)
- **HTTP Request Duration**: p50, p95, p99 latency per endpoint

**Node.js Internals (Row 3)**
- **Event Loop Lag**: Current, mean, dan p99 event loop delay
- **Node.js Heap Memory**: Heap used, total, dan external memory (stacked area)
- **Garbage Collection Duration**: Mean GC time by kind (major/minor/incremental)

**Container Metrics (Row 4-5)**
- **Container CPU Usage**: CPU usage rate per container (cAdvisor)
- **Container Memory Usage**: Memory usage bytes per container
- **Container Network I/O**: RX dan TX bytes per second
- **Node.js Active Resources**: Bar gauge untuk handles, requests, resources

### Kustomisasi Dashboard
Template dashboard tersimpan di `monitoring/grafana/dashboards/travelnest-backend.json` dan menggunakan format JSON Grafana. Anda bisa:

1. **Edit via UI**: Buka dashboard → klik ⚙️ Settings → Save As untuk clone → edit panel → Save
2. **Edit JSON**: Dashboard Settings → JSON Model → copy/paste/edit
3. **Export**: Dashboard Settings → JSON Model → Copy to clipboard
4. **Import Dashboard Komunitas**:
   - Klik "+" → Import → masukkan ID dashboard
   - Popular: Node Exporter Full (1860), Docker Container & Host (10619)
   - Pastikan pilih datasource "Prometheus"

### Template Variables (Optional)
Untuk environment multi-instance, tambahkan template variable:
```json
{
  "templating": {
    "list": [
      {
        "name": "instance",
        "type": "query",
        "datasource": "Prometheus",
        "query": "label_values(up{job=\"backend\"}, instance)",
        "multi": true,
        "includeAll": true
      }
    ]
  }
}
```
Lalu ubah query panel jadi: `up{job="backend", instance=~"$instance"}`

## Membuat Dashboard Custom Sendiri

### Quick Start: Buat Panel Pertama

**Langkah praktis untuk pemula**:

1. **Buka Grafana** → http://localhost:3001 → Login (admin/admin)

2. **Buat Dashboard Baru**:
   - Klik "+" di sidebar kiri → "Create Dashboard"
   - Klik "Add visualization"
   - Pilih datasource: **Prometheus**

3. **Masukkan Query** (di kotak "Metrics browser"):
   ```
   rate(http_request_duration_seconds_count[1m])
   ```
   ⚠️ **Hanya copy query di atas**, jangan copy yang ada komentar (#)

4. **Klik "Run queries"** (tombol biru) atau tekan Shift+Enter

5. **Atur Panel**:
   - **Panel options** (kanan) → Title: `Request Rate`
   - **Standard options** → Unit: pilih `req/s` atau `reqps`
   - **Legend** → Placement: `Bottom`

6. **Save**: Klik "Apply" (pojok kanan atas) → "Save dashboard" → beri nama → Save

✅ **Panel pertama selesai!** Ulangi untuk panel lain dengan query berbeda.

### Langkah-langkah Lengkap:
1. **Buat Dashboard Baru**:
   - Grafana → Dashboards → New → New Dashboard
   - Klik "Add visualization"
   - Pilih datasource: Prometheus

2. **Tambah Panel**:
   - **Time Series Panel** (grafik garis):
     ```promql
     rate(http_request_duration_seconds_count[1m])
     ```
     Atau untuk memory usage:
     ```promql
     process_resident_memory_bytes / 1024 / 1024
     ```
     Atau event loop lag:
     ```promql
     nodejs_eventloop_lag_seconds
     ```
   
   - **Stat Panel** (angka besar):
     ```promql
     process_uptime_seconds
     ```
     Atau total requests:
     ```promql
     sum(http_request_duration_seconds_count)
     ```
   
   - **Gauge Panel** (dial):
     ```promql
     rate(process_cpu_seconds_total[5m])
     ```
   
   - **Histogram/Heatmap**:
     ```promql
     sum(increase(http_request_duration_seconds_bucket[5m])) by (le)
     ```

   **⚠️ Penting**: Masukkan **hanya satu query** per panel. Jangan copy-paste semua contoh sekaligus. PromQL tidak mendukung komentar (#) saat query dijalankan.

3. **Konfigurasi Panel**:
   - **Title**: Nama panel
   - **Unit**: pilih dari dropdown (bytes, seconds, percent, dll)
   - **Legend**: tampilkan/sembunyikan, placement (bottom/right)
   - **Thresholds**: set warna (green/yellow/red) berdasarkan nilai
   - **Transform**: aggregate, filter, rename fields

4. **PromQL Tips**:
   
   Berikut contoh query PromQL yang berguna. **Gunakan satu query per panel**, jangan copy semua sekaligus:
   
   | Fungsi | Query PromQL | Keterangan |
   |--------|--------------|------------|
   | **Rate** | `rate(metric_name[5m])` | Hitung perubahan per detik dalam 5 menit |
   | **Sum by label** | `sum(metric) by (label_name)` | Aggregate metric berdasarkan label |
   | **Percentile** | `histogram_quantile(0.95, sum(rate(metric_bucket[5m])) by (le))` | Hitung p95 dari histogram |
   | **Filter** | `metric{job="backend", status_code="200"}` | Filter berdasarkan label |
   | **Regex filter** | `metric{job=~"backend\|frontend", status_code!="500"}` | Multiple kondisi dengan regex |
   | **Average** | `avg(metric) by (label)` | Rata-rata per label |
   | **Max/Min** | `max(metric)` atau `min(metric)` | Nilai maksimum/minimum |
   
   **Contoh Penggunaan**: Untuk membuat panel request rate, masukkan query ini saja:
   ```promql
   rate(http_request_duration_seconds_count[1m])
   ```
   Untuk filter hanya status 200:
   ```promql
   rate(http_request_duration_seconds_count{status_code="200"}[1m])
   ```

5. **Save Dashboard**:
   - Klik 💾 Save → beri nama → pilih folder → Save

### Contoh Query Berguna:

**Error Rate (4xx + 5xx)**:
```promql
sum(rate(http_request_duration_seconds_count{status_code=~"4..|5.."}[5m])) / sum(rate(http_request_duration_seconds_count[5m]))
```

**Apdex Score** (Application Performance Index):
```promql
(sum(rate(http_request_duration_seconds_bucket{le="0.1"}[5m])) + sum(rate(http_request_duration_seconds_bucket{le="0.5"}[5m])) / 2) / sum(rate(http_request_duration_seconds_count[5m]))
```

**Memory Growth Rate**:
```promql
deriv(process_resident_memory_bytes[5m])
```

**Top 5 Slowest Endpoints**:
```promql
topk(5, histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, route)))
```

**💡 Cara Pakai**: Copy **satu query** di atas → Paste ke Grafana panel query editor → Jalankan. Jangan copy multiple queries sekaligus.

### Export & Backup Dashboard:
```powershell
# Export via API
$headers = @{
  'Authorization' = 'Bearer YOUR_API_KEY'
  'Content-Type' = 'application/json'
}
$dashboard = Invoke-RestMethod -Uri "http://localhost:3001/api/dashboards/uid/travelnest-backend" -Headers $headers
$dashboard.dashboard | ConvertTo-Json -Depth 100 | Out-File "backup-dashboard.json"
```

Atau via UI: Dashboard → Settings → JSON Model → Copy to clipboard

## Generate Traffic (Contoh Cepat)
Jalankan di PowerShell untuk memberi beban ke API dan menghasilkan metrics:

```powershell
# Health check
1..30 | ForEach-Object { Invoke-WebRequest -UseBasicParsing http://localhost:3000/health | Out-Null }

# Endpoint contoh (ubah sesuai kebutuhan)
1..200 | ForEach-Object { Invoke-WebRequest -UseBasicParsing http://localhost:3000/api/test | Out-Null }
```

Kembali ke Grafana, ubah time range ke "Last 15 minutes" dan lihat grafik RPS dan p95.

## Query Cheat Sheet (Copy-Paste Ready)

### Basic Metrics
```promql
# Backend status (UP=1, DOWN=0)
up{job="backend"}

# Request rate per second
rate(http_request_duration_seconds_count{job="backend"}[1m])

# CPU usage (percentage)
rate(process_cpu_seconds_total{job="backend"}[5m]) * 100

# Memory usage (MB)
process_resident_memory_bytes{job="backend"} / 1024 / 1024

# Uptime (seconds)
process_uptime_seconds{job="backend"}
```

### HTTP Performance
```promql
# p50 latency
histogram_quantile(0.50, sum(rate(http_request_duration_seconds_bucket{job="backend"}[5m])) by (le))

# p95 latency
histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket{job="backend"}[5m])) by (le))

# p99 latency
histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket{job="backend"}[5m])) by (le))

# Error rate (5xx only)
sum(rate(http_request_duration_seconds_count{job="backend",status_code=~"5.."}[5m])) / sum(rate(http_request_duration_seconds_count{job="backend"}[5m])) * 100

# Requests by status code
sum(rate(http_request_duration_seconds_count{job="backend"}[1m])) by (status_code)

# Requests by route
sum(rate(http_request_duration_seconds_count{job="backend"}[1m])) by (route)
```

### Node.js Metrics
```promql
# Event loop lag
nodejs_eventloop_lag_seconds{job="backend"}

# Heap used (MB)
nodejs_heap_size_used_bytes{job="backend"} / 1024 / 1024

# GC duration
rate(nodejs_gc_duration_seconds_sum{job="backend"}[5m]) / rate(nodejs_gc_duration_seconds_count{job="backend"}[5m])

# Active handles
nodejs_active_handles_total{job="backend"}
```

### Container Metrics (cAdvisor)
```promql
# Container CPU usage
rate(container_cpu_usage_seconds_total{name=~"travelnest.*"}[5m]) * 100

# Container memory (MB)
container_memory_usage_bytes{name=~"travelnest.*"} / 1024 / 1024

# Network RX (bytes/sec)
rate(container_network_receive_bytes_total{name=~"travelnest.*"}[5m])

# Network TX (bytes/sec)
rate(container_network_transmit_bytes_total{name=~"travelnest.*"}[5m])
```

**💡 Cara Pakai**: 
1. Copy **satu query** di atas
2. Paste di Grafana → Metrics browser
3. Klik "Run queries" atau Shift+Enter
4. Atur Unit, Legend, Title sesuai kebutuhan

## Struktur & File Penting
- `backend/server.js` → inisialisasi `prom-client`, endpoint `/metrics`, histogram `http_request_duration_seconds` (label: method, route, status_code) dan default metrics `process_*`, `nodejs_*`.
- `monitoring/prometheus/prometheus.yml` → scrape `backend:3000/metrics` dan `cadvisor:8080`.
- `monitoring/grafana/provisioning` → datasource + autoload dashboards.

## Tip & Troubleshooting

### Error Query PromQL

**Error: "parse error: unexpected identifier"**
- ❌ **Penyebab**: Copy-paste query dengan komentar (#) atau multiple queries sekaligus
- ✅ **Solusi**: Masukkan **hanya satu query** tanpa komentar

**Contoh yang SALAH**:
```promql
# Request rate
rate(http_request_duration_seconds_count[1m])

# Memory usage  
process_resident_memory_bytes
```

**Contoh yang BENAR** (pilih salah satu):
```promql
rate(http_request_duration_seconds_count[1m])
```
Atau:
```promql
process_resident_memory_bytes
```

**Error: "bad_data: invalid parameter"**
- Cek syntax query (bracket `[]`, kurung `()`, quotes `""`)
- Pastikan metric name ada: test di Prometheus UI → http://localhost:9090
- Cek label selector: `{job="backend"}` bukan `{job=backend}`

**No data / Empty graph**
- Cek time range (pojok kanan atas) → coba "Last 1 hour"
- Generate traffic: lihat section "Generate Traffic" di bawah
- Verifikasi metrics tersedia: buka http://localhost:3000/metrics

### General Troubleshooting

- Grafana login gagal: reset volume `grafana-data` lalu `docker compose up -d`.
- Target DOWN:
  - Pastikan service jalan: `docker ps`.
  - Cek DNS di jaringan compose: `backend` dan `cadvisor` adalah nama service.
  - Buka http://localhost:3000/metrics untuk memastikan exposed.
- cAdvisor di Windows/WSL2: beberapa metric host mungkin terbatas, namun metric kontainer tetap tersedia.

## Optional Lanjutan
- Tambahkan alert rules Prometheus dan Alertmanager.
- Import community dashboards:
  - Node Exporter Full (ID: 1860) — butuh node-exporter.
  - Docker / cAdvisor dashboards.
- Simpan kredensial Grafana via secrets dan ganti password default.

Selamat mencoba! Jika Anda ingin, saya bisa menjalankan stack dan verifikasi target secara otomatis dari sini.
