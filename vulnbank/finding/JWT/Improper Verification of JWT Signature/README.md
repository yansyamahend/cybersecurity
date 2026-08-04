# [Nama Kerentanan, misal: SQL Injection / IDOR / XSS] di [Nama Fitur/Endpoint]

- **Vulnerability Type:** [CWE-347 Improre Verification of JWT Signature]
- **Target / Platform:** [vulnbank.org]
- **Severity / CVSS:** [Critical]
- **Endpoint:** `[GET/POST] /api/v1/path/to/endpoint`

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

**Raw HTTP Request (Exploit):**

```http
POST /login HTTP/1.1
Host: 127.0.0.1
Content-Length: 47
sec-ch-ua-platform: "Windows"
Accept-Language: en-US,en;q=0.9
sec-ch-ua: "Not;A=Brand";v="8", "Chromium";v="150"
Content-Type: application/json
sec-ch-ua-mobile: ?0
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36
Accept: */*
Origin: http://127.0.0.1
Sec-Fetch-Site: same-origin
Sec-Fetch-Mode: cors
Sec-Fetch-Dest: empty
Referer: http://127.0.0.1/login
Accept-Encoding: gzip, deflate, br
Cookie: token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjozLCJ1c2VybmFtZSI6ImFuamF5QGdtYWlsLmNvbSIsImlzX2FkbWluIjpmYWxzZSwiaWF0IjoxNzg1ODI1MDkxfQ.FrC92TARvyWyCcEXt5wf_iCLdDoa4DuQJVg00FKC8b4
Connection: keep-alive

{"username":"anjay@gmail.com","password":"123"}
```
