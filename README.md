# ⚖️ LexAdvocate & Associates (Bukhari Law Chambers)
### *Senior Advocates & Legal Consultants — Web Application & Case CRM*

A prestigious, production-ready, luxury law firm web application engineered with **HTML5, CSS3, Vanilla JavaScript**, and a **Supabase PostgreSQL** cloud backend. Designed with zero build steps, making it **100% statically hostable on GitHub Pages**.

---

## 🌟 Key Features

### 🏛️ 1. Brand Identity & Luxury Legal Aesthetic
- **Elite Color Palette:** Deep Midnight Navy (`#0b132b`, `#1c2541`), Imperial Legal Gold accents (`#c5a059`, `#dfb15b`), Crisp Parchment White (`#f8f9fa`), and Slate Grey.
- **Dignified Typography:** Google Fonts serif headings (`Cinzel` & `Playfair Display`) paired with clean sans-serif body (`Inter`).
- **Interactive Micro-Interactions:** Scales of justice emblems, hover glows, pulsing status badges, and smooth accordion transitions.
- **100% Mobile Responsive:** Fluid flexbox and grid layouts optimized for smartphones, tablets, and high-DPI desktop displays.

### 📜 2. Client-Facing Portal (`index.html`)
- **Authoritative Hero Section:** Clear jurisdictional badges (Supreme Court & High Court Bar Advocates), credibility stats (20+ Years, 98% Success Rate, 5,000+ Consultations), and quick evaluation CTAs.
- **8 Interactive Practice Areas:**
  1. Corporate & Commercial Law
  2. Criminal Defense & Bail Matters
  3. Family & Matrimonial Law (Divorce, Custody, Inheritance)
  4. Property & Real Estate Litigation
  5. Civil Litigation & Constitutional Writs
  6. Labor & Employment Law
  7. Cyber Crime & Digital Law (PECA)
  8. Banking, Tax & Financial Disputes
  *(Clicking any card opens a rich modal showing legal services scope with 1-click booking pre-selection)*
- **Smart Consultation Booking Engine:**
  - Validates client name, phone/WhatsApp, email, preferred date & time window, consultation mode (In-Chambers, Video Call, Phone Call), urgency level (Routine, Urgent 24h, Critical Court Matter), and case brief.
  - Inserts directly to Supabase `consultations` table with **automatic LocalStorage fallback**.
  - **1-Click WhatsApp Booking Confirmation Link:** Generates a prefilled, structured WhatsApp message for the client to confirm their appointment directly with chambers.
- **Senior Advocates & Leadership:** Led by Advocate Imran IB Abro (Senior Advocate High Court, Contact: `0333 7972445`), alongside Senior Supreme Court Advocates and London Barristers with Bar qualifications.
- **Case Results & Precedents:** Milestone victories ($3.2M arbitration award, emergency pre-arrest bail in <12h, land eviction decree, constitutional writs).
- **Verified Client Reviews & Review Submission:** Real client testimonials with star ratings, plus an interactive modal allowing clients to leave reviews.
- **Legal FAQs Accordion:** Answers covering urgency bail, overseas clients, retainers, and confidentiality.
- **Chambers Contact & Quick Inquiry Form:** Integrated inquiries submission connected to the database.
- **Floating Speed Actions:** Floating WhatsApp button with pulsing glow, direct call button, and back-to-top trigger.

### 🛡️ 3. Advocate CRM & Admin Portal (`admin.html`)
- **Passcode-Protected Security Gate:** Default passcode: `lawyer123` (customizable in `js/config.js`).
- **Real-Time KPI Counters:**
  - Total Consultations
  - New Pending Requests
  - Scheduled Consultations
  - Critical Court / 24h Urgent Matters
- **Interactive Case Pipeline:**
  - Search by client name, phone, or practice area.
  - Filter by Status (`New`, `Scheduled`, `Completed`, `Archived`).
  - Filter by Urgency (`Routine`, `Urgent 24h`, `Critical Court Matter`).
  - Change status directly inline.
- **1-Click Client Contact Shortcuts:**
  - 🟢 **WhatsApp:** Opens direct WhatsApp chat with prefilled message.
  - 📞 **Phone:** Launches immediate phone dialer.
  - ✉️ **Email:** Opens default mail client with prefilled subject.
  - 👁️ **Case Brief Modal:** View the client's full case brief and add/save private internal chamber notes.
  - 🗑️ **Delete / Dismiss:** Clean up test records.
- **Export to CSV:** Download all consultations and client records into an Excel-ready `.csv` file.
- **Inquiries Manager:** Review and mark contact form inquiries as responded.
- **Supabase Live Connection Settings Modal:** Input and test your Supabase URL & Anon Key directly from the UI without modifying source code.

---

## 📁 Project Directory Structure

```text
bukhari lay assosiate/
│
├── index.html               # Main public law firm website
├── admin.html               # Advocate CRM portal & case management dashboard
├── supabase-schema.sql      # PostgreSQL database schema, RLS policies & seed data
├── README.md                # Detailed documentation & setup guide
│
├── css/
│   ├── style.css            # Luxury legal theme styles (Navy & Imperial Gold)
│   └── admin.css            # Executive admin dashboard & CRM styling
│
└── js/
    ├── config.js            # Law firm metadata, phone numbers, partners & secrets
    ├── supabase-client.js   # Supabase v2 client wrapper with LocalStorage fallback
    ├── main.js              # Client-side form handlers, modals, animations, FAQs
    └── admin.js             # Admin authentication, KPIs, table filters, CSV exporter
```

---

## 🚀 Step-by-Step GitHub Pages Deployment (Zero Build Steps)

This project has **zero build steps** (no npm, no Webpack, no node_modules required). It runs entirely on native HTML5, modern CSS3, and ES6 Vanilla JavaScript.

### Method 1: Using Git Command Line
1. Open terminal inside the project directory:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: LexAdvocate & Associates Law Firm Website"
   ```
2. Create a new repository on your GitHub account (e.g. `lexadvocate-chambers`).
3. Link the remote and push:
   ```bash
   git remote add origin https://github.com/<YOUR-USERNAME>/<YOUR-REPO-NAME>.git
   git branch -M main
   git push -u origin main
   ```
4. **Enable GitHub Pages:**
   - Go to your repository on GitHub.
   - Click **Settings** ⚙️ → **Pages** (in the left sidebar).
   - Under **Build and deployment** > **Source**, select **Deploy from a branch**.
   - Select Branch: `main` and Folder: `/(root)`.
   - Click **Save**.
5. Your prestigious law firm website will be live in ~60 seconds at:
   `https://<YOUR-USERNAME>.github.io/<YOUR-REPO-NAME>/`

---

## 🗄️ Supabase PostgreSQL Setup (5 Minutes)

The website works immediately out of the box using **LocalStorage fallback mode** even before Supabase is connected. To connect to a live cloud database:

### Step 1: Create a Free Supabase Project
1. Visit [supabase.com](https://supabase.com) and create a free account.
2. Click **New Project**, choose a project name (e.g., `lexadvocate-db`) and database password.
3. Wait ~60 seconds for your database to provision.

### Step 2: Run the SQL Schema
1. In your Supabase dashboard, navigate to **SQL Editor** in the left sidebar.
2. Open the file [`supabase-schema.sql`](supabase-schema.sql) from this project.
3. Copy all lines and paste into the Supabase SQL Editor.
4. Click **Run** (or `Ctrl+Enter`).
5. This creates:
   - `consultations` table (with UUID primary keys and status constraints)
   - `inquiries` table
   - `testimonials` table
   - Proper performance indexes on `status`, `urgency`, and `created_at`
   - Row Level Security (RLS) policies allowing public client bookings and admin management
   - Pre-populated realistic seed data for immediate demonstration.

### Step 3: Connect to the Website
1. In your Supabase Project Settings, go to **Project Settings** ⚙️ → **API**.
2. Copy:
   - **Project URL** (e.g. `https://xyzabcdef.supabase.co`)
   - **Project API Keys** → `anon public` key
3. Open `admin.html` in your browser (default passcode: `lawyer123`).
4. Click the **"Supabase Setup"** button in the top navigation bar.
5. Paste your URL and Anon Key, then click **"Test Live Connection"**.
6. When verified, click **"Save & Connect"**.
7. The status badge will turn green: `🟢 Supabase Connected (Live)`.

*(Alternatively, you can paste your URL and Anon Key into `js/config.js` under `FIRM_CONFIG.supabase.defaultUrl` and `defaultAnonKey`)*.

---

## ⚙️ Customization & Configuration

All essential firm settings are centralized in [`js/config.js`](js/config.js):

| Setting | Location | Description |
| :--- | :--- | :--- |
| **Firm Name** | `FIRM_CONFIG.firmName` | Change to your firm name (e.g., "Bukhari Law Associates") |
| **Phone & WhatsApp** | `FIRM_CONFIG.contact.phone` / `whatsapp` | Official office numbers for direct 1-click calls and WhatsApp |
| **Emergency Hotline** | `FIRM_CONFIG.contact.emergencyPhone` | Round-the-clock urgent court bail contact |
| **Email & Chambers** | `FIRM_CONFIG.contact.email` / `officeAddress` | Official email address and physical office suite |
| **Senior Partners** | `FIRM_CONFIG.seniorPartners` | Add, edit, or remove partner names, degrees, and bios |
| **Admin Passcode** | `FIRM_CONFIG.admin.defaultPasscode` | Default: `lawyer123` |

---

## 🛡️ Security & Privacy Architecture
- **Statutory Attorney-Client Privilege:** Complies with confidentiality notices under the legal practitioners code of conduct.
- **Fail-Safe Offline Architecture:** If internet connectivity drops or Supabase rate-limits occur, all booking submissions automatically divert into browser `localStorage`, ensuring zero lost prospective clients.
- **No Build / Pure Web Standards:** Zero security vulnerabilities from stale npm packages or heavy dependencies.

---

## ⚖️ License
This project is open-source and customizable for legal practitioners, advocates, and law chambers.
Distributed under the MIT License.
