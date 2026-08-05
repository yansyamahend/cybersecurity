# Business Logic Flaw on Virtual Card Funding (Client-Controlled Exchange Rate)

* **Vulnerability Type:** CWE-840 — Business Logic Errors / Parameter Tampering
* **Target / Platform:** `vulnbank.org`
* **Severity / CVSS:** Critical
* **Affected Endpoint:** `POST /api/virtual-cards/{card_id}/fund`

---

## 📌 Summary

The virtual card funding flow accepts a client-controlled `exchange_rate` value and uses it during the conversion process without enforcing a trusted server-side rate. By tampering with this parameter, an attacker can inflate the converted asset amount while only paying the intended USD funding value.

In the tested case, a request funding a BTC virtual card with `amount: 1` was modified to include `exchange_rate: 10.0`, resulting in the server crediting `10.0 BTC` to the card while only deducting `1.0 USD` from the main balance.

---

## 📝 Description

The application allows the client to submit an `exchange_rate` field in the funding request for a virtual card. Instead of ignoring client-supplied pricing data and using a trusted server-side exchange rate, the backend accepts the provided value and uses it to calculate the converted amount.

This creates a business logic flaw because the conversion rate is supposed to be controlled by the platform, not the user. By modifying the request body, an attacker can force the server to credit an inflated card balance and bypass the intended financial conversion logic.

---

## 🎯 Impact

A successful attacker can manipulate the funding flow to mint an artificially inflated amount of digital assets on the virtual card.

Potential consequences include:

* Unauthorized inflation of virtual card balance
* Arbitrary asset gain through manipulated conversion rates
* Financial state corruption
* Abuse of crypto funding logic
* Loss of integrity in wallet and card accounting

In a real financial environment, this would be a severe issue because the application is trusting attacker-controlled pricing data for monetary conversion.

---

## 🛠️ Proof of Concept

### Steps to Reproduce

1. Log in to the application and open the Virtual Card dashboard.
2. Select a virtual card configured for cryptocurrency conversion, such as BTC.
3. Start a funding request with a baseline amount of `1 USD`.
4. Intercept the request using Burp Suite or another proxy tool.
5. Modify the JSON body and inject or overwrite the `exchange_rate` field with an arbitrary multiplier such as `10.0`.
6. Forward the modified request.
7. Observe that the server accepts the request and credits the inflated converted amount to the virtual card.

---

### Raw HTTP Request

```http id="v3h2k1"
POST /api/virtual-cards/8/fund HTTP/1.1
Host: 127.0.0.1
Authorization: Bearer <valid_user_jwt>
Content-Type: application/json
Origin: http://127.0.0.1
Referer: http://127.0.0.1
Connection: keep-alive

{
  "amount": 1,
  "exchange_rate": 10.0
}
```

---

### Raw HTTP Response

```http id="n8q4c7"
HTTP/1.0 200 OK
Content-Type: application/json
Access-Control-Allow-Origin: http://127.0.0.1
Vary: Origin
Server: Werkzeug/2.0.1 Python/3.9.25

{
  "funding": {
    "card_balance_after": 10.000028,
    "card_currency": "BTC",
    "card_id": 8,
    "card_type": "standard",
    "converted_amount": 10.0,
    "exchange_rate": 10.0,
    "main_balance_after": 10357.0,
    "usd_amount": 1.0
  },
  "message": "Card funded successfully",
  "status": "success"
}
```

---

## 🔍 Result Analysis

The response confirms that the backend accepted the attacker-supplied exchange rate.

* **USD amount deducted:** `1.0`
* **Converted amount credited:** `10.0 BTC`
* **Server response:** `status: success`

This proves that the conversion logic trusts a client-controlled value and can be manipulated to inflate the virtual card balance. The flaw is not in the mathematical conversion itself, but in the fact that the exchange rate should never be user-controlled.

---

## 🧠 Root Cause

The backend uses a request parameter that should be server-trusted, but instead accepts the client-supplied `exchange_rate` without validation or replacement with an authoritative rate source.

This is a classic business logic flaw and parameter tampering issue. The application should compute or fetch exchange rates on the server side and never allow the client to define monetary conversion factors.

---

## ✅ Evidence

* The request includes a manually supplied `exchange_rate: 10.0`.
* The server returns `200 OK` and processes the request successfully.
* The response shows `converted_amount: 10.0`.
* The main wallet is only debited by `1.0 USD`.
* The virtual card balance increases based on the tampered conversion rate.

---

## 📊 Attack Flow

```text id="m1z8p5"
Open virtual card funding flow
        │
        ▼
Intercept request
        │
        ▼
Modify exchange_rate in JSON body
        │
        ▼
Forward request
        │
        ▼
Server trusts client-controlled rate
        │
        ▼
Inflated asset amount is credited
        │
        ▼
Main balance is only deducted by the baseline USD amount
```

---

## 🛡️ Remediation

* Do not accept exchange rates from the client.
* Fetch exchange rates from a trusted server-side source.
* Validate all monetary conversion logic on the backend.
* Reject any request containing pricing or rate fields supplied by the client.
* Add strict schema validation and ignore unexpected fields.
* Log and monitor suspicious funding requests with abnormal conversion values.

---

## 📚 References

* CWE-840 — Business Logic Errors
* CWE-20 — Improper Input Validation
* OWASP API Security Top 10 — Business Logic Vulnerabilities

---

## 📝 Notes

This issue is best described as a **business logic flaw / parameter tampering** problem rather than a generic input validation bug. The important point is that the client is able to influence the exchange rate used by the server, which directly breaks the integrity of the funding process.
