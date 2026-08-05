# Business Logic Flaw: Negative Transfer Amount Leads to Balance Manipulation

* **Vulnerability Type:** CWE-840 — Business Logic Errors
* **Target / Platform:** `vulnbank.org`
* **Severity / CVSS:** Critical
* **Affected Endpoint:** `POST /transfer`

---

## 📌 Summary

The transfer feature does not properly validate negative numeric values in the `amount` parameter. Instead of rejecting invalid input, the application processes the request and applies the arithmetic in reverse, which increases the sender's balance.

This behavior allows an attacker to manipulate account balance by submitting a negative transfer amount. In the tested cases, the server returned `success` and updated the balance even when the recipient account was valid or when an arbitrary recipient value was provided.

---

## 📝 Description

The application is expected to handle money transfers using standard banking logic: when User A transfers money to User B, User A's balance should decrease and User B's balance should increase.

However, the transfer endpoint accepts negative values in the `amount` field and does not treat them as invalid input. Because of this, the backend processes the transfer as a reverse arithmetic operation, effectively crediting the sender instead of debiting them.

In addition, the endpoint still processes requests even when the `to_account` value is an arbitrary string that is not a valid account number. This shows that the transfer logic is not properly enforcing business rules for both amount validation and recipient validation.

---

## 🎯 Impact

A successful attacker can generate balance by repeatedly submitting negative transfer values. This can lead to unlimited fund creation within the platform's accounting logic and can completely break the integrity of the financial system.

Potential consequences include:

* Unauthorized balance inflation
* Manipulation of account records
* Fraudulent transfers
* Distortion of transaction history
* Loss of trust in platform accounting

In a real banking or wallet environment, this issue would be severe because it directly affects the correctness of financial state.

---

## 🛠️ Proof of Concept

### Expected Behavior

When a user transfers money:

* the sender's balance should decrease
* the recipient's balance should increase
* negative transfer amounts should be rejected

### Actual Behavior

The application accepts negative values and processes them successfully, causing the sender's balance to increase.

---

## PoC 1 — Negative Transfer to a Valid Recipient

### Steps to Reproduce

1. Open the transfer feature.
2. Enter a valid recipient account number.
3. Set the amount to a negative value, for example `-1000`.
4. Submit the transfer.
5. Observe that the request succeeds and the sender's balance increases.

### Raw HTTP Request

```http id="b7t1m4"
POST /transfer HTTP/1.1
Host: 127.0.0.1
Authorization: Bearer <valid_user_jwt>
Content-Type: application/json
Origin: http://127.0.0.1
Referer: http://127.0.0.1/dashboard
Connection: keep-alive

{"to_account":"8058997464","amount":"-1000","description":""}
```

### Raw HTTP Response

```http id="k3x8p9"
HTTP/1.0 200 OK
Content-Type: application/json
Access-Control-Allow-Origin: http://127.0.0.1
Server: Werkzeug/2.0.1 Python/3.9.25

{
  "message": "Transfer Completed",
  "new_balance": 3000.0,
  "status": "success"
}
```

### Result

The transfer was accepted even though the amount was negative. Instead of rejecting the request, the application increased the sender's balance.

---

## PoC 2 — Negative Transfer to an Arbitrary Recipient Value

### Steps to Reproduce

1. Open the transfer feature.
2. Enter an arbitrary recipient value that is not a valid account number.
3. Set the amount to a negative value, for example `-1000`.
4. Submit the transfer.
5. Observe that the request still succeeds.

### Raw HTTP Request

```http id="q8n5v2"
POST /transfer HTTP/1.1
Host: 127.0.0.1
Authorization: Bearer <valid_user_jwt>
Content-Type: application/json
Origin: http://127.0.0.1
Referer: http://127.0.0.1/dashboard
Connection: keep-alive

{"to_account":"asalasalan","amount":"-1000","description":""}
```

### Raw HTTP Response

```http id="d6r4h1"
HTTP/1.0 200 OK
Content-Type: application/json
Access-Control-Allow-Origin: http://127.0.0.1
Server: Werkzeug/2.0.1 Python/3.9.25

{
  "message": "Transfer Completed",
  "new_balance": 2000.0,
  "status": "success"
}
```

### Result

The server still processed the request even though the recipient value was not valid. This confirms that the transfer logic is not enforcing proper business validation on the destination account and negative amount input.

---

## 🔍 Root Cause

The application does not validate whether the transfer amount is positive before processing the transaction.

Because negative values are accepted, the backend applies the transfer logic incorrectly and credits the sender instead of rejecting the transaction. The endpoint also appears to lack strict validation for the recipient account field.

---

## ✅ Evidence

* Negative transfer amounts are accepted by the server.
* The response returns `status: success` instead of rejecting the request.
* The `new_balance` increases after submitting a negative transfer.
* The transfer logic still processes arbitrary recipient values.

---

## 📊 Attack Flow

```text id="n3z7k5"
Open transfer form
      │
      ▼
Submit negative amount
      │
      ▼
Backend fails to reject invalid input
      │
      ▼
Arithmetic is applied in reverse
      │
      ▼
Sender balance increases
      │
      ▼
Attacker can repeat the action
      │
      ▼
Balance manipulation / infinite fund generation
```

---

## 🛡️ Remediation

* Reject negative transfer amounts at the server side.
* Enforce strict numeric validation on the `amount` field.
* Require `amount > 0` before processing any transaction.
* Validate that `to_account` is a real and authorized recipient.
* Add server-side business logic checks, not only frontend validation.
* Log and alert on suspicious transfer patterns such as repeated negative transfers.

---

## 📚 References

* CWE-840 — Business Logic Errors
* OWASP Top 10 — Security Misconfiguration / Business Logic Flaws
* OWASP API Security Top 10 — Unrestricted Resource Consumption / Broken Business Logic

---

## 📝 Notes

This issue is not a classic injection bug. The problem is the application's business logic: it trusts a transfer amount that should be rejected by design.

The most important part of this finding is that the server treats a negative amount as valid input and processes it successfully, which makes the account balance manipulation possible.
