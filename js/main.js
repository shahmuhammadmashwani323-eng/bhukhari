/**
 * LexAdvocate & Associates (Bukhari Law Chambers)
 * Client-Side Application Controller
 */

document.addEventListener("DOMContentLoaded", () => {
  // 1. Initialize Brand & Config Data
  initBrandConfig();

  // 2. Initialize Navigation & Mobile Menu
  initNavigation();

  // 3. Populate Dynamic Practice Areas & Interactive Details Modal
  initPracticeAreas();

  // 4. Populate Senior Partners & Team
  initSeniorPartners();

  // 5. Populate Testimonials
  loadFeaturedTestimonials();

  // 6. Initialize Consultation Booking Form
  initBookingForm();

  // 7. Initialize Quick Inquiry Form
  initInquiryForm();

  // 8. Initialize FAQ Accordion
  initFaqAccordion();

  // 9. Floating Buttons & Scroll Listener
  initFloatingActions();

  // 10. Datepicker constraints (no past dates)
  initDateConstraints();
});

/* ==============================================================================
   1. BRAND CONFIG & DYNAMIC DATA
   ============================================================================== */
function initBrandConfig() {
  const cfg = window.FIRM_CONFIG;
  if (!cfg) return;

  // Set page titles and brand text elements
  document.querySelectorAll(".dyn-firm-name").forEach(el => el.textContent = cfg.firmName);
  document.querySelectorAll(".dyn-firm-subtitle").forEach(el => el.textContent = cfg.subtitle);
  document.querySelectorAll(".dyn-tagline").forEach(el => el.textContent = cfg.tagline);
  document.querySelectorAll(".dyn-phone").forEach(el => {
    el.textContent = cfg.contact.phone;
    if (el.tagName === "A") el.href = `tel:${cfg.contact.phoneClean}`;
  });
  document.querySelectorAll(".dyn-emergency").forEach(el => {
    el.textContent = cfg.contact.emergencyPhone;
    if (el.tagName === "A") el.href = `tel:${cfg.contact.phoneClean}`;
  });
  document.querySelectorAll(".dyn-email").forEach(el => {
    el.textContent = cfg.contact.email;
    if (el.tagName === "A") el.href = `mailto:${cfg.contact.email}`;
  });
  document.querySelectorAll(".dyn-address").forEach(el => el.textContent = cfg.contact.officeAddress);
  document.querySelectorAll(".dyn-hours-weekdays").forEach(el => el.textContent = cfg.contact.workingHours.weekdays);
  document.querySelectorAll(".dyn-hours-saturday").forEach(el => el.textContent = cfg.contact.workingHours.saturday);
  
  // WhatsApp links
  const waUrl = `https://wa.me/${cfg.contact.whatsapp}?text=${encodeURIComponent("Hello LexAdvocate & Associates, I would like to schedule an urgent legal consultation.")}`;
  document.querySelectorAll(".dyn-wa-link").forEach(el => el.href = waUrl);

  // Set stats
  if (document.getElementById("stat-exp")) document.getElementById("stat-exp").textContent = cfg.stats.yearsExperience;
  if (document.getElementById("stat-rate")) document.getElementById("stat-rate").textContent = cfg.stats.caseSuccessRate;
  if (document.getElementById("stat-cases")) document.getElementById("stat-cases").textContent = cfg.stats.totalConsultations;
  if (document.getElementById("stat-recovered")) document.getElementById("stat-recovered").textContent = cfg.stats.recoveredDamages;
}

/* ==============================================================================
   2. NAVIGATION & MOBILE MENU
   ============================================================================== */
function initNavigation() {
  const navbar = document.querySelector(".navbar");
  const menuToggle = document.getElementById("menuToggle");
  const navMenu = document.getElementById("navMenu");

  // Sticky Navbar Scroll Effect
  window.addEventListener("scroll", () => {
    if (window.scrollY > 40) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });

  // Mobile Menu Toggle
  if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", () => {
      navMenu.classList.toggle("open");
    });

    // Close menu when clicking any nav link
    navMenu.querySelectorAll(".nav-link").forEach(link => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("open");
      });
    });
  }
}

/* ==============================================================================
   3. PRACTICE AREAS DATA & INTERACTIVE DETAILS MODAL
   ============================================================================== */
const PRACTICE_AREAS_DATA = [
  {
    id: "corporate",
    title: "Corporate & Commercial Law",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>`,
    shortDesc: "Strategic counsel for mergers, cross-border commercial joint ventures, regulatory compliance, and high-stakes corporate arbitration.",
    tags: ["Mergers & Acquisitions", "Commercial Contracts", "Arbitration", "Company Law"],
    detailedServices: [
      "Cross-border Joint Venture & Shareholder Agreements",
      "SEC & Regulatory Compliance Audits",
      "Domestic and International Commercial Arbitration (LCIA / ICC)",
      "Corporate Restructuring & Liquidation Advisory",
      "FDI (Foreign Direct Investment) Structuring"
    ]
  },
  {
    id: "criminal",
    title: "Criminal Defense & Bail Matters",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`,
    shortDesc: "Unyielding defense in high-stakes white-collar inquiries, pre-arrest & post-arrest bail petitions before High Courts and Supreme Court.",
    tags: ["Pre-Arrest Bail", "White Collar Crime", "NAB / FIA Inquiries", "Trial Defense"],
    detailedServices: [
      "Emergency Pre-Arrest Bail (Section 498 CrPC) Petitions",
      "Post-Arrest Bail & Suspension of Sentence Appeals",
      "NAB (National Accountability) & Anti-Corruption Defense",
      "Financial Fraud, Money Laundering & Embezzlement Trials",
      "Habeas Corpus Writs for Unlawful Detention"
    ]
  },
  {
    id: "family",
    title: "Family & Matrimonial Law",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`,
    shortDesc: "Compassionate, discreet resolution of high-asset matrimonial splits, child custody, guardianship, and complex inheritance estates.",
    tags: ["Divorce & Khula", "Child Custody", "Inheritance Succession", "Family Trusts"],
    detailedServices: [
      "Discreet Divorce, Khula & Judicial Separation Proceedings",
      "Custody of Minors & International Visitation Agreements",
      "Inheritance Partition Deeds & Succession Certificates",
      "Dower, Maintenance & Alimony Litigation",
      "Private Family Mediation & Asset Settlements"
    ]
  },
  {
    id: "property",
    title: "Property & Real Estate Litigation",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`,
    shortDesc: "Fierce protection of land titles, anti-encroachment injunctions, commercial leasing disputes, and revenue record rectifications.",
    tags: ["Title Disputes", "Injunctions & Stays", "Land Acquisition", "Eviction Petitions"],
    detailedServices: [
      "Urgent Stay Orders against Unlawful Dispossession & Encroachment",
      "Title Due Diligence & Revenue Record Verification (Patwar / Fard)",
      "Specific Performance of Property Sale Agreements",
      "Government Land Acquisition Compensation Litigation",
      "Commercial Lease Drafting & Rent Tribunal Evictions"
    ]
  },
  {
    id: "civil",
    title: "Civil Litigation & Constitutional Writs",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`,
    shortDesc: "Appellate advocacy before High Courts and Supreme Court challenging arbitrary state actions, fundamental rights violations, and civil decrees.",
    tags: ["Article 199 Writs", "Supreme Court CPLA", "Civil Appeals", "Injunctions"],
    detailedServices: [
      "Constitutional Writ Petitions (Mandamus, Certiorari, Quo-Warranto)",
      "Supreme Court Petitions for Leave to Appeal (CPLA)",
      "Civil Revision, Regular First Appeals (RFA) & Execution Decrees",
      "Public Interest Litigation (PIL) on Statutory Overreach",
      "Declaratory Suits & Damages for Defamation"
    ]
  },
  {
    id: "labor",
    title: "Labor & Employment Law",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" y1="8" x2="19" y2="14"></line><line x1="22" y1="11" x2="16" y2="11"></line></svg>`,
    shortDesc: "Expert representation for corporate employers and senior executive personnel before Labor Appellate Tribunals and NIRC.",
    tags: ["Executive Termination", "Labor Tribunals", "NIRC Matters", "Employment Contracts"],
    detailedServices: [
      "Wrongful Termination & Grievance Petitions",
      "National Industrial Relations Commission (NIRC) Representation",
      "Non-Compete, Severance & Confidentiality Agreements",
      "Workplace Harassment Inquiry Procedures & Appeals",
      "Trade Union Collective Bargaining Negotiations"
    ]
  },
  {
    id: "cyber",
    title: "Cyber Crime & Digital Law",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>`,
    shortDesc: "Cutting-edge legal advisory covering PECA offenses, electronic data theft, online defamation, digital fraud, and tech IP infringement.",
    tags: ["PECA Complaints", "Data Theft", "Online Defamation", "Software Licensing"],
    detailedServices: [
      "Electronic Crimes Act (PECA) Investigations & High Court Bail",
      "Source Code Theft & Digital Intellectual Property Injunctions",
      "Social Media Blackmail, Defamation & Impersonation Proceedings",
      "Data Protection, GDPR & Cloud Compliance Audits",
      "Fintech, Cryptocurrency & Digital Escrow Advisory"
    ]
  },
  {
    id: "tax",
    title: "Banking, Tax & Financial Disputes",
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`,
    shortDesc: "Aggressive advocacy before Banking Courts and Appellate Tax Tribunals in financial recovery, loan restructuring, and tax demands.",
    tags: ["Banking Courts", "FBR Tax Appeals", "Loan Restructuring", "Customs Litigation"],
    detailedServices: [
      "Banking Tribunal Suits under Financial Institutions Recovery Ordinance",
      "Stay Orders against Arbitrary Tax Demands and Account Freezing",
      "Income Tax & Sales Tax Appellate Tribunal Hearings",
      "Corporate Debt Restructuring & Syndicated Financing",
      "Customs Duty Classification & Anti-Dumping Appeals"
    ]
  }
];

function initPracticeAreas() {
  const grid = document.getElementById("practiceAreasGrid");
  if (!grid) return;

  grid.innerHTML = PRACTICE_AREAS_DATA.map(item => `
    <div class="practice-card" onclick="openPracticeModal('${item.id}')">
      <div>
        <div class="practice-icon-box">
          ${item.icon}
        </div>
        <h3 class="practice-title">${item.title}</h3>
        <p class="practice-snippet">${item.shortDesc}</p>
        <div class="practice-tags">
          ${item.tags.map(t => `<span class="practice-tag">${t}</span>`).join("")}
        </div>
      </div>
      <div class="practice-link">
        Explore Legal Scope
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      </div>
    </div>
  `).join("");
}

// Global modal trigger for practice areas
window.openPracticeModal = function(id) {
  const item = PRACTICE_AREAS_DATA.find(p => p.id === id);
  if (!item) return;

  const modal = document.getElementById("practiceDetailModal");
  if (!modal) return;

  document.getElementById("modalPracticeTitle").textContent = item.title;
  document.getElementById("modalPracticeDesc").textContent = item.shortDesc;
  
  const servicesList = document.getElementById("modalPracticeServices");
  servicesList.innerHTML = item.detailedServices.map(s => `
    <li style="display: flex; align-items: flex-start; gap: 0.6rem; margin-bottom: 0.65rem; color: #cbd5e1; font-size: 0.92rem;">
      <svg style="color: var(--gold-light); width: 18px; height: 18px; flex-shrink: 0; margin-top: 2px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      <span>${s}</span>
    </li>
  `).join("");

  const bookBtn = document.getElementById("modalPracticeBookBtn");
  bookBtn.onclick = () => {
    closeModal("practiceDetailModal");
    // Scroll to booking form and auto-select
    const formSection = document.getElementById("booking");
    if (formSection) {
      formSection.scrollIntoView({ behavior: "smooth" });
      const select = document.getElementById("practice_area");
      if (select) {
        select.value = item.title;
      }
    }
  };

  modal.classList.add("active");
};

/* ==============================================================================
   4. SENIOR PARTNERS & LEADERSHIP
   ============================================================================== */
function initSeniorPartners() {
  const grid = document.getElementById("partnersGrid");
  const cfg = window.FIRM_CONFIG;
  if (!grid || !cfg || !cfg.seniorPartners) return;

  grid.innerHTML = cfg.seniorPartners.map(p => `
    <div class="partner-card">
      <div class="partner-photo-wrapper">
        ${p.photo ? `
          <img src="${p.photo}" alt="${p.name}" class="partner-photo-img" />
        ` : `
          <div class="partner-photo-placeholder">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
        `}
        <div class="partner-jurisdiction-badge">${p.experience.split(" ")[0]} Senior Bar</div>
      </div>
      <div class="partner-body">
        <h3 class="partner-name">${p.name}</h3>
        <p class="partner-role">${p.title}</p>
        <div class="partner-qualifications">${p.qualification}</div>
        <p class="partner-bio">${p.bio}</p>
        <div class="partner-meta">
          <span class="partner-exp">${p.experience}</span>
          <div style="display: flex; gap: 0.5rem;">
            ${p.phone ? `
              <a href="https://wa.me/${p.phoneClean}?text=${encodeURIComponent('Hello ' + p.name + ', I would like to consult regarding a legal matter.')}" target="_blank" class="btn btn-sm btn-gold" title="Direct WhatsApp with Advocate" style="padding: 0.5rem 0.8rem;">
                <svg style="width: 14px; height: 14px;" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z"></path></svg>
              </a>
            ` : ''}
            <a href="#booking" class="btn btn-sm btn-outline-gold" onclick="preselectLawyer('${p.name}')">Book Consultation</a>
          </div>
        </div>
      </div>
    </div>
  `).join("");
}

window.preselectLawyer = function(lawyerName) {
  const details = document.getElementById("case_details");
  if (details) {
    if (!details.value.includes(lawyerName)) {
      details.value = `[Preferred Counsel: ${lawyerName}]\n` + details.value;
    }
  }
};

/* ==============================================================================
   5. FEATURED TESTIMONIALS
   ============================================================================== */
async function loadFeaturedTestimonials() {
  const container = document.getElementById("testimonialsGrid");
  if (!container || !window.legalData) return;

  const result = await window.legalData.getTestimonials();
  const list = result.data || [];

  if (list.length === 0) {
    container.innerHTML = `<p style="text-align: center; color: var(--text-muted); grid-column: 1/-1;">Verified client case testimonials will appear here.</p>`;
    return;
  }

  container.innerHTML = list.map(t => {
    const initials = t.client_name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
    const stars = Array(t.rating || 5).fill(0).map(() => `
      <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
    `).join("");

    return `
      <div class="testimonial-card">
        <div>
          <div class="testimonial-stars">${stars}</div>
          <p class="testimonial-quote">"${t.review_text}"</p>
          ${t.case_outcome ? `<div class="testimonial-outcome">⚖️ Result: ${t.case_outcome}</div>` : ""}
        </div>
        <div class="testimonial-author-box">
          <div class="author-initials">${initials}</div>
          <div class="author-info">
            <h4>${t.client_name}</h4>
            <p>${t.company_or_designation || t.practice_area}</p>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

/* ==============================================================================
   6. CONSULTATION BOOKING FORM & 1-CLICK WHATSAPP GENERATION
   ============================================================================== */
function initBookingForm() {
  const form = document.getElementById("consultationForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;

    // Collect Data
    const formData = new FormData(form);
    const payload = {
      full_name: formData.get("full_name")?.trim(),
      phone: formData.get("phone")?.trim(),
      email: formData.get("email")?.trim(),
      practice_area: formData.get("practice_area"),
      consultation_mode: formData.get("consultation_mode") || "In-Chambers",
      preferred_date: formData.get("preferred_date") || null,
      preferred_time: formData.get("preferred_time") || "Morning (10:00 AM - 01:00 PM)",
      urgency: formData.get("urgency") || "Routine",
      case_details: formData.get("case_details")?.trim()
    };

    // Validation
    if (!payload.full_name || !payload.phone || !payload.practice_area) {
      showToast("Please fill in your name, contact phone, and practice area.", "error");
      return;
    }

    // Set Loading State
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg style="animation: spin 1s linear infinite; width: 18px; height: 18px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
      </svg>
      Securing Consultation Request...
    `;

    try {
      const result = await window.legalData.createConsultation(payload);
      
      if (result.success) {
        form.reset();
        openBookingSuccessModal(result.data);
        showToast("Consultation Request Successfully Logged!", "success");
      } else {
        showToast("Notice: " + (result.message || "Saved to chamber records."), "info");
      }
    } catch (err) {
      console.error("Booking error:", err);
      showToast("An error occurred. Please contact chambers via direct WhatsApp.", "error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  });
}

function openBookingSuccessModal(bookingData) {
  const modal = document.getElementById("bookingSuccessModal");
  if (!modal) return;

  const cfg = window.FIRM_CONFIG;
  const shortId = bookingData.id ? bookingData.id.slice(0, 8).toUpperCase() : "LEX-EXP";

  document.getElementById("successRefCode").textContent = `#${shortId}`;
  document.getElementById("successClientName").textContent = bookingData.full_name;
  document.getElementById("successPractice").textContent = bookingData.practice_area;
  document.getElementById("successSlot").textContent = `${bookingData.preferred_date || 'Earliest Available'} • ${bookingData.preferred_time}`;

  // Build 1-Click WhatsApp prefilled message
  const waNumber = cfg ? cfg.contact.whatsapp : "923337972445";
  const message = `*LEXADVOCATE CONSULTATION BOOKING*
Reference: #${shortId}
Client: ${bookingData.full_name}
Phone: ${bookingData.phone}
Practice Area: ${bookingData.practice_area}
Mode: ${bookingData.consultation_mode}
Preferred Slot: ${bookingData.preferred_date || 'Earliest Slot'} (${bookingData.preferred_time})
Urgency: ${bookingData.urgency}
Case Summary: ${bookingData.case_details ? bookingData.case_details.slice(0, 150) + '...' : 'Will discuss in chambers'}

Please confirm appointment schedule.`;

  const waBtn = document.getElementById("successWhatsAppBtn");
  if (waBtn) {
    waBtn.href = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
  }

  modal.classList.add("active");
}

/* ==============================================================================
   7. QUICK INQUIRY FORM
   ============================================================================== */
function initInquiryForm() {
  const form = document.getElementById("quickInquiryForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;

    const payload = {
      full_name: document.getElementById("inq_name")?.value.trim(),
      email: document.getElementById("inq_email")?.value.trim(),
      phone: document.getElementById("inq_phone")?.value.trim(),
      subject: document.getElementById("inq_subject")?.value.trim() || "General Legal Inquiry",
      message: document.getElementById("inq_message")?.value.trim()
    };

    if (!payload.full_name || !payload.email || !payload.message) {
      showToast("Please provide your name, email, and message.", "error");
      return;
    }

    btn.disabled = true;
    btn.innerHTML = "Dispatching to Chambers...";

    try {
      await window.legalData.createInquiry(payload);
      form.reset();
      showToast("Your inquiry has been received. Our chambers team will reply promptly.", "success");
    } catch (e) {
      showToast("Inquiry recorded in local registry.", "info");
    } finally {
      btn.disabled = false;
      btn.innerHTML = originalText;
    }
  });
}

/* ==============================================================================
   8. FAQ ACCORDION
   ============================================================================== */
function initFaqAccordion() {
  const items = document.querySelectorAll(".faq-item");
  items.forEach(item => {
    const btn = item.querySelector(".faq-question-btn");
    const pane = item.querySelector(".faq-answer-pane");

    btn.addEventListener("click", () => {
      const isActive = item.classList.contains("active");

      // Close all other items
      items.forEach(other => {
        other.classList.remove("active");
        const otherPane = other.querySelector(".faq-answer-pane");
        if (otherPane) otherPane.style.maxHeight = null;
      });

      // Toggle current
      if (!isActive) {
        item.classList.add("active");
        pane.style.maxHeight = pane.scrollHeight + "px";
      } else {
        item.classList.remove("active");
        pane.style.maxHeight = null;
      }
    });
  });
}

/* ==============================================================================
   9. FLOATING BUTTONS & TOASTS
   ============================================================================== */
function initFloatingActions() {
  const topBtn = document.getElementById("btnBackToTop");
  if (!topBtn) return;

  window.addEventListener("scroll", () => {
    if (window.scrollY > 400) {
      topBtn.style.display = "flex";
    } else {
      topBtn.style.display = "none";
    }
  });

  topBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

function initDateConstraints() {
  const dateInput = document.getElementById("preferred_date");
  if (dateInput) {
    const today = new Date().toISOString().split("T")[0];
    dateInput.min = today;
  }
}

// Global modal closer
window.closeModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove("active");
};

// Global Toast System
window.showToast = function(message, type = "info") {
  let container = document.getElementById("toastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  
  let icon = `⚖️`;
  if (type === "success") icon = `✅`;
  if (type === "error") icon = `⚠️`;

  toast.innerHTML = `<span>${icon}</span> <div>${message}</div>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(100%)";
    toast.style.transition = "all 0.3s ease";
    setTimeout(() => toast.remove(), 300);
  }, 4000);
};

// Client Testimonial Submission Trigger
window.openReviewModal = function() {
  const modal = document.getElementById("submitReviewModal");
  if (modal) modal.classList.add("active");
};

window.handleReviewSubmit = async function(e) {
  e.preventDefault();
  const form = document.getElementById("clientReviewForm");
  const payload = {
    client_name: document.getElementById("rev_name").value.trim(),
    company_or_designation: document.getElementById("rev_company").value.trim(),
    practice_area: document.getElementById("rev_practice").value,
    rating: document.getElementById("rev_rating").value,
    review_text: document.getElementById("rev_text").value.trim(),
    case_outcome: document.getElementById("rev_outcome").value.trim()
  };

  if (!payload.client_name || !payload.review_text) {
    showToast("Please enter your name and review remarks.", "error");
    return;
  }

  await window.legalData.createTestimonial(payload);
  form.reset();
  closeModal("submitReviewModal");
  showToast("Thank you. Your review has been submitted for chambers verification.", "success");
  loadFeaturedTestimonials();
};
