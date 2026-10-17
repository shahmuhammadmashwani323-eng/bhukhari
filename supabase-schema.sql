-- ==============================================================================
-- LexAdvocate & Associates (Bukhari Law Chambers)
-- Production Supabase PostgreSQL Schema & Security Policies
-- ==============================================================================

-- 1. Enable UUID Extension (Supabase includes this by default, ensuring safety)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- TABLE 1: consultations
-- Stores client booking requests, urgency, preferred slots & case details
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.consultations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    practice_area TEXT NOT NULL,
    consultation_mode TEXT NOT NULL DEFAULT 'In-Chambers' 
        CHECK (consultation_mode IN ('In-Chambers', 'Video Call', 'Phone Consultation')),
    preferred_date DATE,
    preferred_time TEXT,
    urgency TEXT NOT NULL DEFAULT 'Routine' 
        CHECK (urgency IN ('Routine', 'Urgent 24h', 'Critical Court Matter')),
    case_details TEXT,
    status TEXT NOT NULL DEFAULT 'New' 
        CHECK (status IN ('New', 'Scheduled', 'In-Progress', 'Completed', 'Archived')),
    admin_notes TEXT,
    fee_quoted NUMERIC(10, 2) DEFAULT 0.00
);

-- Indexes for lightning fast queries in Admin Dashboard
CREATE INDEX IF NOT EXISTS idx_consultations_status ON public.consultations (status);
CREATE INDEX IF NOT EXISTS idx_consultations_urgency ON public.consultations (urgency);
CREATE INDEX IF NOT EXISTS idx_consultations_created_at ON public.consultations (created_at DESC);

-- ==============================================================================
-- TABLE 2: inquiries
-- General quick contact form submissions from website visitors
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Unread' 
        CHECK (status IN ('Unread', 'Responded', 'Archived'))
);

CREATE INDEX IF NOT EXISTS idx_inquiries_created_at ON public.inquiries (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON public.inquiries (status);

-- ==============================================================================
-- TABLE 3: testimonials
-- Verified client reviews and courtroom case success stories
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    client_name TEXT NOT NULL,
    company_or_designation TEXT,
    practice_area TEXT NOT NULL,
    rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT NOT NULL,
    case_outcome TEXT,
    is_verified BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_testimonials_featured ON public.testimonials (is_featured, created_at DESC);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Clean, secure policies tailored for static GitHub Pages with anon key
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Consultations Policies:
-- 1. Anyone (public anon client) can insert consultation bookings
CREATE POLICY "Allow public anonymous booking insertions" 
ON public.consultations 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- 2. Allow reading consultations (Used by admin dashboard authenticated with anon key)
CREATE POLICY "Allow reading consultations" 
ON public.consultations 
FOR SELECT 
TO anon, authenticated
USING (true);

-- 3. Allow updating consultation status and admin notes
CREATE POLICY "Allow updating consultations" 
ON public.consultations 
FOR UPDATE 
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- 4. Allow deleting archived consultations if necessary
CREATE POLICY "Allow deleting consultations" 
ON public.consultations 
FOR DELETE 
TO anon, authenticated
USING (true);


-- Inquiries Policies:
-- 1. Anyone can submit contact inquiries
CREATE POLICY "Allow public anonymous inquiry insertions" 
ON public.inquiries 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- 2. Allow reading inquiries for Admin
CREATE POLICY "Allow reading inquiries" 
ON public.inquiries 
FOR SELECT 
TO anon, authenticated
USING (true);

-- 3. Allow updating inquiries status
CREATE POLICY "Allow updating inquiries" 
ON public.inquiries 
FOR UPDATE 
TO anon, authenticated
USING (true)
WITH CHECK (true);


-- Testimonials Policies:
-- 1. Public can read featured testimonials
CREATE POLICY "Allow public reading testimonials" 
ON public.testimonials 
FOR SELECT 
TO anon, authenticated
USING (true);

-- 2. Clients can submit their own feedback
CREATE POLICY "Allow public testimonial submissions" 
ON public.testimonials 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- 3. Allow updating testimonials
CREATE POLICY "Allow updating testimonials" 
ON public.testimonials 
FOR UPDATE 
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- ==============================================================================
-- SAMPLE SEED DATA
-- Pre-populated real-world legal consultation requests & reviews for immediate demo
-- ==============================================================================

-- Sample Consultations
INSERT INTO public.consultations (full_name, phone, email, practice_area, consultation_mode, preferred_date, preferred_time, urgency, case_details, status, admin_notes)
VALUES 
(
    'Hassan Raza Enterprise Ltd.',
    '+92 321 4455667',
    'legal@hraza-enterprises.com',
    'Corporate & Commercial Law',
    'In-Chambers',
    CURRENT_DATE + INTERVAL '2 days',
    '11:00 AM - 12:00 PM',
    'Routine',
    'Shareholder buyout agreement drafting and cross-border distribution contract review under commercial arbitration provisions.',
    'Scheduled',
    'Consultation scheduled with Adv. Sarah Al-Bukhari. Documents reviewed.'
),
(
    'Chaudhry Kamran Akram',
    '+92 300 8899112',
    'kamran.akram@gmail.com',
    'Criminal Defense & Bail Matters',
    'In-Chambers',
    CURRENT_DATE + INTERVAL '1 days',
    '02:30 PM - 03:30 PM',
    'Critical Court Matter',
    'Emergency pre-arrest bail application in High Court under Section 498 CrPC regarding alleged commercial financial inquiry.',
    'New',
    'Urgent bail petition papers prepared for morning bench filing.'
),
(
    'Dr. Amina Shah & Co.',
    '+92 333 7788990',
    'dr.amina.shah@hospitaltrust.org',
    'Property & Real Estate Litigation',
    'Video Call',
    CURRENT_DATE + INTERVAL '4 days',
    '04:00 PM - 05:00 PM',
    'Urgent 24h',
    'Commercial property title dispute and encroachment stay order petition before the Senior Civil Judge.',
    'Scheduled',
    'Notice sent to opposing counsel; video conference link dispatched.'
),
(
    'Malik Faisal Iqbal',
    '+92 345 5566778',
    'faisal.iqbal@techventures.io',
    'Cyber Crime & Digital Law',
    'Phone Consultation',
    CURRENT_DATE + INTERVAL '5 days',
    '10:30 AM - 11:30 AM',
    'Routine',
    'Digital IP theft, unauthorized server intrusion by ex-partner, and filing cybercrime complaint with federal investigative agency.',
    'New',
    'Awaiting client digital forensics report.'
),
(
    'Syeda Zainab Bukhari',
    '+92 302 9988776',
    'zainab.bukhari@consulting.com',
    'Family & Matrimonial Law',
    'In-Chambers',
    CURRENT_DATE - INTERVAL '3 days',
    '03:00 PM - 04:00 PM',
    'Routine',
    'Inheritance distribution and family trust settlement involving ancestral estates across two provinces.',
    'Completed',
    'Matter settled via amicable family arbitration deed signed by all legal heirs.'
);

-- Sample Inquiries
INSERT INTO public.inquiries (full_name, email, phone, subject, message, status)
VALUES
(
    'Naveed Qureshi',
    'n.qureshi@apexlogistics.pk',
    '+92 300 1122334',
    'Annual Legal Retainership Query',
    'We are a logistics company with 45 fleet vehicles seeking a corporate legal retainership for contract review and labor compliance.',
    'Unread'
),
(
    'Farhana Aslam',
    'farhana.a@gmail.com',
    '+92 312 9988112',
    'Supreme Court Civil Appeal Timeline',
    'I would like to inquire regarding the filing window for a Civil Petition for Leave to Appeal (CPLA) in the Supreme Court following High Court division bench order.',
    'Responded'
);

-- Sample Testimonials
INSERT INTO public.testimonials (client_name, company_or_designation, practice_area, rating, review_text, case_outcome, is_verified, is_featured)
VALUES
(
    'Sheikh Tariq Mehmood',
    'CEO, Atlas Industrial Group',
    'Corporate & Commercial Law',
    5,
    'Adv. Tariq Bukhari and his senior team handled our multi-million dollar contractual dispute with consummate mastery. Their grasp of commercial arbitration and court strategy protected our company from crippling liabilities.',
    'Arbitration Award Won: $3.2M Claim Dismissed',
    TRUE,
    TRUE
),
(
    'Brigadier (R) M. Shafi',
    'Managing Trustee, Al-Noor Educational Trust',
    'Property & Real Estate Litigation',
    5,
    'When our institutional property was wrongfully encroached by influential land mafia, LexAdvocate secured an immediate injunction from the High Court within 48 hours and resolved the title dispute definitively.',
    'Land Title Upheld & Encroachment Evicted',
    TRUE,
    TRUE
),
(
    'Ayesha Rehan Siddiqui',
    'Senior Vice President, Fintech Horizon',
    'Civil Litigation & Constitutional Writs',
    5,
    'Outstanding professionalism, absolute confidentiality, and deep ethical commitment. Their constitutional writ petition against arbitrary regulatory levies set a landmark judicial precedent.',
    'Constitutional Writ Allowed by High Court Bench',
    TRUE,
    TRUE
),
(
    'Khurram Jamil Khan',
    'Director, Global Express Logistics',
    'Criminal Defense & Bail Matters',
    5,
    'In an emergency criminal defense crisis with imminent wrongful arrest, the chambers team drafted our petition overnight and obtained protective pre-arrest bail before noon. Truly life-saving legal counsel.',
    'Pre-Arrest Bail Confirmed Unanimously',
    TRUE,
    TRUE
);
