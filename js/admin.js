/**
 * LexAdvocate & Associates (Bukhari Law Chambers)
 * Admin Portal & Legal Case CRM Controller
 */

let allConsultations = [];
let allInquiries = [];
let currentFilter = {
  search: "",
  status: "all",
  urgency: "all"
};

document.addEventListener("DOMContentLoaded", () => {
  // Check Authentication Gate
  checkAuth();

  // Setup Login Form Listener
  initLoginForm();

  // Setup Search and Filters
  initFilterListeners();

  // Setup Tabs
  initTabs();

  // Supabase Connection Settings
  initSettingsModal();
});

/* ==============================================================================
   1. AUTHENTICATION GATE (Passcode: lawyer123)
   ============================================================================== */
function checkAuth() {
  const isAuth = sessionStorage.getItem("lex_admin_authenticated") === "true";
  const loginWrapper = document.getElementById("loginWrapper");
  const adminWrapper = document.getElementById("adminWrapper");

  if (isAuth) {
    if (loginWrapper) loginWrapper.style.display = "none";
    if (adminWrapper) adminWrapper.style.display = "flex";
    loadDashboardData();
  } else {
    if (loginWrapper) loginWrapper.style.display = "flex";
    if (adminWrapper) adminWrapper.style.display = "none";
  }
}

function initLoginForm() {
  const form = document.getElementById("adminLoginForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const passInput = document.getElementById("adminPasscode");
    const entered = passInput.value.trim();
    const expected = (window.FIRM_CONFIG && window.FIRM_CONFIG.admin.defaultPasscode) || "lawyer123";

    if (entered === expected) {
      sessionStorage.setItem("lex_admin_authenticated", "true");
      checkAuth();
      passInput.value = "";
    } else {
      alert("Invalid Security Passcode. Default access code is: lawyer123");
      passInput.focus();
    }
  });

  const logoutBtn = document.getElementById("btnLogout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      sessionStorage.removeItem("lex_admin_authenticated");
      checkAuth();
    });
  }
}

/* ==============================================================================
   2. DASHBOARD DATA & STATUS INDICATOR
   ============================================================================== */
async function loadDashboardData() {
  await updateConnectionStatus();
  await refreshConsultations();
  await refreshInquiries();
}

async function updateConnectionStatus() {
  const statusPill = document.getElementById("connectionStatusPill");
  if (!statusPill || !window.legalData) return;

  const creds = window.legalData.getCredentials();
  if (creds.url && creds.key) {
    const test = await window.legalData.testConnection();
    if (test.connected) {
      statusPill.className = "connection-status-pill";
      statusPill.innerHTML = `<span class="status-dot"></span> Supabase Connected (Live)`;
      statusPill.title = "Connected to live PostgreSQL database";
      return;
    }
  }

  // LocalStorage Fallback
  statusPill.className = "connection-status-pill status-local";
  statusPill.innerHTML = `<span class="status-dot"></span> LocalStorage Mode (Zero-Config)`;
  statusPill.title = "Operating with browser LocalStorage. Click Settings to connect Supabase.";
}

async function refreshConsultations() {
  if (!window.legalData) return;

  const res = await window.legalData.getConsultations();
  allConsultations = res.data || [];
  
  updateKpiCounters();
  renderConsultationsTable();
}

async function refreshInquiries() {
  if (!window.legalData) return;
  const res = await window.legalData.getInquiries();
  allInquiries = res.data || [];
  
  const inqBadge = document.getElementById("inquiryTabBadge");
  if (inqBadge) {
    const unreadCount = allInquiries.filter(i => i.status === "Unread").length;
    inqBadge.textContent = unreadCount;
  }
  renderInquiriesTable();
}

/* ==============================================================================
   3. KPI COUNTERS
   ============================================================================== */
function updateKpiCounters() {
  const total = allConsultations.length;
  const newCount = allConsultations.filter(c => c.status === "New").length;
  const scheduledCount = allConsultations.filter(c => c.status === "Scheduled").length;
  const criticalCount = allConsultations.filter(c => c.urgency === "Critical Court Matter" || c.urgency === "Urgent 24h").length;

  if (document.getElementById("kpiTotal")) document.getElementById("kpiTotal").textContent = total;
  if (document.getElementById("kpiNew")) document.getElementById("kpiNew").textContent = newCount;
  if (document.getElementById("kpiScheduled")) document.getElementById("kpiScheduled").textContent = scheduledCount;
  if (document.getElementById("kpiCritical")) document.getElementById("kpiCritical").textContent = criticalCount;

  const conBadge = document.getElementById("consultationTabBadge");
  if (conBadge) conBadge.textContent = newCount;
}

/* ==============================================================================
   4. CONSULTATIONS TABLE & FILTERS
   ============================================================================== */
function initFilterListeners() {
  const searchInput = document.getElementById("tableSearch");
  const statusFilter = document.getElementById("statusFilter");
  const urgencyFilter = document.getElementById("urgencyFilter");

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      currentFilter.search = e.target.value.toLowerCase().trim();
      renderConsultationsTable();
    });
  }

  if (statusFilter) {
    statusFilter.addEventListener("change", (e) => {
      currentFilter.status = e.target.value;
      renderConsultationsTable();
    });
  }

  if (urgencyFilter) {
    urgencyFilter.addEventListener("change", (e) => {
      currentFilter.urgency = e.target.value;
      renderConsultationsTable();
    });
  }
}

function renderConsultationsTable() {
  const tbody = document.getElementById("consultationsTableBody");
  if (!tbody) return;

  // Filter list
  const filtered = allConsultations.filter(item => {
    // Search
    const matchSearch = !currentFilter.search || 
      (item.full_name && item.full_name.toLowerCase().includes(currentFilter.search)) ||
      (item.phone && item.phone.toLowerCase().includes(currentFilter.search)) ||
      (item.practice_area && item.practice_area.toLowerCase().includes(currentFilter.search)) ||
      (item.case_details && item.case_details.toLowerCase().includes(currentFilter.search));

    // Status
    const matchStatus = currentFilter.status === "all" || item.status === currentFilter.status;

    // Urgency
    const matchUrgency = currentFilter.urgency === "all" || item.urgency === currentFilter.urgency;

    return matchSearch && matchStatus && matchUrgency;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7">
          <div class="table-empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <rect x="2" y="4" width="20" height="16" rx="2"></rect>
              <line x1="6" y1="8" x2="18" y2="8"></line>
              <line x1="6" y1="12" x2="14" y2="12"></line>
            </svg>
            <p>No consultation records matched the selected filters.</p>
          </div>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(item => {
    const shortDate = item.preferred_date ? new Date(item.preferred_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Earliest Available";
    const cleanPhone = (item.phone || "").replace(/[^0-9]/g, "");

    // Urgency Badge
    let urgencyBadge = `<span class="badge badge-routine">Routine</span>`;
    if (item.urgency === "Critical Court Matter") {
      urgencyBadge = `<span class="badge badge-critical">🚨 Critical Court</span>`;
    } else if (item.urgency === "Urgent 24h") {
      urgencyBadge = `<span class="badge badge-urgent">⚡ Urgent 24h</span>`;
    }

    // Status Badge & Inline changer
    const statuses = ["New", "Scheduled", "Completed", "Archived"];
    const statusOptions = statuses.map(s => `
      <option value="${s}" ${item.status === s ? 'selected' : ''}>${s}</option>
    `).join("");

    // WhatsApp Prefilled Link
    const waText = encodeURIComponent(`Hello ${item.full_name}, this is LexAdvocate & Associates regarding your legal consultation request for ${item.practice_area}. We would like to confirm your schedule.`);
    const waUrl = `https://wa.me/${cleanPhone}?text=${waText}`;

    return `
      <tr data-id="${item.id}">
        <td>
          <div style="font-weight: 600; color: #ffffff;">${item.full_name}</div>
          <div style="font-size: 0.78rem; color: #94a3b8;">${item.phone} ${item.email ? `• ${item.email}` : ''}</div>
        </td>
        <td>
          <span style="font-size: 0.82rem; color: var(--admin-gold-light); font-weight: 500;">${item.practice_area}</span>
        </td>
        <td>
          <span style="font-size: 0.8rem; background: rgba(255,255,255,0.06); padding: 0.2rem 0.5rem; border-radius: 4px;">${item.consultation_mode}</span>
        </td>
        <td>
          <div style="font-size: 0.82rem; color: #ffffff;">${shortDate}</div>
          <div style="font-size: 0.75rem; color: #94a3b8;">${item.preferred_time || 'Anytime'}</div>
        </td>
        <td>${urgencyBadge}</td>
        <td>
          <select class="status-changer-select" onchange="handleStatusChange('${item.id}', this.value)">
            ${statusOptions}
          </select>
        </td>
        <td>
          <div class="action-buttons">
            <a href="${waUrl}" target="_blank" class="btn-icon-action btn-action-wa" title="Open WhatsApp Chat with Client">
              <svg style="width: 16px; height: 16px;" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2z"></path>
              </svg>
            </a>
            <a href="tel:${cleanPhone}" class="btn-icon-action btn-action-call" title="Direct Phone Call">
              <svg style="width: 14px; height: 14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
            </a>
            ${item.email ? `
              <a href="mailto:${item.email}?subject=Consultation%20Notice%20-%20LexAdvocate%20Chambers" class="btn-icon-action" title="Send Official Email" style="color: #cbd5e1;">
                <svg style="width: 14px; height: 14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </a>
            ` : ''}
            <button class="btn-icon-action btn-action-view" onclick="viewCaseBrief('${item.id}')" title="Inspect Full Case Brief & Notes">
              <svg style="width: 14px; height: 14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
            <button class="btn-icon-action btn-action-delete" onclick="deleteBooking('${item.id}')" title="Delete / Dismiss Record">
              <svg style="width: 14px; height: 14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

window.handleStatusChange = async function(id, newStatus) {
  if (!window.legalData) return;
  await window.legalData.updateConsultationStatus(id, newStatus);
  const item = allConsultations.find(c => c.id === id);
  if (item) item.status = newStatus;
  updateKpiCounters();
};

window.deleteBooking = async function(id) {
  if (confirm("Are you sure you want to remove this consultation request from records?")) {
    await window.legalData.deleteConsultation(id);
    allConsultations = allConsultations.filter(c => c.id !== id);
    updateKpiCounters();
    renderConsultationsTable();
  }
};

/* ==============================================================================
   5. CASE BRIEF MODAL & NOTES SAVER
   ============================================================================== */
window.viewCaseBrief = function(id) {
  const item = allConsultations.find(c => c.id === id);
  if (!item) return;

  const modal = document.getElementById("caseBriefModal");
  if (!modal) return;

  document.getElementById("modalCaseClient").textContent = item.full_name;
  document.getElementById("modalCasePhone").textContent = item.phone;
  document.getElementById("modalCaseEmail").textContent = item.email || "N/A";
  document.getElementById("modalCasePractice").textContent = item.practice_area;
  document.getElementById("modalCaseMode").textContent = item.consultation_mode;
  document.getElementById("modalCaseUrgency").textContent = item.urgency;
  document.getElementById("modalCaseSlot").textContent = `${item.preferred_date || 'Earliest Available'} (${item.preferred_time})`;
  document.getElementById("modalCaseBriefText").textContent = item.case_details || "No written brief provided. Client will present facts in chambers.";

  const notesInput = document.getElementById("modalAdminNotes");
  if (notesInput) notesInput.value = item.admin_notes || "";

  const saveBtn = document.getElementById("modalSaveNotesBtn");
  if (saveBtn) {
    saveBtn.onclick = async () => {
      const notes = notesInput.value;
      await window.legalData.updateConsultationStatus(item.id, item.status, notes);
      item.admin_notes = notes;
      closeAdminModal("caseBriefModal");
      alert("Chamber notes updated successfully.");
    };
  }

  modal.classList.add("active");
};

/* ==============================================================================
   6. INQUIRIES TAB & STATUS
   ============================================================================== */
function renderInquiriesTable() {
  const tbody = document.getElementById("inquiriesTableBody");
  if (!tbody) return;

  if (allInquiries.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 2rem; color: #94a3b8;">No inquiries received yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = allInquiries.map(inq => `
    <tr>
      <td>
        <div style="font-weight: 600; color: #ffffff;">${inq.full_name}</div>
        <div style="font-size: 0.78rem; color: #94a3b8;">${inq.email} ${inq.phone ? `• ${inq.phone}` : ''}</div>
      </td>
      <td style="color: var(--admin-gold-light); font-weight: 500;">${inq.subject}</td>
      <td style="max-width: 320px; font-size: 0.85rem; color: #cbd5e1;">${inq.message}</td>
      <td>
        <span class="badge ${inq.status === 'Unread' ? 'badge-urgent' : 'badge-completed'}">${inq.status}</span>
      </td>
      <td>
        <button class="btn-icon-action btn-action-view" onclick="toggleInquiryStatus('${inq.id}')" title="Toggle Responded / Unread">
          <svg style="width: 14px; height: 14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </button>
      </td>
    </tr>
  `).join("");
}

window.toggleInquiryStatus = async function(id) {
  const inq = allInquiries.find(i => i.id === id);
  if (!inq) return;
  const newStatus = inq.status === "Unread" ? "Responded" : "Unread";
  await window.legalData.updateInquiryStatus(id, newStatus);
  inq.status = newStatus;
  refreshInquiries();
};

/* ==============================================================================
   7. TABS NAVIGATION
   ============================================================================== */
function initTabs() {
  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabPanes = document.querySelectorAll(".tab-pane");

  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.dataset.tab;

      tabBtns.forEach(b => b.classList.remove("active"));
      tabPanes.forEach(p => p.style.display = "none");

      btn.classList.add("active");
      const targetPane = document.getElementById(target);
      if (targetPane) targetPane.style.display = "block";
    });
  });
}

/* ==============================================================================
   8. EXPORT TO CSV
   ============================================================================== */
window.exportConsultationsToCSV = function() {
  if (allConsultations.length === 0) {
    alert("No data available to export.");
    return;
  }

  const headers = ["Reference ID", "Date Submitted", "Client Name", "Phone", "Email", "Practice Area", "Consultation Mode", "Preferred Date", "Preferred Time", "Urgency", "Status", "Admin Notes", "Case Brief"];
  
  const rows = allConsultations.map(c => [
    `"${c.id}"`,
    `"${c.created_at || ''}"`,
    `"${(c.full_name || '').replace(/"/g, '""')}"`,
    `"${c.phone || ''}"`,
    `"${c.email || ''}"`,
    `"${c.practice_area || ''}"`,
    `"${c.consultation_mode || ''}"`,
    `"${c.preferred_date || ''}"`,
    `"${c.preferred_time || ''}"`,
    `"${c.urgency || ''}"`,
    `"${c.status || ''}"`,
    `"${(c.admin_notes || '').replace(/"/g, '""')}"`,
    `"${(c.case_details || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `LexAdvocate_Consultations_${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
};

/* ==============================================================================
   9. SUPABASE CONNECTION SETTINGS MODAL
   ============================================================================== */
function initSettingsModal() {
  const openBtn = document.getElementById("btnOpenSettings");
  const modal = document.getElementById("supabaseSettingsModal");
  if (!openBtn || !modal) return;

  openBtn.addEventListener("click", () => {
    const creds = window.legalData.getCredentials();
    document.getElementById("settingsSupabaseUrl").value = creds.url;
    document.getElementById("settingsSupabaseKey").value = creds.key;
    document.getElementById("settingsStatusMsg").textContent = "";
    modal.classList.add("active");
  });

  document.getElementById("btnTestSupabase").addEventListener("click", async () => {
    const url = document.getElementById("settingsSupabaseUrl").value.trim();
    const key = document.getElementById("settingsSupabaseKey").value.trim();
    const msgEl = document.getElementById("settingsStatusMsg");
    msgEl.textContent = "Testing connection to Supabase database...";
    msgEl.style.color = "var(--admin-gold-light)";

    window.legalData.setCredentials(url, key);
    const test = await window.legalData.testConnection();

    if (test.connected) {
      msgEl.textContent = "✅ Success: Live Supabase PostgreSQL connected!";
      msgEl.style.color = "#34d399";
    } else {
      msgEl.textContent = "⚠️ " + test.message;
      msgEl.style.color = "#f87171";
    }
  });

  document.getElementById("btnSaveSupabase").addEventListener("click", async () => {
    const url = document.getElementById("settingsSupabaseUrl").value.trim();
    const key = document.getElementById("settingsSupabaseKey").value.trim();
    window.legalData.setCredentials(url, key);
    await loadDashboardData();
    closeAdminModal("supabaseSettingsModal");
    alert("Connection settings saved successfully.");
  });

  document.getElementById("btnClearSupabase").addEventListener("click", async () => {
    if (confirm("Reset to LocalStorage Mode? (Supabase keys will be removed from this browser)")) {
      window.legalData.setCredentials("", "");
      document.getElementById("settingsSupabaseUrl").value = "";
      document.getElementById("settingsSupabaseKey").value = "";
      await loadDashboardData();
      closeAdminModal("supabaseSettingsModal");
    }
  });
}

window.closeAdminModal = function(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove("active");
};
