# Hands-On: SAST & DAST Security Testing

Panduan praktis step-by-step untuk melakukan security testing pada aplikasi TravelNest menggunakan SAST (Static Application Security Testing) dan DAST (Dynamic Application Security Testing) dengan OWASP ZAP.

---

## 📋 Prasyarat

Sebelum memulai, pastikan sudah terinstall:

- ✅ **Node.js** & **npm** (untuk SAST tools)
- ✅ **Java JDK 11+** (untuk OWASP ZAP)
- ✅ **OWASP ZAP** (untuk DAST)
- ✅ **Git** untuk version control
- ✅ **Aplikasi TravelNest** sudah running (untuk DAST)

### Cek Instalasi

```powershell
# Cek Node.js
node --version
npm --version

# Cek Java
java --version

# Cek Git
git --version
```

---

## 🔍 PART 1: SAST (Static Application Security Testing)

SAST adalah analisis keamanan pada source code tanpa menjalankan aplikasi. Berguna untuk menemukan vulnerabilities sejak dini dalam development cycle.

### Tool 1: ESLint - Code Quality & Security

ESLint sudah terkonfigurasi di project untuk detect security issues.

#### Step 1: Setup ESLint

```powershell
# Masuk ke folder frontend
cd frontend

# Install dependencies (jika belum)
npm install

# Jalankan ESLint
npx eslint .

# Atau dengan auto-fix untuk masalah yang bisa diperbaiki otomatis
npx eslint . --fix
```

#### Step 2: Analisis Output ESLint

```powershell
# Output contoh:
# E:\Kuliah\Project\travelnest\frontend\src\components\common\Input.jsx
#   45:10  warning  'value' is missing in props validation  react/prop-types
#   46:10  warning  'onChange' is missing in props validation  react/prop-types

# Warning: menunjukkan potential issues
# Error: harus diperbaiki sebelum production
```

#### Step 3: Generate ESLint Report

```powershell
# Generate HTML report
npx eslint . -f html -o eslint-report.html

# Buka report
Start-Process "eslint-report.html"

# Generate JSON report (untuk CI/CD)
npx eslint . -f json -o eslint-report.json
```

### Tool 2: npm audit - Dependency Vulnerabilities

npm audit memeriksa dependencies untuk known security vulnerabilities.

#### Step 1: Run npm audit (Frontend)

```powershell
# Masuk ke frontend
cd frontend

# Basic audit
npm audit

# Detailed audit
npm audit --verbose

# Generate JSON report
npm audit --json > npm-audit-frontend.json
```

#### Step 2: Run npm audit (Backend)

```powershell
# Masuk ke backend
cd ../backend

# Basic audit
npm audit

# Generate JSON report
npm audit --json > npm-audit-backend.json
```

#### Step 3: Fix Vulnerabilities

```powershell
# Auto-fix vulnerabilities (jika memungkinkan)
npm audit fix

# Force fix (HATI-HATI: bisa break compatibility)
npm audit fix --force

# Untuk lihat apa yang akan di-fix tanpa mengubah
npm audit fix --dry-run
```

#### Step 4: Analisis npm audit Output

```
# Contoh output:
found 5 vulnerabilities (2 low, 2 moderate, 1 high)
  run `npm audit fix` to fix them, or `npm audit` for details

# Severity levels:
# - Low: Minor risk
# - Moderate: Medium risk, should be fixed
# - High: Critical, fix immediately
# - Critical: Urgent security issue
```

### Tool 3: Snyk - Comprehensive Security Scanning

Snyk adalah tool professional untuk security scanning.

#### Step 1: Install Snyk

```powershell
# Install Snyk globally
npm install -g snyk

# Login ke Snyk (buat account gratis di snyk.io)
snyk auth

# Atau test tanpa login (limited)
```

#### Step 2: Scan Frontend

```powershell
cd frontend

# Test untuk vulnerabilities
snyk test

# Test dan monitor (kirim report ke dashboard)
snyk monitor

# Test dengan JSON output
snyk test --json > snyk-frontend-report.json
```

#### Step 3: Scan Backend

```powershell
cd ../backend

# Test untuk vulnerabilities
snyk test

# Generate HTML report
snyk test --json | snyk-to-html -o snyk-backend-report.html
```

#### Step 4: Snyk Code (SAST)

```powershell
# Scan source code untuk security issues
snyk code test

# Dengan detailed output
snyk code test --severity-threshold=high
```

### Tool 4: SonarQube - Enterprise-Grade SAST

SonarQube adalah platform comprehensive untuk code quality dan security.

#### Step 1: Setup SonarQube dengan Docker

```powershell
# Pull SonarQube image
docker pull sonarqube:lts-community

# Run SonarQube
docker run -d `
  --name sonarqube `
  -p 9000:9000 `
  -v sonarqube_data:/opt/sonarqube/data `
  -v sonarqube_extensions:/opt/sonarqube/extensions `
  -v sonarqube_logs:/opt/sonarqube/logs `
  sonarqube:lts-community

# Wait for SonarQube to start (bisa 1-2 menit)
# Access: http://localhost:9000
# Default login: admin/admin
```

#### Step 2: Install SonarScanner

```powershell
# Download SonarScanner dari:
# https://docs.sonarqube.org/latest/analysis/scan/sonarscanner/

# Atau install via npm
npm install -g sonarqube-scanner

# Atau via chocolatey (Windows)
choco install sonarqube-scanner
```

#### Step 3: Create SonarQube Project

1. Buka http://localhost:9000
2. Login dengan admin/admin
3. Klik "Create Project"
4. Project key: `travelnest`
5. Display name: `TravelNest`
6. Generate token untuk scanner

#### Step 4: Scan Frontend dengan SonarQube

```powershell
cd frontend

# Create sonar-project.properties
@"
sonar.projectKey=travelnest-frontend
sonar.projectName=TravelNest Frontend
sonar.projectVersion=1.0
sonar.sources=src
sonar.exclusions=**/node_modules/**,**/*.test.js,**/*.spec.js
sonar.host.url=http://localhost:9000
sonar.token=YOUR_GENERATED_TOKEN
"@ | Out-File -FilePath sonar-project.properties -Encoding UTF8

# Run scanner
sonar-scanner
```

#### Step 5: Scan Backend dengan SonarQube

```powershell
cd ../backend

# Create sonar-project.properties
@"
sonar.projectKey=travelnest-backend
sonar.projectName=TravelNest Backend
sonar.projectVersion=1.0
sonar.sources=src
sonar.exclusions=**/node_modules/**,**/*.test.js
sonar.host.url=http://localhost:9000
sonar.token=YOUR_GENERATED_TOKEN
"@ | Out-File -FilePath sonar-project.properties -Encoding UTF8

# Run scanner
sonar-scanner
```

#### Step 6: View Results di SonarQube Dashboard

```powershell
# Buka dashboard
Start-Process "http://localhost:9000/dashboard?id=travelnest-frontend"

# Review:
# - Bugs
# - Vulnerabilities
# - Code Smells
# - Security Hotspots
# - Coverage
# - Duplications
```

### Summary: SAST Best Practices

```powershell
# Workflow SAST yang direkomendasikan:

# 1. Jalankan ESLint saat development
npm run lint

# 2. Check dependencies secara berkala
npm audit

# 3. Scan dengan Snyk sebelum commit
snyk test

# 4. Run SonarQube analysis saat CI/CD
sonar-scanner

# 5. Review dan fix issues sebelum merge
```

---

## 🎯 PART 2: DAST dengan OWASP ZAP

DAST adalah testing aplikasi yang sedang berjalan untuk menemukan runtime vulnerabilities.

### Step 1: Install OWASP ZAP

#### Opsi A: Install Standalone (Windows)

```powershell
# Download dari https://www.zaproxy.org/download/
# Pilih: ZAP Windows (64) Installer

# Atau download via PowerShell
$url = "https://github.com/zaproxy/zaproxy/releases/download/v2.14.0/ZAP_2.14.0_windows.exe"
$output = "$env:TEMP\ZAP_Installer.exe"
Invoke-WebRequest -Uri $url -OutFile $output

# Run installer
Start-Process $output -Wait
```

#### Opsi B: Install via Chocolatey

```powershell
# Install via Chocolatey
choco install zap

# Verify installation
zap --version
```

#### Opsi C: Run OWASP ZAP di Docker

```powershell
# Pull ZAP image
docker pull zaproxy/zap-stable

# Run ZAP daemon (headless)
docker run -d `
  --name zap `
  -p 8090:8090 `
  -p 8080:8080 `
  zaproxy/zap-stable zap.sh -daemon -host 0.0.0.0 -port 8090 -config api.disablekey=true
```

### Step 2: Persiapan Aplikasi untuk Testing

#### Start Aplikasi TravelNest

```powershell
# Terminal 1: Start Backend
cd backend
npm run dev
# Backend running di http://localhost:5000

# Terminal 2: Start Frontend
cd frontend
npm run dev
# Frontend running di http://localhost:3000
```

#### Atau menggunakan Docker

```powershell
# Start dengan Docker Compose
docker-compose up -d

# Verify containers running
docker ps
```

### Step 3: Setup OWASP ZAP

#### Launch ZAP

```powershell
# Launch ZAP GUI
# Windows: Start Menu → OWASP ZAP

# Atau via command line
& "C:\Program Files\ZAP\Zed Attack Proxy\zap.bat"
```

#### Konfigurasi Awal

1. **Session Management:**
   - File → New Session → Save As → `travelnest-scan.session`

2. **Scope Configuration:**
   - Tools → Options → Local Proxies
   - Address: localhost
   - Port: 8080

### Step 4: Manual Explore (Spider)

Manual exploration untuk ZAP mempelajari struktur aplikasi.

#### Configure Browser Proxy

**Firefox (Recommended):**
```
1. Settings → Network Settings
2. Manual proxy configuration
3. HTTP Proxy: localhost, Port: 8080
4. Also use for HTTPS
5. No Proxy for: <leave empty>
```

**Chrome:**
```powershell
# Launch Chrome dengan proxy
& "C:\Program Files\Google\Chrome\Application\chrome.exe" --proxy-server="localhost:8080" --disable-web-security --user-data-dir="C:\temp\chrome-zap"
```

#### Manual Browse

```
1. Di browser (dengan proxy ZAP), buka http://localhost:3000
2. Login dengan kredensial test
3. Navigate ke semua halaman:
   - Register
   - Login
   - Dashboard (Admin/Host/Traveler)
   - Profile pages
   - Search functionality
   - Request forms
   - Review pages
4. ZAP akan merekam semua traffic di Sites tab
```

### Step 5: Automated Spider Scan

Spider scan otomatis mencrawl aplikasi.

```
1. Di ZAP, klik kanan pada http://localhost:3000
2. Pilih "Attack" → "Spider"
3. Starting Point: http://localhost:3000
4. User: (pilih user jika sudah setup authentication)
5. Klik "Start Scan"
6. Wait for scan completion (check progress bar)
```

### Step 6: AJAX Spider (untuk React App)

Karena TravelNest menggunakan React, perlu AJAX Spider:

```
1. Klik kanan pada http://localhost:3000
2. Pilih "Attack" → "AJAX Spider"
3. Configure:
   - Browser: Firefox Headless (atau Chrome)
   - Max Duration: 10 minutes
   - Max Depth: 10
4. Klik "Start Scan"
5. Monitor progress
```

### Step 7: Active Scan (Vulnerability Detection)

Active scan melakukan actual attacks untuk detect vulnerabilities.

```
1. Klik kanan pada http://localhost:3000
2. Pilih "Attack" → "Active Scan"
3. Policy: Default Policy (atau buat custom)
4. Technology: 
   - ✅ Select All
   - Atau pilih: JavaScript, Node.js, Express, React
5. Klik "Start Scan"

⚠️ WARNING: Active scan bisa memakan waktu lama (30 menit - 2 jam)
   dan generate banyak requests ke aplikasi.
```

#### Configure Active Scan Policy

```
1. Tools → Options → Active Scan
2. Number of Hosts Scanned Concurrently: 5
3. Concurrent Scanning Threads per Host: 10
4. Max Results to List: 1000
```

### Step 8: Authentication Context (Optional)

Untuk scan halaman yang perlu login:

#### Setup Authentication

```
1. Tools → Options → Authentication
2. Klik "Add" untuk tambah context
3. Name: TravelNest
4. Include in Context: http://localhost:3000.*
5. Authentication Method: Form-based Authentication
6. Login Form Target URL: http://localhost:5000/api/auth/login
7. Login Request POST Data: {"email":"admin@example.com","password":"admin123"}
8. Username Parameter: email
9. Password Parameter: password
10. Logged In Indicator: (regex untuk detect login success)
11. Logged Out Indicator: (regex untuk detect logout)
```

#### Setup User

```
1. Tools → Options → Users
2. Add user:
   - Username: admin
   - Context: TravelNest
   - Credentials: admin@example.com / admin123
3. Enable user
```

### Step 9: Analyze Results

#### View Alerts

```
1. Klik tab "Alerts"
2. Group by: Risk Level
3. Review vulnerabilities:

Risk Levels:
🔴 High: Critical vulnerabilities (SQL Injection, XSS, etc)
🟠 Medium: Important issues (Missing headers, etc)
🟡 Low: Minor issues (Information disclosure, etc)
🔵 Informational: Best practices recommendations
```

#### Common Vulnerabilities to Look For:

**High Risk:**
- SQL Injection
- Cross-Site Scripting (XSS)
- Remote Code Execution
- Authentication Bypass
- Session Management Issues

**Medium Risk:**
- Cross-Site Request Forgery (CSRF)
- Missing Security Headers
- Weak Password Policy
- Insecure Direct Object References

**Low Risk:**
- Information Disclosure
- Cookie Without Secure Flag
- Missing Anti-clickjacking Header

### Step 10: Generate Reports

#### HTML Report

```
1. Report → Generate HTML Report
2. Save as: travelnest-zap-report.html
3. Template: Traditional HTML Report
4. Include: All Alerts
5. Klik "Generate Report"
6. Buka report:
```

```powershell
Start-Process "travelnest-zap-report.html"
```

#### XML Report (untuk CI/CD)

```
1. Report → Generate XML Report
2. Save as: travelnest-zap-report.xml
```

#### JSON Report

```
1. Report → Generate JSON Report
2. Save as: travelnest-zap-report.json
```

#### Markdown Report

```
1. Report → Generate Markdown Report
2. Save as: travelnest-zap-report.md
```

### Step 11: ZAP API (Automation)

OWASP ZAP memiliki REST API untuk automation.

#### Start ZAP in Daemon Mode

```powershell
# Windows
& "C:\Program Files\ZAP\Zed Attack Proxy\zap.bat" -daemon -host localhost -port 8090 -config api.key=your-api-key

# Atau via Docker
docker run -p 8090:8090 zaproxy/zap-stable zap.sh -daemon -host 0.0.0.0 -port 8090 -config api.disablekey=true
```

#### Use ZAP API

```powershell
# API endpoint
$zapAPI = "http://localhost:8090"

# Spider scan
Invoke-RestMethod -Uri "$zapAPI/JSON/spider/action/scan/?url=http://localhost:3000&apikey=your-api-key" -Method Get

# Active scan
Invoke-RestMethod -Uri "$zapAPI/JSON/ascan/action/scan/?url=http://localhost:3000&apikey=your-api-key" -Method Get

# Get alerts
Invoke-RestMethod -Uri "$zapAPI/JSON/core/view/alerts/?baseurl=http://localhost:3000&apikey=your-api-key" -Method Get

# Generate HTML report
Invoke-RestMethod -Uri "$zapAPI/OTHER/core/other/htmlreport/?apikey=your-api-key" -Method Get -OutFile "zap-report.html"
```

### Step 12: Fix Vulnerabilities

Setelah scan, prioritaskan fixing berdasarkan severity:

#### High Priority Fixes

**1. SQL Injection:**
```javascript
// BAD: Direct string concatenation
const query = `SELECT * FROM users WHERE email = '${email}'`;

// GOOD: Prepared statements
const query = db.prepare('SELECT * FROM users WHERE email = ?');
const result = query.get(email);
```

**2. Cross-Site Scripting (XSS):**
```javascript
// Frontend: Sanitize input
import DOMPurify from 'dompurify';
const clean = DOMPurify.sanitize(userInput);

// Backend: Already using sanitizer
import { sanitizeInput } from '../utils/sanitizer.js';
const cleanData = sanitizeInput(req.body);
```

**3. Authentication Issues:**
```javascript
// Pastikan JWT properly implemented
// Pastikan password di-hash dengan bcrypt
// Pastikan session management secure
```

#### Medium Priority Fixes

**1. Missing Security Headers:**
```javascript
// backend/server.js - Already implemented
app.use(helmet({
  contentSecurityPolicy: true,
  hsts: true,
  noSniff: true,
  xssFilter: true
}));
```

**2. CORS Configuration:**
```javascript
// Pastikan CORS hanya allow trusted origins
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

### Step 13: Re-scan After Fixes

```
1. Fix vulnerabilities yang ditemukan
2. Restart aplikasi
3. Run ZAP scan ulang
4. Compare results
5. Verify vulnerabilities sudah fixed
```

---

## 🔄 PART 3: Integrate SAST & DAST ke CI/CD

### Jenkins Pipeline dengan SAST & DAST

Create atau update `Jenkinsfile`:

```groovy
pipeline {
    agent any
    
    environment {
        ZAP_API_KEY = credentials('zap-api-key')
    }
    
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/your-repo/travelnest.git'
            }
        }
        
        stage('SAST - ESLint') {
            steps {
                dir('frontend') {
                    sh 'npm install'
                    sh 'npx eslint . -f json -o eslint-report.json'
                }
                publishHTML([
                    reportDir: 'frontend',
                    reportFiles: 'eslint-report.json',
                    reportName: 'ESLint Report'
                ])
            }
        }
        
        stage('SAST - npm audit') {
            steps {
                dir('frontend') {
                    sh 'npm audit --json > npm-audit-frontend.json || true'
                }
                dir('backend') {
                    sh 'npm audit --json > npm-audit-backend.json || true'
                }
            }
        }
        
        stage('SAST - Snyk') {
            steps {
                sh 'snyk test --json > snyk-report.json || true'
            }
        }
        
        stage('Build & Deploy') {
            steps {
                sh 'docker-compose up -d'
                // Wait for application to start
                sleep 30
            }
        }
        
        stage('DAST - OWASP ZAP') {
            steps {
                script {
                    // Start ZAP scan
                    sh '''
                        docker run --rm --network=host \
                        zaproxy/zap-stable zap-baseline.py \
                        -t http://localhost:3000 \
                        -r zap-report.html \
                        -J zap-report.json
                    '''
                }
                publishHTML([
                    reportDir: '.',
                    reportFiles: 'zap-report.html',
                    reportName: 'ZAP Security Report'
                ])
            }
        }
        
        stage('Security Gate') {
            steps {
                script {
                    // Parse results and fail if high vulnerabilities found
                    def zapReport = readJSON file: 'zap-report.json'
                    def highRiskCount = zapReport.site[0].alerts.findAll { 
                        it.riskcode == '3' 
                    }.size()
                    
                    if (highRiskCount > 0) {
                        error "Found ${highRiskCount} high-risk vulnerabilities! Failing build."
                    }
                }
            }
        }
    }
    
    post {
        always {
            sh 'docker-compose down'
            archiveArtifacts artifacts: '**/eslint-report.json, **/npm-audit*.json, **/snyk-report.json, **/zap-report.*'
        }
        failure {
            emailext (
                subject: "Security Scan Failed: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
                body: "Security vulnerabilities found. Check Jenkins for details.",
                to: "security@example.com"
            )
        }
    }
}
```

### GitHub Actions dengan SAST & DAST

Create `.github/workflows/security-scan.yml`:

```yaml
name: Security Scan

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]
  schedule:
    - cron: '0 2 * * 0'  # Weekly on Sunday 2 AM

jobs:
  sast:
    name: SAST Analysis
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install Dependencies
      run: |
        cd frontend && npm install
        cd ../backend && npm install
    
    - name: Run ESLint
      run: cd frontend && npx eslint . --format json --output-file eslint-report.json
      continue-on-error: true
    
    - name: Run npm audit
      run: |
        cd frontend && npm audit --json > npm-audit-frontend.json || true
        cd ../backend && npm audit --json > npm-audit-backend.json || true
    
    - name: Run Snyk Security Scan
      uses: snyk/actions/node@master
      env:
        SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}
      with:
        args: --severity-threshold=high
      continue-on-error: true
    
    - name: Upload SAST Reports
      uses: actions/upload-artifact@v3
      with:
        name: sast-reports
        path: |
          frontend/eslint-report.json
          frontend/npm-audit-frontend.json
          backend/npm-audit-backend.json

  dast:
    name: DAST with OWASP ZAP
    runs-on: ubuntu-latest
    needs: sast
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Start Application
      run: |
        docker-compose up -d
        sleep 30  # Wait for app to start
    
    - name: Run OWASP ZAP Baseline Scan
      uses: zaproxy/action-baseline@v0.7.0
      with:
        target: 'http://localhost:3000'
        rules_file_name: '.zap/rules.tsv'
        cmd_options: '-a'
    
    - name: Upload ZAP Report
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: zap-report
        path: |
          report_html.html
          report_json.json
    
    - name: Stop Application
      if: always()
      run: docker-compose down
```

---

## 📊 PART 4: Security Testing Best Practices

### 1. Testing Frequency

```yaml
Development:
  - ESLint: Setiap commit (pre-commit hook)
  - npm audit: Daily
  
Weekly:
  - Snyk scan: Weekly
  - OWASP ZAP baseline: Weekly
  
Monthly:
  - Full OWASP ZAP scan: Monthly
  - SonarQube analysis: Monthly
  - Penetration testing: Quarterly
```

### 2. Vulnerability Prioritization

```
Priority 1 (Fix Immediately):
- SQL Injection
- Remote Code Execution
- Authentication Bypass
- Sensitive Data Exposure

Priority 2 (Fix in Sprint):
- Cross-Site Scripting (XSS)
- CSRF vulnerabilities
- Broken Access Control

Priority 3 (Schedule Fix):
- Missing security headers
- Information disclosure
- Weak cryptography

Priority 4 (Track & Review):
- Informational findings
- Best practice recommendations
```

### 3. Security Testing Checklist

```
✅ Pre-Commit:
[ ] ESLint passes
[ ] No console.log in production code
[ ] Sensitive data not hardcoded

✅ Pre-Deploy:
[ ] npm audit shows no high/critical
[ ] SAST scan passes
[ ] Dependencies up to date

✅ Post-Deploy:
[ ] DAST baseline scan complete
[ ] No new high-risk vulnerabilities
[ ] Security headers configured

✅ Monthly:
[ ] Full security audit
[ ] Review all open vulnerabilities
[ ] Update security documentation
```

### 4. False Positive Management

```powershell
# ZAP: Mark false positives
# 1. Right-click alert → Mark as False Positive
# 2. Add to context file

# Create .zap/rules.tsv untuk skip false positives
@"
10021	IGNORE	http://localhost:3000/static/.*
10202	IGNORE	http://localhost:3000/api/.*
"@ | Out-File -FilePath .zap/rules.tsv -Encoding UTF8
```

---

## 🎯 PART 5: Quick Reference Commands

### SAST Commands

```powershell
# ESLint
cd frontend
npx eslint . --fix                              # Fix auto-fixable issues
npx eslint . -f html -o eslint-report.html     # Generate HTML report

# npm audit
npm audit                                       # Check vulnerabilities
npm audit fix                                   # Auto-fix
npm audit --json > audit-report.json           # JSON report

# Snyk
snyk test                                       # Test vulnerabilities
snyk test --severity-threshold=high            # Only high/critical
snyk monitor                                    # Monitor project

# SonarQube
sonar-scanner                                   # Run analysis
```

### DAST Commands

```powershell
# Start ZAP daemon
zap.sh -daemon -host 0.0.0.0 -port 8090

# ZAP Baseline (Quick)
docker run --rm zaproxy/zap-stable zap-baseline.py -t http://target-url

# ZAP Full Scan (Comprehensive)
docker run --rm zaproxy/zap-stable zap-full-scan.py -t http://target-url

# ZAP API
curl "http://localhost:8090/JSON/spider/action/scan/?url=http://target"
curl "http://localhost:8090/JSON/ascan/action/scan/?url=http://target"
```

---

## 📚 Resources & Documentation

### SAST Resources
- 📖 [ESLint Rules](https://eslint.org/docs/rules/)
- 📖 [npm audit Documentation](https://docs.npmjs.com/cli/v8/commands/npm-audit)
- 📖 [Snyk Documentation](https://docs.snyk.io/)
- 📖 [SonarQube Docs](https://docs.sonarqube.org/)

### DAST Resources
- 📖 [OWASP ZAP Documentation](https://www.zaproxy.org/docs/)
- 📖 [ZAP API Documentation](https://www.zaproxy.org/docs/api/)
- 📖 [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- 📖 [Web Security Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)

### Video Tutorials
- 🎥 [OWASP ZAP Tutorial](https://www.youtube.com/zaproxy)
- 🎥 [Web Application Security Testing](https://www.youtube.com/results?search_query=web+application+security+testing)

---

## ❓ FAQ

**Q: Berapa lama waktu yang dibutuhkan untuk full OWASP ZAP scan?**
A: Tergantung ukuran aplikasi, bisa 30 menit hingga beberapa jam. Baseline scan lebih cepat (5-15 menit).

**Q: Apakah DAST bisa merusak aplikasi?**
A: Ya, active scan melakukan actual attacks. Jangan jalankan di production! Gunakan environment testing.

**Q: Bagaimana handle false positives di ZAP?**
A: Mark sebagai false positive di GUI atau tambahkan ke rules.tsv file untuk skip di future scans.

**Q: Apakah harus fix semua vulnerabilities?**
A: Prioritaskan high dan critical. Low risk bisa di-track dan fix gradually.

**Q: Kapan waktu terbaik run security scans?**
A: SAST: setiap commit. DAST: sebelum deploy ke staging/production atau weekly scheduled.

---

## 🔐 Security Contact

Jika menemukan critical security vulnerability:

1. **JANGAN** buat public issue di GitHub
2. Email security team: security@travelnest.com
3. Include:
   - Vulnerability description
   - Steps to reproduce
   - Potential impact
   - Suggested fix (jika ada)

---

**Selamat! Anda telah menyelesaikan hands-on SAST & DAST security testing! 🎉**

Ingat: **Security adalah proses berkelanjutan, bukan one-time activity!**

Untuk pertanyaan atau issues, silakan buka issue di repository atau hubungi tim development.
