/**
 * LexAdvocate & Associates (Bukhari Law Chambers)
 * Central Configuration & Firm Information
 */

const FIRM_CONFIG = {
  // Brand & Identity
  firmName: "LexAdvocate & Associates",
  subtitle: "Bukhari Law Chambers & Legal Consultants",
  establishedYear: 2004,
  tagline: "Defending Your Rights with Integrity, Precision & Proven Legal Excellence",
  
  // Contact Credentials & Direct Communications
  contact: {
    phone: "+92 333 7972445",
    phoneClean: "923337972445", // E.164 formatted without '+' for WhatsApp/tel links
    emergencyPhone: "+92 333 7972445",
    whatsapp: "923337972445",
    whatsappDisplay: "+92 333 7972445",
    email: "contact@lexadvocate.law",
    chamberEmail: "adv.imran.abro@lexadvocate.law",
    officeAddress: "Suite 402-405, Executive Legal Tower, Supreme & High Court Avenue, Legal District",
    courtJurisdictions: "High Court & Supreme Court Bar Advocates",
    workingHours: {
      weekdays: "Monday – Friday: 09:00 AM – 08:00 PM",
      saturday: "Saturday: 10:00 AM – 04:00 PM (By Appointment)",
      sunday: "Sunday: Closed (Emergency Court Bail Hotline Open: 24/7)"
    }
  },

  // Senior Partners & Leadership
  seniorPartners: [
    {
      name: "Advocate Imran IB Abro",
      title: "Senior Advocate High Court & Founder",
      qualification: "LL.M., LL.B., Advocate High Court",
      experience: "18+ Years High Court & Appellate Practice",
      specialization: "Criminal Defense, Corporate Litigation, Civil & Constitutional Writs, Bail Matters",
      bio: "Distinguished courtroom advocate recognized for rigorous litigation acumen, high-stakes bail petitions, complex property disputes, and corporate advisory before High Courts and judicial tribunals.",
      photo: "images/advocate-imran-ib-abro.jpg",
      phone: "+92 333 7972445",
      phoneClean: "923337972445"
    },
    {
      name: "Adv. Tariq M. Bukhari",
      title: "Senior Partner & Supreme Court Advocate",
      qualification: "LL.M. (London), Bar-at-Law (Lincoln's Inn)",
      experience: "24+ Years at Supreme Court & High Court",
      specialization: "Constitutional Writs, Corporate Litigation, Criminal Defense",
      bio: "Over two decades of precedent-setting jurisprudence in corporate disputes, constitutional rights, and high-profile appellate litigation.",
      photo: null
    },
    {
      name: "Barrister Sarah A. Al-Bukhari",
      title: "Partner & Head of Corporate Practice",
      qualification: "LL.B. (Hons, Kings College), Barrister-at-Law (Middle Temple)",
      experience: "14+ Years International & Commercial Bar",
      specialization: "Mergers & Acquisitions, Banking & Finance, Intellectual Property",
      bio: "Advising multinational corporations, venture funds, and financial institutions on complex cross-border transactions, regulatory compliance, and arbitration.",
      photo: null
    }
  ],

  // Statistics for Social Proof
  stats: {
    yearsExperience: "20+",
    caseSuccessRate: "98.4%",
    totalConsultations: "5,200+",
    recoveredDamages: "$45M+",
    activeClients: "850+"
  },

  // Admin Security Configuration
  admin: {
    // Default passcode as specified: 'lawyer123'
    defaultPasscode: "lawyer123",
    sessionKey: "lex_admin_auth_token",
    sessionDurationHours: 12
  },

  // Supabase Configuration Keys (Stored in LocalStorage or defaults)
  supabase: {
    storageKeyUrl: "lex_supabase_url",
    storageKeyAnon: "lex_supabase_anon_key",
    // Optional default fallback credentials (user can set from Admin UI without modifying code)
    defaultUrl: "",
    defaultAnonKey: ""
  }
};

// Export to window for global access
if (typeof window !== "undefined") {
  window.FIRM_CONFIG = FIRM_CONFIG;
}
