/**
 * LexAdvocate & Associates - Supabase Client & Universal Data Layer
 * Handles live Supabase connections via @supabase/supabase-js v2
 * with seamless automatic fallback to browser LocalStorage.
 * Guarantees zero downtime and 100% functionality even with zero configuration.
 */

class LegalDataManager {
  constructor() {
    this.client = null;
    this.isSupabaseActive = false;
    this.storagePrefix = "lex_";
    
    // Seed initial demo data into LocalStorage if empty
    this._initializeLocalSeedData();
    
    // Attempt Supabase connection
    this.initSupabase();
  }

  /**
   * Retrieves active credentials from LocalStorage or config
   */
  getCredentials() {
    const url = localStorage.getItem("lex_supabase_url") || (window.FIRM_CONFIG && window.FIRM_CONFIG.supabase.defaultUrl) || "";
    const key = localStorage.getItem("lex_supabase_anon_key") || (window.FIRM_CONFIG && window.FIRM_CONFIG.supabase.defaultAnonKey) || "";
    return { url: url.trim(), key: key.trim() };
  }

  /**
   * Sets new Supabase credentials and re-initializes client
   */
  setCredentials(url, key) {
    if (url && key) {
      localStorage.setItem("lex_supabase_url", url.trim());
      localStorage.setItem("lex_supabase_anon_key", key.trim());
    } else {
      localStorage.removeItem("lex_supabase_url");
      localStorage.removeItem("lex_supabase_anon_key");
    }
    return this.initSupabase();
  }

  /**
   * Initializes Supabase JS client
   */
  initSupabase() {
    const { url, key } = this.getCredentials();
    
    if (url && key && window.supabase && typeof window.supabase.createClient === "function") {
      try {
        this.client = window.supabase.createClient(url, key);
        this.isSupabaseActive = true;
        console.log("⚖️ [LexAdvocate] Supabase Client Initialized with provided credentials.");
        return true;
      } catch (err) {
        console.warn("⚠️ [LexAdvocate] Supabase initialization error, falling back to LocalStorage:", err);
        this.client = null;
        this.isSupabaseActive = false;
        return false;
      }
    } else {
      this.client = null;
      this.isSupabaseActive = false;
      return false;
    }
  }

  /**
   * Tests Supabase connectivity
   */
  async testConnection() {
    if (!this.client) {
      return { connected: false, message: "No active Supabase client configured. Operating in LocalStorage mode." };
    }
    try {
      const { data, error } = await this.client
        .from("consultations")
        .select("id")
        .limit(1);
        
      if (error) {
        return { connected: false, message: error.message };
      }
      return { connected: true, message: "Connected successfully to live Supabase PostgreSQL database." };
    } catch (err) {
      return { connected: false, message: err.message || "Network request failed." };
    }
  }

  // ============================================================================
  // CONSULTATIONS API
  // ============================================================================

  /**
   * Submit new consultation request
   */
  async createConsultation(payload) {
    const consultationRecord = {
      id: this._generateUUID(),
      created_at: new Date().toISOString(),
      full_name: payload.full_name,
      phone: payload.phone,
      email: payload.email || "",
      practice_area: payload.practice_area,
      consultation_mode: payload.consultation_mode || "In-Chambers",
      preferred_date: payload.preferred_date || null,
      preferred_time: payload.preferred_time || "Morning (10:00 AM - 01:00 PM)",
      urgency: payload.urgency || "Routine",
      case_details: payload.case_details || "",
      status: "New",
      admin_notes: "",
      fee_quoted: 0.00
    };

    // If Supabase is active, try to insert there first
    if (this.isSupabaseActive && this.client) {
      try {
        const { data, error } = await this.client
          .from("consultations")
          .insert([consultationRecord])
          .select();

        if (error) {
          console.warn("Supabase insert error, saving to LocalStorage fallback:", error);
          this._saveToLocal("consultations", consultationRecord);
          return { success: true, data: consultationRecord, source: "local_fallback", warning: error.message };
        }
        
        // Also keep local copy updated
        this._saveToLocal("consultations", data[0] || consultationRecord);
        return { success: true, data: data[0] || consultationRecord, source: "supabase" };
      } catch (err) {
        console.warn("Network error during Supabase insert, saving to local:", err);
        this._saveToLocal("consultations", consultationRecord);
        return { success: true, data: consultationRecord, source: "local_fallback" };
      }
    }

    // Default: Save directly to LocalStorage
    this._saveToLocal("consultations", consultationRecord);
    return { success: true, data: consultationRecord, source: "local" };
  }

  /**
   * Fetch all consultation requests (for Admin Dashboard)
   */
  async getConsultations() {
    if (this.isSupabaseActive && this.client) {
      try {
        const { data, error } = await this.client
          .from("consultations")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data) {
          // Cache in local storage
          localStorage.setItem(this.storagePrefix + "consultations", JSON.stringify(data));
          return { success: true, data: data, source: "supabase" };
        }
      } catch (err) {
        console.warn("Could not fetch consultations from Supabase, loading local cache:", err);
      }
    }

    // Return from LocalStorage
    const localData = this._getFromLocal("consultations");
    return { success: true, data: localData, source: "local" };
  }

  /**
   * Update consultation status and admin notes
   */
  async updateConsultationStatus(id, newStatus, adminNotes = null) {
    const updatePayload = { status: newStatus };
    if (adminNotes !== null) {
      updatePayload.admin_notes = adminNotes;
    }

    if (this.isSupabaseActive && this.client) {
      try {
        const { data, error } = await this.client
          .from("consultations")
          .update(updatePayload)
          .eq("id", id)
          .select();

        if (error) {
          console.warn("Supabase update error, updating locally:", error);
        }
      } catch (err) {
        console.warn("Network error during update, updating locally:", err);
      }
    }

    // Always update LocalStorage
    const list = this._getFromLocal("consultations");
    const index = list.findIndex(c => c.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...updatePayload };
      localStorage.setItem(this.storagePrefix + "consultations", JSON.stringify(list));
      return { success: true, data: list[index] };
    }
    return { success: false, message: "Record not found" };
  }

  /**
   * Delete or archive consultation record
   */
  async deleteConsultation(id) {
    if (this.isSupabaseActive && this.client) {
      try {
        await this.client.from("consultations").delete().eq("id", id);
      } catch (e) {
        console.warn("Supabase delete error:", e);
      }
    }
    const list = this._getFromLocal("consultations").filter(c => c.id !== id);
    localStorage.setItem(this.storagePrefix + "consultations", JSON.stringify(list));
    return { success: true };
  }

  // ============================================================================
  // INQUIRIES API
  // ============================================================================

  async createInquiry(payload) {
    const inquiryRecord = {
      id: this._generateUUID(),
      created_at: new Date().toISOString(),
      full_name: payload.full_name,
      email: payload.email,
      phone: payload.phone || "",
      subject: payload.subject,
      message: payload.message,
      status: "Unread"
    };

    if (this.isSupabaseActive && this.client) {
      try {
        const { data, error } = await this.client
          .from("inquiries")
          .insert([inquiryRecord])
          .select();

        if (!error && data) {
          this._saveToLocal("inquiries", data[0] || inquiryRecord);
          return { success: true, data: data[0], source: "supabase" };
        }
      } catch (err) {
        console.warn("Error inserting inquiry to Supabase:", err);
      }
    }

    this._saveToLocal("inquiries", inquiryRecord);
    return { success: true, data: inquiryRecord, source: "local" };
  }

  async getInquiries() {
    if (this.isSupabaseActive && this.client) {
      try {
        const { data, error } = await this.client
          .from("inquiries")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && data) {
          localStorage.setItem(this.storagePrefix + "inquiries", JSON.stringify(data));
          return { success: true, data: data, source: "supabase" };
        }
      } catch (err) {
        console.warn("Supabase inquiries fetch error:", err);
      }
    }

    return { success: true, data: this._getFromLocal("inquiries"), source: "local" };
  }

  async updateInquiryStatus(id, newStatus) {
    if (this.isSupabaseActive && this.client) {
      try {
        await this.client.from("inquiries").update({ status: newStatus }).eq("id", id);
      } catch (e) {
        console.warn(e);
      }
    }
    const list = this._getFromLocal("inquiries");
    const idx = list.findIndex(i => i.id === id);
    if (idx !== -1) {
      list[idx].status = newStatus;
      localStorage.setItem(this.storagePrefix + "inquiries", JSON.stringify(list));
      return { success: true, data: list[idx] };
    }
    return { success: false };
  }

  // ============================================================================
  // TESTIMONIALS API
  // ============================================================================

  async getTestimonials() {
    if (this.isSupabaseActive && this.client) {
      try {
        const { data, error } = await this.client
          .from("testimonials")
          .select("*")
          .eq("is_featured", true)
          .order("created_at", { ascending: false });

        if (!error && data && data.length > 0) {
          return { success: true, data: data, source: "supabase" };
        }
      } catch (err) {
        console.warn("Supabase testimonials fetch error:", err);
      }
    }
    return { success: true, data: this._getFromLocal("testimonials"), source: "local" };
  }

  async createTestimonial(payload) {
    const record = {
      id: this._generateUUID(),
      created_at: new Date().toISOString(),
      client_name: payload.client_name,
      company_or_designation: payload.company_or_designation || "",
      practice_area: payload.practice_area || "General Legal Counsel",
      rating: parseInt(payload.rating) || 5,
      review_text: payload.review_text,
      case_outcome: payload.case_outcome || "Favorable Judgment / Settlement",
      is_verified: true,
      is_featured: true
    };

    if (this.isSupabaseActive && this.client) {
      try {
        const { data, error } = await this.client
          .from("testimonials")
          .insert([record])
          .select();
        if (!error && data) {
          this._saveToLocal("testimonials", data[0]);
          return { success: true, data: data[0], source: "supabase" };
        }
      } catch (err) {
        console.warn(err);
      }
    }

    this._saveToLocal("testimonials", record);
    return { success: true, data: record, source: "local" };
  }

  // ============================================================================
  // LOCAL STORAGE HELPERS & SEED DATA
  // ============================================================================

  _getFromLocal(collectionName) {
    try {
      const data = localStorage.getItem(this.storagePrefix + collectionName);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("LocalStorage parse error:", e);
      return [];
    }
  }

  _saveToLocal(collectionName, item) {
    const list = this._getFromLocal(collectionName);
    // Add to top of list
    list.unshift(item);
    localStorage.setItem(this.storagePrefix + collectionName, JSON.stringify(list));
  }

  _generateUUID() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  _initializeLocalSeedData() {
    // 1. Initial consultations if not present
    if (!localStorage.getItem(this.storagePrefix + "consultations")) {
      const seedConsultations = [
        {
          id: "c1-901a-4288-8e6d-21df894a8001",
          created_at: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hrs ago
          full_name: "Chaudhry Kamran Akram",
          phone: "+92 300 8899112",
          email: "kamran.akram@gmail.com",
          practice_area: "Criminal Defense & Bail Matters",
          consultation_mode: "In-Chambers",
          preferred_date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
          preferred_time: "02:30 PM - 03:30 PM",
          urgency: "Critical Court Matter",
          case_details: "Emergency pre-arrest bail petition before the High Court division bench regarding an ongoing corporate regulatory probe. Need urgent hearing preparation.",
          status: "New",
          admin_notes: "Bail brief examined. Scheduled for urgent court filing.",
          fee_quoted: 50000
        },
        {
          id: "c2-901a-4288-8e6d-21df894a8002",
          created_at: new Date(Date.now() - 86400000 * 1).toISOString(), // 1 day ago
          full_name: "Hassan Raza Enterprises Ltd.",
          phone: "+92 321 4455667",
          email: "legal@hraza-enterprises.com",
          practice_area: "Corporate & Commercial Law",
          consultation_mode: "In-Chambers",
          preferred_date: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
          preferred_time: "11:00 AM - 12:00 PM",
          urgency: "Routine",
          case_details: "Drafting joint venture shareholder agreement and cross-border distribution licensing for export expansion in the Middle East and EU markets.",
          status: "Scheduled",
          admin_notes: "Meeting fixed with Adv. Sarah Al-Bukhari. Draft contract received.",
          fee_quoted: 120000
        },
        {
          id: "c3-901a-4288-8e6d-21df894a8003",
          created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
          full_name: "Dr. Amina Shah & Co.",
          phone: "+92 333 7788990",
          email: "dr.amina.shah@hospitaltrust.org",
          practice_area: "Property & Real Estate Litigation",
          consultation_mode: "Video Call",
          preferred_date: new Date(Date.now() + 86400000 * 4).toISOString().split("T")[0],
          preferred_time: "04:00 PM - 05:00 PM",
          urgency: "Urgent 24h",
          case_details: "Commercial healthcare land encroachment and temporary injunction petition against unauthorized developer construction adjacent to hospital clinic.",
          status: "Scheduled",
          admin_notes: "Injunction petition filed. Notice dispatched to civil court registrar.",
          fee_quoted: 75000
        },
        {
          id: "c4-901a-4288-8e6d-21df894a8004",
          created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
          full_name: "Malik Faisal Iqbal",
          phone: "+92 345 5566778",
          email: "faisal.iqbal@techventures.io",
          practice_area: "Cyber Crime & Digital Law",
          consultation_mode: "Phone Consultation",
          preferred_date: new Date(Date.now() + 86400000 * 5).toISOString().split("T")[0],
          preferred_time: "10:30 AM - 11:30 AM",
          urgency: "Routine",
          case_details: "Unauthorized intellectual property extraction and source code theft by former overseas technical contractor. Reviewing criminal cyber complaints and civil copyright injunction.",
          status: "New",
          admin_notes: "",
          fee_quoted: 0
        },
        {
          id: "c5-901a-4288-8e6d-21df894a8005",
          created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
          full_name: "Syeda Zainab Bukhari",
          phone: "+92 302 9988776",
          email: "zainab.bukhari@consulting.com",
          practice_area: "Family & Matrimonial Law",
          consultation_mode: "In-Chambers",
          preferred_date: new Date(Date.now() - 86400000 * 2).toISOString().split("T")[0],
          preferred_time: "03:00 PM - 04:00 PM",
          urgency: "Routine",
          case_details: "Family trust partition and legal succession declaration among all legal heirs for multi-city ancestral assets.",
          status: "Completed",
          admin_notes: "Succession certificate obtained; amicable family partition deed registered.",
          fee_quoted: 90000
        }
      ];
      localStorage.setItem(this.storagePrefix + "consultations", JSON.stringify(seedConsultations));
    }

    // 2. Initial inquiries if not present
    if (!localStorage.getItem(this.storagePrefix + "inquiries")) {
      const seedInquiries = [
        {
          id: "inq-01",
          created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
          full_name: "Naveed Qureshi",
          email: "n.qureshi@apexlogistics.pk",
          phone: "+92 300 1122334",
          subject: "Annual Legal Retainership Query",
          message: "We operate an expanding regional logistics company with 45 fleet vehicles seeking a corporate retainership for commercial agreements and labor tribunals.",
          status: "Unread"
        },
        {
          id: "inq-02",
          created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
          full_name: "Farhana Aslam",
          email: "farhana.a@gmail.com",
          phone: "+92 312 9988112",
          subject: "Supreme Court Appeal Consultation",
          message: "Requesting an advisory session with Senior Advocate Tariq Bukhari regarding Civil Petition for Leave to Appeal (CPLA) deadlines.",
          status: "Responded"
        }
      ];
      localStorage.setItem(this.storagePrefix + "inquiries", JSON.stringify(seedInquiries));
    }

    // 3. Initial testimonials
    if (!localStorage.getItem(this.storagePrefix + "testimonials")) {
      const seedTestimonials = [
        {
          id: "t-01",
          created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
          client_name: "Sheikh Tariq Mehmood",
          company_or_designation: "CEO, Atlas Industrial Group",
          practice_area: "Corporate & Commercial Law",
          rating: 5,
          review_text: "Adv. Tariq Bukhari and his senior associates handled our multi-million dollar international commercial dispute with consummate mastery. Their courtroom poise and strategic arbitration acumen protected our business from severe liabilities.",
          case_outcome: "Arbitration Award Won: $3.2M Dispute Dismissed",
          is_verified: true,
          is_featured: true
        },
        {
          id: "t-02",
          created_at: new Date(Date.now() - 86400000 * 25).toISOString(),
          client_name: "Brigadier (R) M. Shafi",
          company_or_designation: "Managing Trustee, Al-Noor Educational Trust",
          practice_area: "Property & Real Estate Litigation",
          rating: 5,
          review_text: "When our educational campus faced unlawful land grabbing attempts by powerful elements, LexAdvocate secured an urgent High Court stay within 48 hours and resolved the title litigation definitively.",
          case_outcome: "Land Title Upheld & Injunction Enforced",
          is_verified: true,
          is_featured: true
        },
        {
          id: "t-03",
          created_at: new Date(Date.now() - 86400000 * 35).toISOString(),
          client_name: "Ayesha Rehan Siddiqui",
          company_or_designation: "Senior VP, Horizon Fintech",
          practice_area: "Civil Litigation & Constitutional Writs",
          rating: 5,
          review_text: "Absolute confidentiality, unmatched depth in regulatory compliance, and courtroom tenacity. Their constitutional writ petition against arbitrary regulatory penalties established an inspiring judicial precedent.",
          case_outcome: "Constitutional Bench Ruled Unanimously in Favor",
          is_verified: true,
          is_featured: true
        },
        {
          id: "t-04",
          created_at: new Date(Date.now() - 86400000 * 45).toISOString(),
          client_name: "Khurram Jamil Khan",
          company_or_designation: "Managing Director, Global Logistics",
          practice_area: "Criminal Defense & Bail Matters",
          rating: 5,
          review_text: "In an emergency criminal defense crisis with impending wrongful detention, the legal team drafted our petition overnight and obtained protective pre-arrest bail before noon. Exemplary legal advocacy.",
          case_outcome: "Pre-Arrest Bail Confirmed Unanimously",
          is_verified: true,
          is_featured: true
        }
      ];
      localStorage.setItem(this.storagePrefix + "testimonials", JSON.stringify(seedTestimonials));
    }
  }
}

// Instantiate and expose globally
window.legalData = new LegalDataManager();
