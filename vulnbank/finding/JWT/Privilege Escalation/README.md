# [Nama Kerentanan, misal: SQL Injection / IDOR / XSS] di [Nama Fitur/Endpoint]

- **Vulnerability Type:** [CWE-347 Previlege Escalation]
- **Target / Platform:** [vulnbank.org]
- **Severity / CVSS:** [Critical]
- **Endpoint:** `[GET] /dashboard`

---

## 📝 Deskripsi (Description)

[Tuliskan 1-2 paragraf yang menjelaskan kerentanan ini. Apa yang salah dari sistemnya? Misalnya: "Aplikasi menerima input pada parameter `id` tanpa melakukan sanitasi atau *prepared statements*, sehingga memungkinkan injeksi perintah SQL ke dalam database backend."]

## 🎯 Dampak (Impact)

[Jelaskan skenario terburuk jika celah ini dieksploitasi oleh *attacker*. Fokus pada kerugian teknis atau bisnis. Misalnya: "Attacker dapat membaca, mengubah, atau menghapus seluruh tabel di dalam database, berujung pada *Takeover* akun atau kebocoran PII (Personally Identifiable Information)."]

---

## 🛠️ Langkah Reproduksi (Proof of Concept)

Berikut adalah langkah-langkah untuk mereproduksi kerentanan:

1. [Langkah 1: misal, Login ke aplikasi menggunakan akun *low-privilege*.]
2. [Langkah 2: misal, Intercept *request* pada saat mengubah data profil menggunakan Burp Suite.]
3. [Langkah 3: misal, Ubah nilai parameter `user_id` menjadi `admin_id` atau tambahkan *payload* `' OR 1=1--`]
4. [Langkah 4: misal, Kirim *request* dan perhatikan bahwa respons server membocorkan data admin.]

**Raw HTTP Request:**

```http
GET /dashboard HTTP/1.1
Host: 127.0.0.1
sec-ch-ua: "Not;A=Brand";v="8", "Chromium";v="150"
sec-ch-ua-mobile: ?0
sec-ch-ua-platform: "Windows"
Accept-Language: en-US,en;q=0.9
Upgrade-Insecure-Requests: 1
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
Sec-Fetch-Site: same-origin
Sec-Fetch-Mode: navigate
Sec-Fetch-Dest: document
Referer: http://127.0.0.1/login
Accept-Encoding: gzip, deflate, br
Cookie: token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxMSwidXNlcm5hbWUiOiJ1c2VyQGdtYWlsLmNvbSIsImlzX2FkbWluIjpmYWxzZSwiaWF0IjoxNzg1ODI3NTQ0fQ.C63K2bPdHTxYiQ5h-lM2Os1Fswgj79LopgqOMvUJlgQ
Connection: keep-alive
```

**Raw HTTP Response:**

```http
HTTP/1.0 200 OK
Content-Type: text/html; charset=utf-8
Content-Length: 28339
Server: Werkzeug/2.0.1 Python/3.9.25

<!DOCTYPE html>
<html lang="en">
<head>
    <title>Dashboard - VulnBank</title>
    ... [SNIP: CSS & JS Imports] ...
</head>
<body>
    ... [SNIP: Navigation Code] ...

    <!-- Bukti 1: Terdapat Link ke Admin Panel yang tersembunyi -->
    <div class="nav-section-label">Admin</div>
    <a href="/sup3r_s3cr3t_admin" class="nav-link">
        <svg class="nav-link-icon" xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" ...></svg>
        Admin Panel
    </a>

    ... [SNIP: Sidebar Footer] ...

    <!-- Bukti 2: Akun berhasil login sebagai admin dengan saldo tinggi -->
    <div class="sidebar-user-info">
        <div class="sidebar-user-name">admin</div>
        <div class="sidebar-user-role">Personal Account</div>
    </div>

    ... [SNIP: Dashboard Cards] ...

    <div class="account-card-number">Acct <span class="mono" id="account-number">ADMIN001</span></div>
    <div class="account-card-balance" id="balance">$1000000.0</div>
</body>
</html>


```
