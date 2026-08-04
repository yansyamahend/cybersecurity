# [Nama Kerentanan, misal: SQL Injection / IDOR / XSS] di [Nama Fitur/Endpoint]

- **Vulnerability Type:** [CWE-347 Previlege Escalation]
- **Target / Platform:** [vulnbank.org]
- **Severity / CVSS:** [Critical]
- **Endpoint:** `[GET] /dashboard`

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

**Raw HTTP Request:**

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
Cookie: token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoxMSwidXNlcm5hbWUiOiJ1c2VyQGdtYWlsLmNvbSIsImlzX2FkbWluIjpmYWxzZSwiaWF0IjoxNzg1ODI3NTQ0fQ.C63K2bPdHTxYiQ5h-lM2Os1Fswgj79LopgqOMvUJlgQ
Connection: keep-alive
```

**Raw HTTP Response:**

```http
HTTP/1.0 200 OK
Content-Type: text/html; charset=utf-8
Content-Length: 28339
Server: Werkzeug/2.0.1 Python/3.9.25

<!DOCTYPE html>
<html lang="en">
<head>
    <title>Dashboard - VulnBank</title>
    ... [SNIP: CSS & JS Imports] ...
</head>
<body>
    ... [SNIP: Navigation Code] ...

    <!-- Bukti 1: Terdapat Link ke Admin Panel yang tersembunyi -->
    <div class="nav-section-label">Admin</div>
    <a href="/sup3r_s3cr3t_admin" class="nav-link">
        <svg class="nav-link-icon" xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" ...></svg>
        Admin Panel
    </a>

    ... [SNIP: Sidebar Footer] ...

    <!-- Bukti 2: Akun berhasil login sebagai admin dengan saldo tinggi -->
    <div class="sidebar-user-info">
        <div class="sidebar-user-name">admin</div>
        <div class="sidebar-user-role">Personal Account</div>
    </div>

    ... [SNIP: Dashboard Cards] ...

    <div class="account-card-number">Acct <span class="mono" id="account-number">ADMIN001</span></div>
    <div class="account-card-balance" id="balance">$1000000.0</div>

    ... [TRUNCATED: Sisa kode HTML disembunyikan] ...

               </div>
            <div class="account-card card-navy">
                <div class="account-card-label">Quick Transfer</div>
                <div class="account-card-number" style="opacity:0.4;">Send money instantly</div>
                <div style="margin-top:auto;">
                    <button onclick="document.querySelector('.nav-link[href=\'#transfers\']').click()" style="background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.08);color:#fff;padding:0.375rem 0.875rem;font-size:0.6875rem;font-weight:600;border-radius:var(--r-full);cursor:pointer;">Send Money &rarr;</button>
                </div>
            </div>
            <div class="account-card card-dark">
                <div class="account-card-label">Virtual Cards</div>
                <div class="account-card-number" style="opacity:0.4;">Manage your cards</div>
                <div style="margin-top:auto;">
                    <button onclick="document.querySelector('.nav-link[href=\'#virtual-cards\']').click()" style="background:rgba(0,123,255,0.15);border:1px solid rgba(0,123,255,0.12);color:var(--brand-light);padding:0.375rem 0.875rem;font-size:0.6875rem;font-weight:600;border-radius:var(--r-full);cursor:pointer;">View Cards &rarr;</button>
                </div>
            </div>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions reveal">
            <div class="action-pill" onclick="document.querySelector('.nav-link[href=\'#transfers\']').click()">
                <div class="action-pill-icon lime"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg></div>
                <span class="action-pill-label">Send Money</span>
            </div>
            <div class="action-pill" onclick="document.querySelector('.nav-link[href=\'#loans\']').click()">
                <div class="action-pill-icon blue"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg></div>
                <span class="action-pill-label">Request Loan</span>
            </div>
            <div class="action-pill" onclick="document.querySelector('.nav-link[href=\'#virtual-cards\']').click()">
                <div class="action-pill-icon purple"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg></div>
                <span class="action-pill-label">Virtual Cards</span>
            </div>
            <div class="action-pill" onclick="document.querySelector('.nav-link[href=\'#bill-payments\']').click()">
                <div class="action-pill-icon amber"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg></div>
                <span class="action-pill-label">Pay Bills</span>
            </div>
        </div>

        <!-- Profile Section -->
        <div class="dashboard-section profile-section reveal" id="profile">
            <div class="section-header"><h2 class="section-title">Profile</h2></div>
            <div class="profile-picture-wrapper">
                <img id="profile-picture" class="profile-picture" src="/static/uploads/19552_htaccess" alt="Profile Picture">
                <div class="profile-picture-edit" onclick="document.getElementById('profile_picture').click()" aria-label="Change profile picture">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </div>
            </div>
            <form id="profileUploadForm" enctype="multipart/form-data">
                <input type="file" id="profile_picture" name="profile_picture" accept="image/*" style="display: none;" onchange="document.getElementById('profileUploadForm').requestSubmit();">
                <button type="button" class="btn-secondary btn-sm" onclick="document.getElementById('profile_picture').click()">Upload Photo</button>
                <button type="button" class="btn-ghost btn-sm" id="profileUrlButton">Import from URL</button>
            </form>
            <div id="upload-message" aria-live="polite"></div>

            <!-- Stored XSS Vulnerability: User Bio -->
            <div style="margin-top:2rem;padding-top:2rem;border-top:1px solid var(--border);">
                <h3 style="font-size:1.125rem;font-weight:600;margin-bottom:1rem;">Your Bio</h3>

                <form id="bioForm" style="margin-top:1rem;">
                    <div class="form-group">
                        <label for="bio_input">Update your bio (HTML allowed):</label>
                        <textarea id="bio_input" name="bio" rows="3" placeholder="Tell us about yourself... HTML tags are supported!"></textarea>
                    </div>
                    <button type="submit" class="btn-accent btn-sm">Update Bio</button>
                </form>
                <div id="bio-message" aria-live="polite"></div>
            </div>
        </div>

        <!-- Money Transfer -->
        <div class="dashboard-section reveal" id="transfers">
            <div class="section-header"><h2 class="section-title">Money Transfer</h2></div>
            <form id="transferForm">
                <div class="form-group"><label for="to_account">Recipient Account Number</label><input type="text" id="to_account" name="to_account" placeholder="Enter recipient's account number" required></div>
                <div class="form-group"><label for="amount">Amount</label><input type="number" id="amount" name="amount" placeholder="0.00" step="0.01" required></div>
                <div class="form-group"><label for="description">Description (optional)</label><textarea id="description" name="description" placeholder="Add a note about this transfer" rows="3"></textarea></div>
                <button type="submit">Send Money</button>
            </form>
        </div>

        <!-- Loans -->
        <div class="dashboard-section reveal" id="loans">
            <div class="section-header"><h2 class="section-title">Request a Loan</h2></div>
            <form id="loanForm">
                <div class="form-group"><label for="loan_amount">Loan Amount</label><input type="number" id="loan_amount" name="amount" placeholder="0.00" step="0.01" required></div>
                <button type="submit">Submit Request</button>
            </form>

        </div>

        <!-- Transactions -->
        <div class="dashboard-section reveal" id="transactions">
            <div class="section-header"><h2 class="section-title">Transaction History</h2></div>
            <div id="transaction-list"><div style="text-align:center;padding:2rem;"><div class="loading-spinner"></div><p style="margin-top:0.75rem;">Loading transactions...</p></div></div>
        </div>

        <!-- Virtual Cards -->
        <div class="dashboard-section reveal" id="virtual-cards">
            <div class="section-header"><h2 class="section-title">Virtual Cards</h2>
                <button class="btn-accent btn-sm" onclick="showCreateCardModal()"><svg style="width:16px;height:16px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> New Card</button>
            </div>
            <div id="virtual-cards-list" class="cards-container"></div>
        </div>

        <!-- Bill Payments -->
        <div class="dashboard-section reveal" id="bill-payments">
            <div class="section-header"><h2 class="section-title">Bill Payments</h2>
                <button class="btn-accent btn-sm" onclick="showPayBillModal()"><svg style="width:16px;height:16px;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg> Pay Bill</button>
            </div>
            <div id="bill-payments-list" class="payments-container"><div style="text-align:center;padding:2rem;"><div class="loading-spinner"></div><p style="margin-top:0.75rem;">Loading bill payment history...</p></div></div>
        </div>
    </main>

    <!-- Modals (placed outside main for proper positioning) -->
    <div id="createCardModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">Create Virtual Card</h3>
                <button class="modal-close" onclick="hideCreateCardModal()" aria-label="Close">&times;</button>
            </div>
            <div id="createCardModal-message" class="modal-message" style="display: none;"></div>
            <form id="createCardForm">
                <div class="form-group">
                    <label for="card_limit">Card Limit</label>
                    <input type="number" id="card_limit" name="card_limit" placeholder="0.00" step="0.00000001" required>
                    <div id="cardLimitHelper" class="form-helper">Limits are stored in the selected card currency.</div>
                </div>
                <div class="form-group">
                    <label for="card_currency">Card Currency</label>
                    <select id="card_currency" name="currency" required>
                        <option value="USD">USD</option>
                        <option value="GBP">GBP</option>
                        <option value="NGN">NGN</option>
                        <option value="JPY">JPY</option>
                        <option value="EUR">EUR</option>
                        <option value="QAR">QAR</option>
                        <option value="BTC">BTC</option>
                        <option value="ETH">ETH</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="card_type">Card Type</label>
                    <select id="card_type" name="card_type" required>
                        <option value="standard">Standard</option>
                        <option value="premium">Premium</option>
                    </select>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn-ghost" onclick="hideCreateCardModal()">Cancel</button>
                    <button type="submit">Create Card</button>
                </div>
            </form>
        </div>
    </div>

    <div id="cardDetailsModal" class="modal"><div class="modal-content"><div class="modal-header"><h3 class="modal-title">Card Details</h3><button class="modal-close" onclick="hideCardDetailsModal()" aria-label="Close">&times;</button></div><div id="cardDetailsModal-message" class="modal-message" style="display: none;"></div><div id="cardDetailsContent"></div><div class="modal-footer"><button class="btn-ghost" onclick="hideCardDetailsModal()">Close</button></div></div></div>

    <div id="fundCardModal" class="modal">
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">Fund Virtual Card</h3>
                <button class="modal-close" onclick="hideFundCardModal()" aria-label="Close">&times;</button>
            </div>
            <div id="fundCardModal-message" class="modal-message" style="display: none;"></div>
            <form id="fundCardForm">
                <input type="hidden" id="fund_card_id" name="card_id">
                <div class="form-group">
                    <label>Funding Source</label>
                    <div class="funding-source-note">Main Balance (USD)</div>
                </div>
                <div class="form-group">
                    <label>Selected Card</label>
                    <div id="fundCardSummary" class="funding-source-note">No card selected</div>
                </div>
                <div class="form-group">
                    <label for="fund_amount">Amount to Convert from Main Balance</label>
                    <input type="number" id="fund_amount" name="amount" placeholder="0.00" step="0.01" min="0.01" required>
                    <div id="fundingPreview" class="form-helper">Enter a USD amount to preview the converted card value.</div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn-ghost" onclick="hideFundCardModal()">Cancel</button>
                    <button type="submit">Fund Card</button>
                </div>
            </form>
        </div>
    </div>

    <div id="payBillModal" class="modal"><div class="modal-content"><div class="modal-header"><h3 class="modal-title">Pay Bill</h3><button class="modal-close" onclick="hidePayBillModal()" aria-label="Close">&times;</button></div><div id="payBillModal-message" class="modal-message" style="display: none;"></div><form id="payBillForm"><div class="form-group"><label for="billCategory">Bill Category</label><select id="billCategory" onchange="loadBillers(this.value)" required><option value="">Select Category</option></select></div><div class="form-group"><label for="biller">Biller</label><select id="biller" name="biller_id" required disabled><option value="">Select Biller</option></select></div><div class="form-group"><label for="bill_amount">Amount</label><input type="number" id="bill_amount" name="amount" step="0.01" placeholder="0.00" required></div><div class="form-group"><label for="payment_method">Payment Method</label><select id="payment_method" name="payment_method" onchange="toggleCardSelection(this.value)" required><option value="balance">Account Balance</option><option value="virtual_card">Virtual Card</option></select></div><div class="form-group" id="cardSelection" style="display:none;"><label for="card_id">Select Card</label><select id="card_id" name="card_id"><option value="">Select Card</option></select></div><div class="form-group"><label for="bill_description">Description (Optional)</label><input type="text" id="bill_description" name="description" placeholder="Payment note"></div><div class="modal-footer"><button type="button" class="btn-ghost" onclick="hidePayBillModal()">Cancel</button><button type="submit">Pay Now</button></div></form></div></div>

    <!-- Toast Notifications Container -->
    <div id="toast-container" class="toast-container" aria-live="polite" aria-atomic="true"></div>

    <!-- Chat Widget (same structure, all IDs preserved) -->
    <div id="chatWidget" class="chat-widget">
        <div id="chatToggle" class="chat-toggle" onclick="toggleChat()" aria-label="Open support chat">
            <svg width="24" height="24" fill="white" viewBox="0 0 24 24"><path d="M12,2A2,2 0 0,1 14,4C14,4.74 13.6,5.39 13,5.73V7H14A7,7 0 0,1 21,14H22A1,1 0 0,1 23,15V18A1,1 0 0,1 22,19H21V20A2,2 0 0,1 19,22H5A2,2 0 0,1 3,20V19H2A1,1 0 0,1 1,18V15A1,1 0 0,1 2,14H3A7,7 0 0,1 10,7H11V5.73C10.4,5.39 10,4.74 10,4A2,2 0 0,1 12,2M7.5,13A2.5,2.5 0 0,0 5,15.5A2.5,2.5 0 0,0 7.5,18A2.5,2.5 0 0,0 10,15.5A2.5,2.5 0 0,0 7.5,13M16.5,13A2.5,2.5 0 0,0 14,15.5A2.5,2.5 0 0,0 16.5,18A2.5,2.5 0 0,0 19,15.5A2.5,2.5 0 0,0 16.5,13Z"/></svg>
            <span id="chatBadge" class="chat-badge" style="display:none;">1</span>
            <div class="chat-tooltip" id="chatTooltip">Chat with Support</div>
        </div>
        <div id="chatWindow" class="chat-window" style="display:none;">
            <div class="chat-header"><div class="chat-agent-info"><div class="agent-avatar"><svg width="20" height="20" fill="white" viewBox="0 0 24 24"><path d="M12,2A2,2 0 0,1 14,4C14,4.74 13.6,5.39 13,5.73V7H14A7,7 0 0,1 21,14H22A1,1 0 0,1 23,15V18A1,1 0 0,1 22,19H21V20A2,2 0 0,1 19,22H5A2,2 0 0,1 3,20V19H2A1,1 0 0,1 1,18V15A1,1 0 0,1 2,14H3A7,7 0 0,1 10,7H11V5.73C10.4,5.39 10,4.74 10,4A2,2 0 0,1 12,2M7.5,13A2.5,2.5 0 0,0 5,15.5A2.5,2.5 0 0,0 7.5,18A2.5,2.5 0 0,0 10,15.5A2.5,2.5 0 0,0 7.5,13M16.5,13A2.5,2.5 0 0,0 14,15.5A2.5,2.5 0 0,0 16.5,18A2.5,2.5 0 0,0 19,15.5A2.5,2.5 0 0,0 16.5,13Z"/></svg></div><div class="agent-details"><div class="agent-name">AI Support</div><div class="agent-status">Online</div></div></div><button class="chat-close" onclick="toggleChat()" aria-label="Close chat"><svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg></button></div>
            <div class="chat-mode-toggle"><div class="mode-selector"><label class="mode-option"><input type="radio" name="chatMode" value="authenticated" checked><span>Authenticated</span></label><label class="mode-option"><input type="radio" name="chatMode" value="anonymous"><span>Anonymous</span></label></div></div>
            <div class="chat-messages" id="chatMessages"><div class="message bot-message"><div class="message-avatar"><svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24"><path d="M12,2A2,2 0 0,1 14,4C14,4.74 13.6,5.39 13,5.73V7H14A7,7 0 0,1 21,14H22A1,1 0 0,1 23,15V18A1,1 0 0,1 22,19H21V20A2,2 0 0,1 19,22H5A2,2 0 0,1 3,20V19H2A1,1 0 0,1 1,18V15A1,1 0 0,1 2,14H3A7,7 0 0,1 10,7H11V5.73C10.4,5.39 10,4.74 10,4A2,2 0 0,1 12,2M7.5,13A2.5,2.5 0 0,0 5,15.5A2.5,2.5 0 0,0 7.5,18A2.5,2.5 0 0,0 10,15.5A2.5,2.5 0 0,0 7.5,13M16.5,13A2.5,2.5 0 0,0 14,15.5A2.5,2.5 0 0,0 16.5,18A2.5,2.5 0 0,0 19,15.5A2.5,2.5 0 0,0 16.5,13Z"/></svg></div><div class="message-content"><div class="message-text">Hi admin! I'm your AI banking assistant. I can help you with account inquiries, balance checks, and transaction history.</div><div class="message-time" id="initialTime"></div></div></div></div>
            <div class="chat-input"><div class="input-container"><input type="text" id="chatMessageInput" placeholder="Type your message..." autocomplete="off"><button id="sendChatBtn" onclick="sendChatMessage()" aria-label="Send message"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.4 20.4 20.85 12.92c.81-.35.81-1.49 0-1.84L3.4 3.6c-.66-.29-1.39.2-1.39.91L2 9.12c0 .5.37.93.87.99L17 12 2.87 13.88c-.5.07-.87.49-.87.99l.01 4.61c0 .71.73 1.2 1.39.91Z"/></svg></button></div><div class="typing-indicator" id="typingIndicator" style="display:none;"><span>AI Support is typing</span><div class="typing-dots"><span></span><span></span><span></span></div></div></div>
        </div>
    </div>

    <script src="/static/dashboard.js"></script>
    <script>
        // Reveal animations
        document.addEventListener('DOMContentLoaded', function() {
            const obs = new IntersectionObserver((entries) => {
                entries.forEach((e, i) => { if (e.isIntersecting) { setTimeout(() => e.target.classList.add('revealed'), i * 60); obs.unobserve(e.target); } });
            }, { threshold: 0.05 });
            document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
        });

        function copyAccountNumber() {
            const acct = document.getElementById('account-number').textContent;
            navigator.clipboard.writeText(acct).then(() => {
                const btn = document.querySelector('.account-card-copy');
                btn.textContent = 'Copied!'; setTimeout(() => btn.textContent = 'Copy', 1500);
            });
        }

        function toggleSidePanel() {
            document.getElementById('sidebar').classList.toggle('active');
            document.getElementById('sidebarOverlay').classList.toggle('active');
        }

        function toggleTheme() {
            const html = document.documentElement;
            const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
            html.setAttribute('data-theme', next);
            localStorage.setItem('vb-theme', next);
        }
    </script>
</body>
</html>
</body>
</html>


```
