# Monitoring Stack TravelNest

Direktori ini berisi konfigurasi monitoring untuk TravelNest menggunakan Prometheus dan Grafana.

## Struktur

```
monitoring/
├── prometheus/
│   └── prometheus.yml          # Konfigurasi scrape targets
├── grafana/
│   ├── provisioning/
│   │   ├── datasources/
│   │   │   └── datasource.yml  # Auto-provision Prometheus datasource
│   │   └── dashboards/
│   │       └── dashboards.yml  # Dashboard provider config
│   └── dashboards/
│       └── travelnest-backend.json  # Template dashboard utama
└── README.md                    # File ini
```

## Komponen

### Prometheus (`prometheus.yml`)
Prometheus scrape metrics dari:
- **backend** (backend:3000/metrics) - Express.js metrics via prom-client
- **cadvisor** (cadvisor:8080) - Container metrics

**Scrape interval**: 15s  
**Retention**: 15d (production), 7d (dev)

### Grafana Datasource
Auto-provisioned Prometheus datasource dengan:
- URL: http://prometheus:9090
- Access: proxy (via Grafana backend)
- Default: true

### Dashboard Template
`travelnest-backend.json` - Dashboard lengkap dengan 14 panel:

**Metrics yang dimonitor**:
- HTTP: request rate, latency (p50/p95/p99), error rate
- Process: CPU, memory, file descriptors, uptime
- Node.js: event loop lag, heap memory, GC duration, active resources
- Container: CPU, memory, network I/O (via cAdvisor)

**UID**: `travelnest-backend`  
**Folder**: TravelNest  
**Refresh**: 30s  
**Time Range**: Last 6 hours

## Menambah Metrics Custom

### 1. Di Backend (Express.js)
Edit `backend/server.js`:

```javascript
import client from 'prom-client';

// Counter
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status_code']
});

// Gauge
const activeConnections = new client.Gauge({
  name: 'active_connections',
  help: 'Number of active connections'
});

// Histogram
const dbQueryDuration = new client.Histogram({
  name: 'db_query_duration_seconds',
  help: 'Database query duration',
  labelNames: ['operation'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1]
});

// Increment counter
app.use((req, res, next) => {
  res.on('finish', () => {
    httpRequestsTotal.inc({ 
      method: req.method, 
      route: req.route?.path || req.path,
      status_code: res.statusCode 
    });
  });
  next();
});

// Measure duration
const timer = dbQueryDuration.startTimer();
// ... do database query
timer({ operation: 'select' });

// Register semua metrics
register.registerMetric(httpRequestsTotal);
register.registerMetric(activeConnections);
register.registerMetric(dbQueryDuration);
```

### 2. Di Prometheus
Tambahkan scrape target baru di `prometheus.yml`:

```yaml
scrape_configs:
  - job_name: 'frontend'
    metrics_path: /metrics
    static_configs:
      - targets: ['frontend:80']
  
  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']
```

### 3. Di Grafana Dashboard
Buat panel baru dengan query:

```promql
# Request rate
rate(http_requests_total[5m])

# Error percentage
sum(rate(http_requests_total{status_code=~"5.."}[5m])) 
/ 
sum(rate(http_requests_total[5m])) * 100

# Query duration p95
histogram_quantile(0.95, 
  sum(rate(db_query_duration_seconds_bucket[5m])) by (le, operation)
)
```

## Exporters Tambahan

### Node Exporter (Host Metrics)
Tambahkan di `docker-compose.yml`:

```yaml
services:
  node-exporter:
    image: prom/node-exporter:latest
    container_name: node-exporter
    ports:
      - "9100:9100"
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'
    networks:
      - travelnest-network
```

Dan di `prometheus.yml`:
```yaml
- job_name: 'node'
  static_configs:
    - targets: ['node-exporter:9100']
```

### SQLite Exporter (Database Metrics)
Untuk monitoring database SQLite, bisa pakai custom exporter atau export metrics via backend.

Contoh custom gauge:
```javascript
const dbSize = new client.Gauge({
  name: 'database_size_bytes',
  help: 'Database file size in bytes'
});

setInterval(() => {
  const stats = fs.statSync(process.env.DATABASE_PATH);
  dbSize.set(stats.size);
}, 60000); // Update every minute
```

## Alert Rules (Optional)

Buat file `prometheus/alerts.yml`:

```yaml
groups:
  - name: travelnest_alerts
    interval: 30s
    rules:
      - alert: HighErrorRate
        expr: |
          sum(rate(http_request_duration_seconds_count{status_code=~"5.."}[5m])) 
          / 
          sum(rate(http_request_duration_seconds_count[5m])) > 0.05
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value | humanizePercentage }}"
      
      - alert: HighLatency
        expr: |
          histogram_quantile(0.95, 
            sum(rate(http_request_duration_seconds_bucket[5m])) by (le)
          ) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High latency detected"
          description: "p95 latency is {{ $value }}s"
      
      - alert: ServiceDown
        expr: up{job="backend"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Backend service is down"
```

Load di `prometheus.yml`:
```yaml
rule_files:
  - "/etc/prometheus/alerts.yml"
```

## Best Practices

1. **Label Cardinality**: Jangan gunakan high-cardinality values (user ID, timestamp) sebagai label
2. **Metric Naming**: Ikuti konvensi `<namespace>_<name>_<unit>` (e.g., `http_request_duration_seconds`)
3. **Histogram Buckets**: Sesuaikan buckets dengan use case (API biasanya ms-seconds)
4. **Retention**: Sesuaikan dengan kebutuhan storage (default 15d)
5. **Dashboard Organization**: Gunakan folders dan tags untuk organize dashboards

## Troubleshooting

**Metrics tidak muncul**:
- Cek Prometheus targets: http://localhost:9090/targets
- Pastikan backend expose `/metrics`
- Cek network connectivity: `docker exec prometheus wget -O- backend:3000/metrics`

**Dashboard kosong**:
- Verifikasi datasource connected: Grafana → Configuration → Data Sources
- Test query di Prometheus UI dulu
- Cek time range dan refresh interval

**High memory usage**:
- Kurangi retention time
- Kurangi scrape frequency
- Tambah memory limit di compose: `mem_limit: 512m`

## Referensi

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [prom-client (Node.js)](https://github.com/siimon/prom-client)
- [PromQL Cheat Sheet](https://promlabs.com/promql-cheat-sheet/)
- [Grafana Dashboard Gallery](https://grafana.com/grafana/dashboards/)
