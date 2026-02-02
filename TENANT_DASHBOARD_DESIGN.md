# Tenant Dashboard Design - MVP Specification

## 🎯 Design Philosophy

**Principle**: A tenant should login and complete their FIRST KYC verification within 10 minutes without reading documentation.

**Core Values**:
- Simplicity over features
- Progress over perfection
- Clarity over complexity
- India-focused KYC workflows

---

## 📊 PART 1: TENANT DASHBOARD LAYOUT

### Overall Structure

```
┌─────────────────────────────────────────────────────────┐
│ Callvia Certo | Company Name | Settings | Logout        │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 📊 DASHBOARD                                             │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ Verifications│  │ Successful   │  │ This Month   │   │
│  │     142      │  │    138       │  │    12 used   │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  🚀 QUICK ACTIONS                                   │ │
│  │  ┌──────────────────┐  ┌──────────────────┐        │ │
│  │  │ + Start New      │  │ 📋 Bulk Upload  │        │ │
│  │  │   Verification   │  │ (CSV)           │        │ │
│  │  └──────────────────┘  └──────────────────┘        │ │
│  │                                                     │ │
│  │  ┌──────────────────┐  ┌──────────────────┐        │ │
│  │  │ 📊 View Reports  │  │ 📜 Audit Logs    │        │ │
│  │  │ & History        │  │ (Consent Trail)  │        │ │
│  │  └──────────────────┘  └──────────────────┘        │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  ✅ ENABLED SERVICES (Ready to Use)                 │ │
│  │                                                     │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │ │
│  │  │ 🔐 Aadhaar  │  │ 🆔 PAN      │  │ 🏦 Bank     │ │ │
│  │  │ OTP         │  │ Verification│  │ Account     │ │ │
│  │  │ Verification│  │             │  │ Verification│ │ │
│  │  │             │  │             │  │             │ │ │
│  │  │ ✅ Ready    │  │ ✅ Ready    │  │ ✅ Ready    │ │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘ │ │
│  │                                                     │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │ │
│  │  │ 📄 Basic    │  │ 🎯 Risk     │  │ 📦 Bulk KYC │ │ │
│  │  │ Risk Result │  │ Assessment  │  │ (CSV Upload)│ │ │
│  │  │             │  │             │  │             │ │ │
│  │  │ ✅ Ready    │  │ ✅ Ready    │  │ ✅ Ready    │ │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘ │ │
│  │                                                     │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                           │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  ⏳ COMING SOON (Q2-Q3 2026)                        │ │
│  │                                                     │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │ │
│  │  │ 🤳 Face     │  │ 👁️ Liveness │  │ 🏢 GST      │ │ │
│  │  │ Match       │  │ Detection   │  │ Verification│ │ │
│  │  │             │  │             │  │             │ │ │
│  │  │ ⏳ Q2 2026  │  │ ⏳ Q2 2026  │  │ ⏳ Q3 2026  │ │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘ │ │
│  │                                                     │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │ │
│  │  │ 🏛️ MCA      │  │ 🎥 Video    │  │ ⚠️ AML /    │ │ │
│  │  │ Company     │  │ KYC         │  │ Risk Score  │ │ │
│  │  │             │  │             │  │             │ │ │
│  │  │ ⏳ Q3 2026  │  │ ⏳ Q3 2026  │  │ ⏳ Q4 2026  │ │ │
│  │  └─────────────┘  └─────────────┘  └─────────────┘ │ │
│  │                                                     │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### Section Breakdown

#### A) Summary Cards (Top)
Show at-a-glance usage:

| Card | Shows | Purpose |
|------|-------|---------|
| **Total Verifications** | 142 | Lifetime count of all verifications |
| **Successful** | 138 (97%) | Green badge, shows success rate |
| **This Month** | 12 / 100 used | Progress bar, quota indicator |
| **Account Status** | Active | Green checkmark, subscription status |

**Design Notes**:
- Use large numbers (easy to scan)
- Color coding: Green = Good, Yellow = Warning, Red = Issue
- No hover details needed (keep simple)
- Responsive: Stack vertically on mobile

---

#### B) Quick Actions (Primary CTA)

Four large buttons for the most common tasks:

| Action | Icon | Purpose | Flow |
|--------|------|---------|------|
| **+ Start New Verification** | 🚀 | Begin single verification | Opens verification wizard |
| **📋 Bulk Upload (CSV)** | 📦 | Upload multiple records | Opens bulk upload modal |
| **📊 View Reports** | 📊 | See history & results | Opens reports/history page |
| **📜 Audit & Consent** | 📜 | View compliance logs | Opens consent/audit log viewer |

**Design Notes**:
- Large touch targets (44px minimum on mobile)
- Clear labels with icons
- "Start New Verification" should be the primary (most prominent color)
- All are always enabled for MVP

---

#### C) Enabled Services Section

**6 Service Cards - All Clickable & Fully Functional**

Cards should show:
- Service icon
- Service name
- Brief description (1 line)
- ✅ Ready badge (green)
- Click action (leads to service page)

**MVP Enabled Services**:

1. **🔐 Aadhaar OTP Verification**
   - Desc: "Verify resident identity via Aadhaar OTP"
   - Leads to: Aadhaar verification flow
   - Features: OTP, number masking, consent capture

2. **🆔 PAN Verification**
   - Desc: "Verify PAN and fetch name, DOB"
   - Leads to: PAN entry & verification
   - Features: Real-time validation, data extraction

3. **🏦 Bank Account Verification**
   - Desc: "Verify bank account via NEFT/IMPS"
   - Leads to: Bank account verification flow
   - Features: Account number, IFSC, penny-drop

4. **📄 Basic Risk Assessment**
   - Desc: "Quick pass/review/fail decision"
   - Leads to: Risk rules configuration
   - Features: Show pass/fail logic, manual override

5. **📦 Bulk KYC (CSV)**
   - Desc: "Verify multiple customers in batch"
   - Leads to: CSV upload & processing
   - Features: Template download, status tracking, export results

6. **🎯 Consent & Audit Logs**
   - Desc: "View all customer consents & audit trail"
   - Leads to: Compliance dashboard
   - Features: Consent timestamps, user actions, data exports

---

#### D) Coming Soon Services Section

**6 Service Cards - All Disabled, Non-Clickable**

Cards should show:
- Service icon (grayed out)
- Service name
- Brief description (1 line)
- ⏳ Coming Soon badge with date
- Cursor: not-allowed
- Tooltip: "Available in Q2 2026"

**Coming Soon Services** (in priority order):

| Service | Expected | Why Later | Features |
|---------|----------|-----------|----------|
| 🤳 Face Match | Q2 2026 | Biometric vendor integration needed | Photo verification, matching algo |
| 👁️ Liveness Detection | Q2 2026 | Vendor integration + testing | Live proof of life |
| 🏢 GST Verification | Q3 2026 | GST portal integration | Business entity verification |
| 🏛️ MCA / Company | Q3 2026 | MCA portal scraping | Corporate KYC |
| 🎥 Video KYC | Q3 2026 | Recording + compliance setup | Full video verification |
| ⚠️ Advanced AML | Q4 2026 | Sanctions list + ML setup | Risk scoring & PEP checks |

**Design Notes for Disabled Cards**:
- Use 40% opacity / grayscale
- Cursor: `not-allowed`
- On hover: Show tooltip "Coming in Q2 2026"
- No click handler attached
- Badge is clickable to show roadmap modal (optional)

---

## 👥 PART 2: MVP SERVICES SPECIFICATION

### Service States

Each service exists in one of 3 states:

```
STATE 1: ✅ ENABLED
├─ Fully functional
├─ All APIs tested
├─ Customer-ready
├─ Clickable with full flow
└─ Shows completion metrics

STATE 2: ⏳ COMING SOON
├─ Partially built
├─ Under QA/testing
├─ Not available for customers
├─ Non-clickable
├─ Shows expected launch date
└─ Optional: "Notify me" button

STATE 3: 🔒 LOCKED (Future)
├─ Planned but not started
├─ Enterprise feature (future phases)
├─ Shows plan tier requirement
└─ Non-clickable
```

### Enabled Services - Details

#### 1️⃣ Aadhaar OTP Verification

**What it does**:
- User enters 12-digit Aadhaar number
- System sends OTP to registered mobile
- User enters OTP
- Returns: Name, DOB, Gender (if available)

**Customer Flow**:
```
Customer enters 12-digit Aadhaar
         ↓
Request OTP sent to mobile registered with Aadhaar
         ↓
Customer enters 6-digit OTP
         ↓
✅ Verification success
  - Name: Shown
  - DOB: Shown
  - Gender: Shown
  - Status: VERIFIED
         ↓
Auto-save to customer record
```

**UI Elements**:
- Input field: Aadhaar number (masked display)
- Timer: OTP countdown (5 minutes)
- Resend OTP button (after 30s)
- Status badges: Pending → Success/Failed

**Error Handling**:
- Invalid Aadhaar format → "Enter valid 12-digit number"
- OTP expired → "OTP expired. Resend new OTP"
- Invalid OTP → "Incorrect OTP. Try again" (3 attempts max)
- API timeout → "Please try again" (with retry)

---

#### 2️⃣ PAN Verification

**What it does**:
- User enters 10-character PAN
- System validates against IT database
- Returns: Name, DOB, Gender (if available)

**Customer Flow**:
```
Customer enters 10-char PAN
         ↓
Real-time validation (format check)
         ↓
Query IT database
         ↓
✅ Match found
  - Name: Shown
  - Status: VERIFIED
         ↓
Auto-save to customer record
```

**UI Elements**:
- Input field: PAN (auto-uppercase)
- Real-time validation: Format feedback
- Status badge: Pending → Success/Failed
- Match confidence: "Matched 95%"

**Error Handling**:
- Invalid format → "PAN must be 10 characters (e.g., ABCDE1234F)"
- Not found in DB → "PAN not found. Please verify"
- Mismatch with name → "Warning: Name doesn't match. Review manually"

---

#### 3️⃣ Bank Account Verification

**What it does**:
- User enters account number, IFSC, account holder name
- System initiates penny-drop (tiny amount transfer)
- Bank confirms account validity
- Returns: Account holder name, account status

**Customer Flow**:
```
Customer enters:
  - Account number
  - IFSC code
  - Account holder name
         ↓
System initiates ₹1 transfer (penny-drop)
         ↓
Bank confirms receipt (takes 5-10 mins)
         ↓
✅ Account verified
  - Status: VERIFIED
  - Account name: Shown
  - Match: Yes/No/Review
         ↓
Auto-save to customer record
```

**UI Elements**:
- Input fields: Account number, IFSC, Holder name
- Status: Pending → Confirmed/Failed
- Wait message: "Checking with bank..."
- Reason if failed: "Account inactive" / "Name mismatch"

**Error Handling**:
- Invalid IFSC → "IFSC code not found. Please check"
- Invalid account format → "Enter valid account number for the bank"
- Name mismatch → "Account holder name doesn't match. Review"
- Account inactive → "Account not active for fund transfer"

---

#### 4️⃣ Basic Risk Assessment

**What it does**:
- System evaluates verification data
- Shows simple result: PASS / REVIEW / FAIL
- Reason displayed in simple language

**Decision Logic** (MVP):
```
IF all verifications successful AND no warnings
  → PASS (Green)
  
ELSE IF one verification missing OR name mismatch
  → REVIEW (Yellow - manual check needed)
  
ELSE IF verification failed OR data missing
  → FAIL (Red)
```

**Display**:
```
Risk Assessment Result

Status: ✅ PASS
Score: Low Risk

Details:
  ✅ Aadhaar verified
  ✅ PAN verified
  ✅ Bank account verified
  ✅ No warnings

Recommendation: Proceed with onboarding
```

**Action buttons**:
- "Accept & Onboard" (if PASS)
- "Request More Info" (if REVIEW)
- "Reject" (if FAIL, with reason)

---

#### 5️⃣ Bulk KYC (CSV Upload)

**What it does**:
- Tenant uploads CSV with customer data
- System processes each row asynchronously
- Returns status report (success/failure per row)

**CSV Template Format**:
```
customer_id,name,aadhaar,pan,bank_account,bank_ifsc
CUST001,John Doe,999999999999,ABCDE1234F,1234567890123,HDFC0000001
CUST002,Jane Smith,888888888888,XYZAB5678C,9876543210987,ICIC0000001
CUST003,Bob Johnson,777777777777,MNOPQ9012D,5555555555555,AXIS0000001
```

**Customer Flow**:
```
Click "Bulk Upload"
         ↓
Download template (optional)
         ↓
Upload CSV file
         ↓
System validates file
  - Check column names
  - Check row format
  - Preview first 5 rows
         ↓
Click "Confirm & Process"
         ↓
Processing starts (background job)
  - Status: 50% Complete
  - Verified: 50/100
  - Failed: 0/100
         ↓
Notification when complete
  - Email: "100 customers processed"
  - Report: Available for download
         ↓
Export results as CSV
```

**Result Report CSV**:
```
customer_id,name,aadhaar_status,pan_status,bank_status,overall_status,risk_score
CUST001,John Doe,VERIFIED,VERIFIED,VERIFIED,PASS,Low
CUST002,Jane Smith,VERIFIED,FAILED,PENDING,REVIEW,Medium
CUST003,Bob Johnson,FAILED,-,-,FAIL,High
```

**UI Elements**:
- Drag-drop area for CSV upload
- File validation feedback
- Preview table (first 5 rows)
- Progress bar (during processing)
- Results table (after processing)
- Export results button

**Error Handling**:
- Invalid file format → "Please upload a CSV file"
- Missing columns → "Missing required column: aadhaar"
- Invalid data → "Row 3: Invalid Aadhaar number"
- Quota exceeded → "You've used 100 of 100 verifications this month"

---

#### 6️⃣ Consent & Audit Logs

**What it does**:
- Shows all customer consents captured
- Shows all actions in audit trail
- Proof of compliance & transparency

**Consent Log Shows**:
```
Customer: John Doe (CUST001)
Date: Feb 2, 2026 10:15 AM

Consent Type: KYC Data Collection
Status: ✅ ACCEPTED
Consent Text: "I consent to Callvia Certo collecting my Aadhaar data for verification"
IP Address: 203.0.113.45
Device: Chrome, macOS
Signature: Digital (timestamp-based)
```

**Audit Log Shows**:
```
Date: Feb 2, 2026 10:15 AM
Action: Aadhaar OTP sent
User: tenant-admin@company.com
Customer: John Doe (CUST001)
Result: Success
Status Code: 200
IP: 203.0.113.45
Details: OTP sent to XXXXXXX9999
```

**UI Elements**:
- Filter by: Date range, Customer, Action type, Status
- Columns: Date, Customer, Action, User, Status, IP, Details
- Pagination: 50 records per page
- Export: CSV/PDF download for compliance

**Features**:
- Search by customer name/ID
- Sort by date (newest first)
- Compliance report generation
- Audit trail watermarking (tamper-proof)

---

## ⏳ PART 3: COMING SOON SERVICES UX

### Design Pattern for Disabled Cards

**Visual State**:
```
┌──────────────────────────────┐
│ 🤳 Face Match                │
│ (40% opacity, grayscale)     │
│                              │
│ Verify customer identity     │
│ via facial recognition       │
│                              │
│ ⏳ Coming in Q2 2026         │
│                              │
│ [Not Clickable]              │
│ Cursor: not-allowed          │
└──────────────────────────────┘

On Hover:
┌──────────────────────────────┐
│ Tooltip: "Available in Q2"   │
│                              │
│ [Optional: "Notify Me" btn]  │
└──────────────────────────────┘
```

### Coming Soon Services - Brief Details

| Service | When | Why | What's Needed |
|---------|------|-----|---------------|
| **🤳 Face Match** | Q2 2026 | Vendor integration + testing | CloudWalk / NeoFace API, Liveness detection |
| **👁️ Liveness Detection** | Q2 2026 | Video recording + QA | Recording infrastructure, FPS checking |
| **🏢 GST Verification** | Q3 2026 | Portal integration | GST portal crawler, data mapping |
| **🏛️ MCA / Company** | Q3 2026 | Corporate database access | MCA API integration, data extraction |
| **🎥 Video KYC** | Q3 2026 | Compliance + recording | Video hosting, consent management |
| **⚠️ Advanced AML** | Q4 2026 | Sanctions list + ML | Sanctions database, risk scoring algo |

---

## 🎯 PART 4: VERIFICATION FLOW UX (Tenant Side)

### User Journey - First Time Setup

```
STEP 1: TENANT LOGS IN
└─ Sees dashboard with 6 enabled services
└─ Sees "Start New Verification" button (primary)

STEP 2: CLICK "START NEW VERIFICATION"
└─ Opens wizard modal/page
└─ Headline: "Create New Verification"

STEP 3: ENTER CUSTOMER DETAILS
Form shows:
  □ Customer Name (text)
  □ Phone Number (10 digits)
  □ Email (optional)
  □ Verification Type (dropdown)
    - Aadhaar + PAN + Bank (Most Common - pre-selected)
    - Aadhaar Only
    - PAN Only
    - Bank Only
  □ Consent checkbox (required)
    "I have obtained customer consent for KYC verification"

STEP 4: CLICK "START VERIFICATION"
└─ System creates customer record
└─ Saves to Firestore
└─ Generates unique verification ID (e.g., VER-202602-00001)

STEP 5: VERIFICATION FLOW BEGINS
└─ Heading: "Verification ID: VER-202602-00001"
└─ Shows progress: Step 1/3
└─ Shows which steps remaining:
   ✅ Step 1: Aadhaar (In Progress)
   ⏳ Step 2: PAN (Pending)
   ⏳ Step 3: Bank (Pending)

STEP 6: AADHAAR VERIFICATION
Form shows:
  □ Aadhaar Number (12 digits, masked display)
  Button: "Send OTP"

System:
  - Validates Aadhaar format
  - Sends OTP to registered mobile
  - Shows: "OTP sent to XXXXXXX9999"
  - Countdown timer (5 minutes)

User:
  - Enters 6-digit OTP
  - Click "Verify"

Result:
  ✅ Success: Name, DOB, Gender shown
  └─ Auto-advances to Step 2
  
  OR
  
  ❌ Failed: Error message shown
  └─ Allows retry (3 attempts max)

STEP 7: PAN VERIFICATION
Form shows:
  □ PAN (10 characters, auto-uppercase)
  Button: "Verify"

System:
  - Real-time validation feedback
  - Queries IT database
  - Shows match result

User:
  - Enters PAN
  - System auto-verifies or manual "Verify" button

Result:
  ✅ Success: Name, DOB shown
  └─ Auto-advances to Step 3
  
  ⚠️ Warning: "Name mismatch - please review"
  └─ Allow override or correct
  
  ❌ Failed: "PAN not found"
  └─ Option to retry or skip

STEP 8: BANK ACCOUNT VERIFICATION
Form shows:
  □ Account Number (format validated per IFSC)
  □ IFSC Code (with autocomplete dropdown)
  □ Account Holder Name
  Button: "Verify Account"

System:
  - Validates all fields
  - Initiates penny-drop transfer (₹1)
  - Shows: "Checking with bank..."
  - Waits 5-10 minutes

User:
  - Sees progress message
  - Can close page (will receive email update)

Result:
  ✅ Success: Account confirmed
  └─ Auto-advances to results
  
  ⏳ Pending: "Still checking with bank..."
  └─ Retry button available
  
  ❌ Failed: Reason shown
  └─ Option to manually override (with note)

STEP 9: VERIFICATION COMPLETE - RESULTS
Heading: "Verification Complete ✅"

Shows:
  ┌─────────────────────────────┐
  │ Customer: John Doe          │
  │ Verification ID: VER...001  │
  │ Status: ✅ VERIFIED         │
  │ Risk Score: Low Risk        │
  │ Date: Feb 2, 2026 10:15 AM  │
  └─────────────────────────────┘

  Details Tab:
  ├─ Aadhaar: ✅ Verified
  │  └─ Name: John Doe
  │  └─ DOB: Jan 15, 1990
  │  └─ Gender: Male
  │
  ├─ PAN: ✅ Verified
  │  └─ Name: JOHN DOE
  │  └─ Status: Active
  │
  └─ Bank: ✅ Verified
     └─ Account: ****5678
     └─ Bank: HDFC Bank
     └─ Status: Active

  Consent Tab:
  ├─ Aadhaar: ✅ Accepted (Feb 2, 10:15 AM)
  ├─ PAN: ✅ Accepted
  └─ Bank: ✅ Accepted

  Audit Tab:
  ├─ Feb 2, 10:00 - Verification started
  ├─ Feb 2, 10:02 - Aadhaar OTP sent
  ├─ Feb 2, 10:03 - Aadhaar verified
  ├─ Feb 2, 10:04 - PAN verified
  ├─ Feb 2, 10:05 - Bank verification started
  └─ Feb 2, 10:15 - Bank verified

Buttons:
  [Approve & Onboard]  [Request More Info]  [Download Report]

STEP 10: CONFIRMATION
Success message:
  "✅ Customer John Doe verified and ready for onboarding!"

Next options:
  [ Create another verification ]
  [ View all verifications ]
  [ Download report ]
```

### Alternative Flow - Bulk Verification

```
STEP 1: CLICK "BULK UPLOAD (CSV)"
└─ Modal opens: "Upload Customer List"

STEP 2: DOWNLOAD TEMPLATE (Optional)
└─ User downloads CSV template
└─ Opens in Excel
└─ Fills in 100 customer rows
└─ Saves file

STEP 3: UPLOAD CSV
└─ Drag-drop or click to select file
└─ Shows file name: "customers_batch1.csv"
└─ Shows: "100 rows found"

STEP 4: PREVIEW & VALIDATE
System shows:
  Preview of first 5 rows:
  ┌────────────┬──────────┬───────────┐
  │ Customer ID│ Name     │ Aadhaar   │
  ├────────────┼──────────┼───────────┤
  │ CUST001    │ John Doe │ 9999999999│
  │ CUST002    │ Jane Doe │ 8888888888│
  └────────────┴──────────┴───────────┘

  Validation result:
  ✅ 100 rows valid
  ✅ All required columns present
  ✅ No duplicate customer IDs
  ✅ Quota check: 100/100 available this month

STEP 5: CONFIRM UPLOAD
Checkbox: "I have customer consent for bulk verification"
Button: "Start Processing"

STEP 6: PROCESSING STARTED
Progress shown:
  Status: Processing 100 customers
  Completed: 0/100
  Failed: 0/100
  In Progress: 5/100 (parallel)
  
  Progress Bar: ████░░░░░░ 40%
  
  Estimated time: 15 minutes remaining

User can:
  [ Close page ] - Processing continues in background
  [ Stay on page ] - Watch progress in real-time

STEP 7: COMPLETION NOTIFICATION
Email sent: "Bulk verification complete - 98/100 passed"

Dashboard shows:
  New card in quick actions area:
  "📊 Latest Batch Results"
  └─ Success: 98 (98%)
  └─ Review: 2 (2%)
  └─ Failed: 0 (0%)
  └─ [ View Results ]

STEP 8: VIEW RESULTS
Results page shows:
  ┌──────────────────────────────────────────────┐
  │ Batch: customers_batch1 (Feb 2, 2026)       │
  │ Total: 100 customers                        │
  │ Status: Complete (98% success)              │
  │                                              │
  │ Results:                                     │
  │  ✅ Pass: 98 (Ready for onboarding)         │
  │  ⚠️ Review: 2 (Manual check needed)         │
  │  ❌ Failed: 0                               │
  │                                              │
  │ [ Download CSV Report ]                    │
  │ [ View Individual Records ]                │
  │ [ Approve All & Onboard ]                  │
  └──────────────────────────────────────────────┘

  Results table:
  ┌────────┬──────────┬────────┬────────┬────────┐
  │ Cust ID│ Name     │ Aadhar │ PAN    │ Bank   │
  ├────────┼──────────┼────────┼────────┼────────┤
  │ CUST001│ John Doe │ ✅     │ ✅     │ ✅     │
  │ CUST002│ Jane Doe │ ✅     │ ⚠️     │ ✅     │ (Name mismatch)
  │ CUST003│ Bob Smith│ ✅     │ ✅     │ ✅     │
  │ ...    │ ...      │ ...    │ ...    │ ...    │
  └────────┴──────────┴────────┴────────┴────────┘

STEP 9: TAKE ACTION
Options per result:
  - ✅ Pass: Approve button → Auto-onboard
  - ⚠️ Review: Manual review → Approve/Reject
  - ❌ Failed: Reason shown → Can retry or reject

STEP 10: COMPLETION
Success message:
  "✅ 100 customers processed!"
  "📧 Onboarding emails sent to 98 customers"
  
  [ Create another batch ] [ View dashboard ]
```

---

## ⚙️ PART 5: SETTINGS & API (MINIMAL)

### Settings Page Structure

```
┌────────────────────────────────────┐
│ SETTINGS                            │
├────────────────────────────────────┤
│                                    │
│ 📋 Company Profile                 │
│ ├─ Company Name                    │
│ ├─ Company Registration #          │
│ ├─ Contact Email                   │
│ ├─ Contact Phone                   │
│ └─ [ Edit Profile ]                │
│                                    │
│ 🔑 API Keys                        │
│ ├─ API Key: sk_live_abc12345xyz   │
│ ├─ Status: ✅ Active               │
│ ├─ Created: Feb 1, 2026            │
│ ├─ Last used: Feb 2, 2026 10:15    │
│ ├─ [ Copy ]  [ Regenerate ]        │
│ └─ Webhook URL:                    │
│    ├─ URL: https://your-company.com/webhook
│    ├─ [ Edit ]  [ Test ]           │
│    └─ Last event: Feb 2, 10:15     │
│                                    │
│ 💳 Billing & Usage                 │
│ ├─ Plan: Professional ($299/mo)   │
│ ├─ Billing Cycle: Feb 1 - Feb 28   │
│ ├─ Verifications Used: 42 / 100    │
│ ├─ [ Upgrade Plan ]  [ Add Credits]│
│ └─ Next Invoice: March 1, 2026     │
│                                    │
│ 👥 Team Members                    │
│ ├─ Owner: Raj Singh (raj@...)      │
│ ├─ Admin: Priya Sharma (priya@...) │
│ ├─ [ Remove ]  [ Change Role ]     │
│ ├─ [ Invite New Member ]           │
│ └─ (More: 2 additional members)   │
│                                    │
│ 🔔 Notifications                   │
│ ├─ Email alerts: ✅ On             │
│ ├─ Verification complete: ✅       │
│ ├─ Monthly report: ✅              │
│ ├─ [ Configure ]                   │
│ └─ [ Edit Recipient ]              │
│                                    │
│ 🔐 Security                        │
│ ├─ Password last changed: 30 days  │
│ ├─ 2FA: ✅ Enabled                 │
│ ├─ [ Change Password ]             │
│ ├─ [ Manage 2FA ]                  │
│ └─ [ View Login History ]          │
│                                    │
│ ⚠️ Danger Zone                     │
│ ├─ [ Delete Account ]              │
│ └─ (Requires confirmation)         │
│                                    │
└────────────────────────────────────┘
```

### Sections Breakdown

#### 1) Company Profile

**What's shown**:
- Company name (editable)
- Registration number (read-only after setup)
- Contact email (editable)
- Contact phone (editable)
- Logo (optional, for branding)

**Actions**:
- Edit button opens form
- All changes require password confirmation
- Changes logged in audit trail

---

#### 2) API Keys

**What's shown**:
- API key (masked, e.g., `sk_live_****xyz`)
- Status: Active / Inactive
- Created date
- Last used: Timestamp
- Webhook URL (with status indicator)
- Last webhook event timestamp

**Actions**:
- [ Copy ] - Copy full key to clipboard
- [ Regenerate ] - Create new key (old one invalidated)
- [ Edit Webhook URL ] - Update webhook endpoint
- [ Test Webhook ] - Send test event
- [ Disable API Key ] - Temporarily disable

**Security Notes**:
- API key shown only once (on creation or first view)
- Can't view full key after creation (only masked)
- Regenerate requires password confirmation
- All changes logged

---

#### 3) Billing & Usage

**What's shown**:
- Current plan (name, price, billing cycle)
- Verifications used vs quota (progress bar)
- Next billing date
- Outstanding invoices (if any)
- Payment method on file

**Actions**:
- [ Upgrade Plan ] - Opens plan comparison
- [ Add Credits ] - Purchase additional verifications
- [ Download Invoice ] - PDF invoice
- [ Change Payment Method ] - Update card

**Billing Plans** (MVP options):
- **Starter**: 100 verifications/month, $99/mo
- **Professional**: 500 verifications/month, $299/mo
- **Enterprise**: Custom pricing (contact sales)

---

#### 4) Team Members

**What's shown**:
- List of authorized users
- Role: Owner / Admin / Viewer
- Email address
- Last login date

**Actions**:
- [ Invite New Member ] - Send invite email
- [ Remove ] - Revoke access
- [ Change Role ] - Upgrade/downgrade permissions
- [ Resend Invite ] - Resend pending invite

**Roles** (MVP, keep simple):
- **Owner**: Full access, can delete account
- **Admin**: Full access except account deletion
- **Viewer**: Read-only access to reports/logs

---

#### 5) Notifications

**What's shown**:
- Email notification preferences
- Checkboxes:
  - ✅ Verification complete notifications
  - ✅ Monthly usage report
  - ✅ Billing alerts (quota, failed payments)
  - ✅ Security alerts (password changed, 2FA)

**Actions**:
- Toggle each notification type
- [ Change Email Recipient ] - Send notifications to different email
- [ Configure Frequency ] - Daily / Weekly / Monthly

---

#### 6) Security

**What's shown**:
- Password last changed: "30 days ago"
- 2FA status: "✅ Enabled" or "❌ Disabled"
- Recent login attempts (last 5)
- Current sessions (devices logged in)

**Actions**:
- [ Change Password ] - Opens password change form
- [ Setup 2FA ] - QR code for authenticator app
- [ View Full Login History ] - All login attempts
- [ Logout All Devices ] - Sign out everywhere

---

#### 7) Danger Zone

**What's shown**:
- Delete account option (rarely used)

**Actions**:
- [ Delete Account ] - Opens confirmation dialog
- Requires:
  - Password re-entry
  - Email confirmation code
  - Shows what will be deleted (all data)
  - Cannot be undone

**Note**: Keep this section minimal and scary enough to prevent accidents.

---

## 📱 PART 6: RESPONSIVE DESIGN NOTES

### Mobile Optimization

**Dashboard on Mobile** (< 768px):
```
Service cards: Stack vertically (1 column)
Summary cards: Stack vertically
Quick actions: 2 buttons per row
Service sections: Scroll horizontally (carousel)
Coming soon cards: Swipeable
```

**Verification Flow on Mobile**:
```
Linear wizard (full screen)
One step per page
Large touch targets (min 44px)
Progress indicator at top
Back button prominent
No side-by-side forms
```

**Settings on Mobile**:
```
Accordion layout
Each section collapsible
Forms single column
Buttons full width
```

---

## 🎨 DESIGN SYSTEM (SIMPLE)

### Colors
- **Primary**: `#0066FF` (Blue - enabled, actions)
- **Success**: `#00B366` (Green - verified, pass)
- **Warning**: `#FF9900` (Orange - review, pending)
- **Error**: `#CC0000` (Red - failed, error)
- **Coming Soon**: `#CCCCCC` (Gray - disabled)
- **Background**: `#FFFFFF` (White)
- **Text**: `#333333` (Dark gray)

### Typography
- **Heading**: 28px, Bold (titles)
- **Subheading**: 18px, Bold (section headers)
- **Body**: 16px, Regular (form labels, descriptions)
- **Small**: 12px, Regular (timestamps, hints)

### Spacing
- **Section gaps**: 32px (vertical)
- **Card gaps**: 16px (horizontal)
- **Card padding**: 20px (internal)
- **Form field gaps**: 12px

### Buttons
- **Primary**: Blue background, white text, 44px height
- **Secondary**: Gray background, dark text, 44px height
- **Danger**: Red background, white text, 44px height
- **Disabled**: Gray background, gray text, cursor: not-allowed

### Forms
- **Field height**: 44px (mobile-friendly)
- **Border**: 1px solid `#CCCCCC`
- **Focus**: 2px solid `#0066FF`
- **Error**: 1px solid `#CC0000`

---

## ✅ MVP CHECKLIST

### Must Have (Blocking Release):
- [ ] Dashboard with 6 enabled service cards
- [ ] Dashboard with 6 coming-soon service cards
- [ ] Summary cards (Verifications, Success, Usage, Status)
- [ ] Quick action buttons (New, Bulk, Reports, Audit)
- [ ] Aadhaar OTP verification flow (end-to-end)
- [ ] PAN verification flow (end-to-end)
- [ ] Bank account verification flow (end-to-end)
- [ ] Bulk CSV upload and processing
- [ ] Risk assessment result display
- [ ] Consent & audit log viewer
- [ ] Settings page (API keys, webhook, billing, team)
- [ ] Mobile responsive design
- [ ] Error handling & retry logic

### Should Have (Nice to Have):
- [ ] Email notifications on completion
- [ ] Download PDF report
- [ ] Verification history/search
- [ ] Customizable risk rules
- [ ] Webhook event testing
- [ ] API documentation page
- [ ] Tenant onboarding tutorial

### Won't Have (Future Phases):
- [ ] Advanced AML/PEP checks
- [ ] Face biometrics
- [ ] Video KYC
- [ ] GST/MCA verification
- [ ] Admin impersonation
- [ ] Custom branding
- [ ] Advanced reporting/BI

---

## 🚀 IMPLEMENTATION PRIORITY

### Phase 1 (Week 1-2): Dashboard Layout
1. Create dashboard component
2. Add summary cards (hardcoded data for now)
3. Add quick action buttons
4. Create enabled/coming-soon service cards grid
5. Responsive design

### Phase 2 (Week 3-4): Single Verification Flow
1. Create verification wizard modal
2. Aadhaar OTP integration
3. PAN verification integration
4. Bank verification integration
5. Result display & action buttons

### Phase 3 (Week 5): Bulk Upload
1. CSV upload component
2. Validation logic
3. Background processing
4. Result report generation

### Phase 4 (Week 6): Settings & Additional Pages
1. Settings page components
2. API key display
3. Webhook configuration
4. Billing/usage display
5. Team management (basic)

### Phase 5 (Week 7): Polish & Testing
1. Error handling improvements
2. Loading states & skeletons
3. Mobile optimization
4. Performance testing
5. Cross-browser testing
6. Bug fixes & QA

---

## 🎯 SUCCESS METRICS (MVP)

A tenant has successfully experienced the MVP dashboard if they can:

✅ Login and see the dashboard within 2 seconds
✅ Understand which services are available vs coming soon
✅ Click "Start New Verification" and complete it within 5 minutes
✅ See clear pass/fail/review result
✅ Upload a CSV with 100 customers and see them processing
✅ Access API key from settings without confusion
✅ Understand their monthly usage quota

---

## 📝 NOTES FOR DEVELOPERS

### Component Structure (Suggested)

```
frontend/src/pages/
├── TenantDashboard.tsx          (Main page)
├── components/
│  ├── DashboardSummary.tsx       (Top 4 cards)
│  ├── QuickActions.tsx            (Action buttons)
│  ├── ServiceCard.tsx             (Enabled/Coming soon card)
│  ├── EnabledServicesGrid.tsx     (6 enabled cards)
│  ├── ComingSoonGrid.tsx          (6 disabled cards)
│  └── verifications/
│     ├── VerificationWizard.tsx   (Modal)
│     ├── AadhaarStep.tsx
│     ├── PanStep.tsx
│     ├── BankStep.tsx
│     ├── ResultsStep.tsx
│     └── BulkUpload.tsx
│
├── pages/Settings.tsx             (Settings page)
│  └── components/
│     ├── ApiKeysSection.tsx
│     ├── BillingSection.tsx
│     ├── TeamSection.tsx
│     └── SecuritySection.tsx
│
└── pages/Reports.tsx              (Reports/History)
   └── components/
      ├── VerificationHistory.tsx
      └── AuditLog.tsx
```

### State Management

Use React Context for:
- User/tenant info (from auth)
- Current verification workflow (wizard state)
- Bulk upload progress

Use API calls for:
- Fetching verification status
- Fetching audit logs
- Billing usage

### Error Boundaries

- Wrap each major section in error boundary
- Show user-friendly error messages
- Log to Sentry/analytics

### Analytics Events

Track:
- Dashboard page view
- Service card clicks (enabled vs coming-soon)
- Verification started
- Verification completed (pass/fail/review)
- Bulk upload initiated
- Settings updated

---

## 🎓 USER ONBOARDING COPY

### Dashboard First View
Heading: "Welcome to Callvia Certo 👋"
Subheading: "Your KYC verification platform"

Body: "Start verifying your customers instantly. Choose a service below and get results within minutes."

### Empty State (No Verifications)
Heading: "No verifications yet"
Body: "Click 'Start New Verification' to verify your first customer. It takes less than 5 minutes."

### Coming Soon Tooltip
"🔜 This feature is coming in [Month]. We'll notify you when it's available."

### First Verification Success
Popup: "🎉 Congratulations on your first verification! Next, try bulk uploading."

---

**END OF TENANT DASHBOARD DESIGN DOCUMENT**

This specification is ready for frontend implementation. All interactions are designed for simplicity and clarity, with MVP scope rigorously enforced.
