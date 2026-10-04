# VulnBank Security Research & Vulnerability Writeups

A collection of security testing results, vulnerability findings, proof of concepts, impact analysis, and remediation recommendations from testing the deliberately vulnerable **VulnBank** web application.

The purpose of this repository is to document practical web application security testing, focusing on how vulnerabilities are discovered, tested, exploited, and analyzed from an attacker's perspective.

---

## 📌 Overview

**VulnBank** is a deliberately vulnerable banking application designed for practicing web application penetration testing and security research.

The testing in this repository focuses on identifying weaknesses in authentication, authorization, input validation, business logic, account management, password recovery, and client-side security.

Each finding contains a dedicated writeup with:

* Vulnerability classification
* Affected endpoint or feature
* Description
* Impact
* Proof of Concept (PoC)
* Root Cause
* Evidence
* Attack Flow
* Remediation
* References

---

## 🎯 Objectives

The main objectives of this security assessment are:

* Identify vulnerabilities within the VulnBank application.
* Understand how application behavior can be manipulated through crafted requests.
* Test whether server-side security controls correctly enforce authentication and authorization.
* Identify business logic flaws that can affect financial state.
* Demonstrate the real impact of successful exploitation.
* Document practical remediation steps for each vulnerability.

---

## 🌐 Target

| Information          | Details                                         |
| -------------------- | ----------------------------------------------- |
| **Target**           | `vulnbank.org`                                  |
| **Platform**         | VulnBank                                        |
| **Application Type** | Deliberately Vulnerable Banking Web Application |
| **Testing Focus**    | Web Application & API Security                  |

---

## 🔎 Scope

The assessment covers multiple application areas, including:

### Authentication

* User registration
* Login functionality
* JWT-based authentication
* Password recovery and password reset

### Authorization

* Privilege escalation
* Object-level authorization
* Administrative functionality

### Account Management

* User registration attributes
* Profile functionality
* User-controlled data

### Financial Features

* Balance manipulation
* Money transfers
* Virtual card funding
* Cryptocurrency conversion logic

### Transaction Features

* Transaction history
* Account-related object access

### Client-Side Security

* Stored XSS
* Client-side token storage
* Session/token exposure

### API Security

* API endpoint manipulation
* API version testing
* Parameter tampering
* Server-side validation

---

## 🧪 Testing Methodology

The testing process follows a practical web application security workflow:

```text
Reconnaissance
      │
      ▼
Vulnerability Identification
      │
      ▼
Hypothesis
      │
      ▼
Request Manipulation
      │
      ▼
Exploitation
      │
      ▼
Impact Validation
      │
      ▼
Root Cause Analysis
      │
      ▼
Risk Assessment
      │
      ▼
Remediation
```

The testing approach focuses on observing how the application behaves, forming a hypothesis about the security control, modifying the relevant request or input, and verifying whether the server accepts the unexpected behavior.

---

## 🛠️ Testing Tools

The testing documented in this repository primarily uses:

* **Burp Suite** — HTTP request interception and modification
* **Web Browser** — Application interaction and impact verification

Additional techniques and utilities may be used depending on the individual vulnerability.

---

# 📊 Findings

The assessment currently contains **8 documented vulnerabilities**:

| ID     | Vulnerability                                     | Severity | Impact                                         |
| ------ | ------------------------------------------------- | -------- | ---------------------------------------------- |
| VB-001 | JWT Signature Verification / Privilege Escalation | Critical | Administrator Privilege Escalation             |
| VB-002 | SQL Injection                                     | Critical | Authentication Bypass                          |
| VB-003 | Broken Object Level Authorization (BOLA)          | High     | Unauthorized Transaction Access                |
| VB-004 | Business Logic Flaw — Negative Transfer           | Critical | Balance Manipulation                           |
| VB-005 | Client-Controlled Exchange Rate                   | Critical | Asset / Balance Inflation                      |
| VB-006 | Mass Assignment                                   | Critical | Privileged Account Creation                    |
| VB-007 | Password Reset PIN Disclosure                     | High     | Unauthorized Password Reset / Account Takeover |
| VB-008 | Stored XSS                                        | Critical | Admin Account Takeover                         |

### Severity Summary

```text
Critical : 6
High     : 2
----------------
Total    : 8
```

---

# 🔐 Authentication & Authorization

## VB-001 — JWT Signature Verification / Privilege Escalation

**Severity:** Critical

**Affected Endpoint:**

```http
GET /dashboard
```

The application fails to properly verify the JWT signature before trusting authorization-related claims.

A low-privileged authenticated user can modify claims such as:

```json
{
  "is_admin": true
}
```

The manipulated token is then accepted by the server, resulting in administrative access.

### Impact

* Standard user → administrator
* Unauthorized access to admin functionality
* Access to administrative resources
* Potential application-wide compromise

[View full writeup →](./finding/Privilege%20Escalation/README.md)

---

## VB-002 — SQL Injection Authentication Bypass

**Severity:** Critical

**Affected Endpoint:**

```http
POST /login
```

The login endpoint is vulnerable to SQL Injection through the `username` parameter.

A payload such as:

```text
admin'--
```

can alter the SQL query and bypass the password verification logic.

The tested payload resulted in a successful login as the `admin` account without knowing the administrator password.

### Impact

* Authentication bypass
* User impersonation
* Administrator access
* Potential full application compromise

[View full writeup →](./finding/SQL%20Injection/README.md)

---

## VB-003 — Broken Object Level Authorization (BOLA)

**Severity:** High

**Affected Endpoint:**

```http
GET /transactions/{account_number}
```

The transaction history endpoint does not properly verify whether the authenticated user owns the requested account object.

By changing the `account_number` in the URL, an authenticated attacker can access transaction history belonging to another account.

### Impact

* Unauthorized transaction history access
* Exposure of financial activity
* Exposure of account information
* Privacy violations
* Potential fraud or social engineering opportunities

[View full writeup →](./finding/Broken%20Object%20Level%20Authorization/README.md)

---

# 💰 Business Logic & Financial Security

## VB-004 — Negative Transfer Amount Leads to Balance Manipulation

**Severity:** Critical

**Affected Endpoint:**

```http
POST /transfer
```

The transfer endpoint accepts negative values in the `amount` parameter.

Instead of rejecting the invalid amount, the backend processes the value and performs the arithmetic in reverse, causing the sender's balance to increase.

The application also processes an arbitrary `to_account` value in the tested scenario.

### Impact

* Unauthorized balance inflation
* Financial state manipulation
* Fraudulent transactions
* Potential unlimited fund generation
* Corruption of accounting logic

[View full writeup →](./finding/Business%20Logic%20Flaw/README.md)

---

## VB-005 — Client-Controlled Exchange Rate

**Severity:** Critical

**Affected Endpoint:**

```http
POST /api/virtual-cards/{card_id}/fund
```

The virtual card funding process accepts an attacker-controlled `exchange_rate` value.

In the tested PoC, the request used:

```json
{
  "amount": 1,
  "exchange_rate": 10.0
}
```

The server then credited:

```text
10.0 BTC
```

while only processing:

```text
1.0 USD
```

This shows that the backend trusts pricing information supplied by the client.

### Impact

* Artificial asset inflation
* Manipulation of virtual card balances
* Financial state corruption
* Abuse of cryptocurrency conversion logic

[View full writeup →](./finding/Client%20Controlled%20Exchange%20Rate/README.md)

---

## VB-006 — Mass Assignment on Registration

**Severity:** Critical

**Affected Endpoint:**

```http
POST /register
```

The registration endpoint accepts unexpected JSON properties and maps them directly into server-side user attributes.

During testing, sensitive properties such as:

```json
{
  "is_admin": true,
  "balance": 9999
}
```

were accepted by the server.

The resulting account was created with administrator privileges and the attacker-controlled starting balance.

### Impact

* Unauthorized privileged account creation
* Privilege escalation
* Arbitrary balance assignment
* Abuse of administrative functionality
* Potential application compromise

[View full writeup →](./finding/Mass%20Assignment/README.md)

---

# 🔑 Password Recovery

## VB-007 — Password Reset PIN Disclosure via Legacy API

**Severity:** High

**Affected Endpoints:**

```http
POST /api/v1/forgot-password
POST /api/v1/reset-password
```

The normal password recovery flow uses the `v3` API, but the legacy `v1` endpoint remains accessible.

The legacy endpoint exposes the actual password reset PIN in its response:

```json
{
  "debug_info": {
    "pin": "969",
    "username": "admin"
  }
}
```

The leaked PIN was then successfully submitted to the password reset endpoint and the password for the target account was changed.

### Impact

* Reset credential disclosure
* Unauthorized password changes
* Potential account takeover
* Possible compromise of privileged accounts

### Attack Chain

```text
Legacy API
     │
     ▼
Reset PIN Disclosure
     │
     ▼
Attacker obtains valid reset credential
     │
     ▼
Password Reset
     │
     ▼
Account Takeover
```

[View full writeup →](./finding/Password%20Reset%20PIN%20Disclosure/README.md)

---

# 🌐 Client-Side Security

## VB-008 — Stored XSS Leading to Admin Account Takeover

**Severity:** Critical

**Affected Area:**

```text
Profile Bio
```

The profile bio feature does not properly sanitize HTML input before rendering it.

A malicious payload can execute JavaScript when another user views the attacker's profile.

The application also stores the authentication JWT in:

```javascript
localStorage
```

Because JavaScript can access `localStorage`, the XSS payload can read the victim's JWT and send it to an attacker-controlled endpoint.

The tested attack successfully captured the administrator's JWT.

### Impact

* Stored XSS
* JWT theft
* Session hijacking
* Administrator account takeover
* Unauthorized actions as the victim

### Attack Chain

```text
Attacker injects malicious JavaScript
        │
        ▼
Payload is stored in profile
        │
        ▼
Admin views attacker profile
        │
        ▼
XSS executes
        │
        ▼
JWT is read from localStorage
        │
        ▼
JWT is exfiltrated
        │
        ▼
Attacker reuses admin session
        │
        ▼
Admin Account Takeover
```

[View full writeup →](./finding/XSS%20Account%20Takeover/README.md)

---

# 🔥 Key Security Themes

The findings in this repository demonstrate several recurring security problems.

## 1. Authentication Trust

The application relies on security-sensitive values without sufficiently protecting their integrity.

Examples include:

```text
SQL Injection
JWT Signature Verification
Password Reset PIN
```

These weaknesses can allow attackers to bypass or manipulate authentication mechanisms.

---

## 2. Missing Authorization Checks

Authentication alone does not guarantee that a user is allowed to access or modify every object.

The BOLA finding demonstrates how an authenticated user can access another user's transaction data simply by changing an object identifier.

The JWT privilege escalation finding also shows the danger of trusting client-controlled authorization claims.

---

## 3. Client-Controlled Security Decisions

Several findings occur because the backend trusts values supplied directly by the client.

Examples include:

```text
is_admin
balance
exchange_rate
amount
account_number
```

Sensitive values should be validated or generated using trusted server-side logic rather than being blindly accepted from the client.

---

## 4. Business Logic Abuse

Not every vulnerability requires a complicated payload.

The financial findings demonstrate that incorrect business rules can be just as dangerous as traditional injection vulnerabilities.

Examples:

```text
Negative transfer
        ↓
Balance increases

Manipulated exchange rate
        ↓
Asset amount inflated

Client-controlled balance
        ↓
Arbitrary starting funds
```

These issues directly affect the integrity of the application's financial state.

---

## 5. Account Takeover Chains

Two findings demonstrate complete attack chains that can result in account takeover.

### Password Recovery Chain

```text
Legacy API
    ↓
Reset PIN Disclosure
    ↓
Password Reset
    ↓
Account Takeover
```

### Stored XSS Chain

```text
Stored XSS
    ↓
JWT Access
    ↓
JWT Exfiltration
    ↓
Session Hijacking
    ↓
Admin Account Takeover
```

---

# 📈 Risk Overview

The currently documented findings can be grouped into the following major security risks:

| Security Area        | Findings                         | Main Risk                                    |
| -------------------- | -------------------------------- | -------------------------------------------- |
| Authentication       | SQL Injection, JWT Verification  | Authentication Bypass / Privilege Escalation |
| Authorization        | BOLA, JWT Verification           | Unauthorized Access                          |
| Business Logic       | Negative Transfer, Exchange Rate | Financial Manipulation                       |
| Account Management   | Mass Assignment                  | Privileged Account Creation                  |
| Password Recovery    | Reset PIN Disclosure             | Account Takeover                             |
| Client-Side Security | Stored XSS                       | Session Theft / Account Takeover             |

---

# 🧠 Security Observations

The most important lesson from this assessment is that security controls must be enforced on the **server side**.

Frontend restrictions alone are not sufficient because an attacker can directly modify HTTP requests before they reach the backend.

Examples from the findings include:

```text
Frontend says:
"Amount cannot be negative"

        ↓

Attacker modifies request

        ↓

Server accepts:
amount = -1000
```

Another example:

```text
Frontend provides:
normal registration fields

        ↓

Attacker adds:

is_admin = true
balance = 9999

        ↓

Server accepts both values
```

The same principle applies to authorization, password recovery, exchange rates, and JWT claims.

---

# 📂 Repository Structure

```text
vulnbank/
│
├── README.md
│
└── finding/
    │
    ├── Broken Object Level Authorization/
    │   └── README.md
    │
    ├── Business Logic Flaw/
    │   └── README.md
    │
    ├── Client Controlled Exchange Rate/
    │   └── README.md
    │
    ├── Mass Assignment/
    │   └── README.md
    │
    ├── Password Reset PIN Disclosure/
    │   └── README.md
    │
    ├── Privilege Escalation/
    │   └── README.md
    │
    ├── SQL Injection/
    │   ├── README.md
    │   └── image.png
    │
    └── XSS Account Takeover/
        ├── README.md
        ├── payload.js
        ├── payload.png
        └── webhook.png
```

Each vulnerability has its own dedicated directory so that the main README remains an overview while the detailed PoC and technical analysis stay inside their respective findings.

---

# 📝 Finding Index

For detailed exploitation steps, raw HTTP requests/responses, evidence, root cause analysis, and remediation, see the individual writeups below.

| ID     | Finding                                           | Severity | Writeup                                                             |
| ------ | ------------------------------------------------- | -------- | ------------------------------------------------------------------- |
| VB-001 | JWT Signature Verification / Privilege Escalation | Critical | [Read](./finding/Privilege%20Escalation/README.md)                  |
| VB-002 | SQL Injection Authentication Bypass               | Critical | [Read](./finding/SQL%20Injection/README.md)                         |
| VB-003 | Broken Object Level Authorization                 | High     | [Read](./finding/Broken%20Object%20Level%20Authorization/README.md) |
| VB-004 | Negative Transfer Amount                          | Critical | [Read](./finding/Business%20Logic%20Flaw/README.md)                 |
| VB-005 | Client-Controlled Exchange Rate                   | Critical | [Read](./finding/Client%20Controlled%20Exchange%20Rate/README.md)   |
| VB-006 | Mass Assignment                                   | Critical | [Read](./finding/Mass%20Assignment/README.md)                       |
| VB-007 | Password Reset PIN Disclosure                     | High     | [Read](./finding/Password%20Reset%20PIN%20Disclosure/README.md)     |
| VB-008 | Stored XSS Account Takeover                       | Critical | [Read](./finding/XSS%20Account%20Takeover/README.md)                |

---

# 🛡️ General Security Recommendations

Based on the findings documented in this repository, the application should generally:

* Enforce all security decisions on the server side.
* Use parameterized SQL queries.
* Properly verify JWT signatures before trusting their claims.
* Implement object-level authorization checks.
* Reject invalid business logic values such as negative transaction amounts.
* Never trust client-controlled pricing or exchange-rate values.
* Use strict allowlists for writable object attributes.
* Never expose reset PINs or other secrets in API responses.
* Disable debug information in production.
* Sanitize and encode user-controlled HTML.
* Avoid storing sensitive authentication tokens in `localStorage`.
* Apply proper session security controls.
* Add rate limiting and monitoring to security-sensitive endpoints.

---

# 📚 References

The individual findings contain their relevant CWE and OWASP references.

General references used throughout the assessment include:

* **OWASP Top 10**
* **OWASP API Security Top 10**
* **OWASP Cheat Sheet Series**
* **CWE**
* **RFC 7519 — JSON Web Token (JWT)**

---

# ⚠️ Disclaimer

This repository documents security testing performed against **VulnBank**, a deliberately vulnerable training application.

The techniques and proof-of-concept examples are intended for educational purposes, security research, and authorized penetration testing.

Do not use these techniques against systems or accounts without explicit permission from the owner.

---

## 📌 Status

```text
Target      : VulnBank
Findings    : 8
Critical    : 6
High        : 2
Status      : Documented
```

---

## 👨‍💻 About This Repository

This repository serves as a practical security research portfolio documenting hands-on web application testing and vulnerability analysis.

The focus is not only on finding vulnerabilities, but also on understanding:

```text
What is happening?
        ↓
Why is it happening?
        ↓
How can it be reproduced?
        ↓
What is the impact?
        ↓
How should it be fixed?
```

Each finding is documented with that approach to make the technical analysis easier to understand and reproduce in an authorized environment.
