# [Nama Kerentanan, misal: SQL Injection / IDOR / XSS] di [Nama Fitur/Endpoint]

- **Vulnerability Type:** CWE-347 Improre Verification of JWT Signature.
- **Target / Platform:** [vulnbank org]
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
[Paste raw request dari Burp Suite / terminal di sini. Sorot/tandai bagian payload-nya jika perlu]
```
