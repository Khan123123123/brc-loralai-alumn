export type AccessLevel = "none" | "limited" | "full";
export type AdminStatus = "pending" | "approved" | "rejected";
export type VerificationStatus = "pending" | "basic" | "full" | "rejected";
export type AccountType = "Alumni" | "Faculty" | "Student";
export type StudentType = "Hostelite" | "Day Scholar";
export type FinanceType = "Regular" | "Self-Finance";

export type EmploymentStatus =
  | "Employed"
  | "Self-Employed"
  | "Business Owner"
  | "Student"
  | "Retired"
  | "Not Working"
  | "House Wife/Husband";

export interface VerificationAnswers {
  houses?: string;
  teachers?: string;
  staff?: string;
  principal?: string;
  established_year?: string;
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  start_date: string;
  end_date?: string;
}

export interface Job {
  company: string;
  title: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  description?: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;

  slug?: string | null;
  profile_photo_url?: string | null;
  avatar_url?: string | null;

  account_type?: AccountType | string | null;
  subjects_taught?: string[] | null;

  // BRC Details
  entry_year?: number | null;
  graduation_year?: number | null;
  regular_self_finance?: FinanceType | null;
  roll_number?: string | null;
  home_district?: string | null;
  student_type?: StudentType | null;

  // Location
  current_country?: string | null;
  current_city?: string | null;
  home_city?: string | null;

  // Professional
  current_position?: string | null;
  profession?: string | null;
  current_organization?: string | null;
  industry?: string | null;
  expertise_areas?: string[] | null;
  experience_years?: number | null;
  employment_status?: EmploymentStatus | null;

  higher_education?: Education[] | null;
  job_history?: Job[] | null;

  // Contact & Social
  phone?: string | null;
  phone_number?: string | null;
  linkedin_url?: string | null;
  twitter_url?: string | null;
  website_url?: string | null;
  
  // Engaging Fields
  languages?: string[] | null;
  bio?: string | null;
  achievements?: string | null;
  achievements_brc?: string | null;
  achievements_after?: string | null;
  favorite_teacher?: string | null;
  message_for_koharians?: string | null;

  // Settings & Preferences
  featured_in_presentation?: boolean | null;
  wants_to_be_featured?: boolean | null;
  available_for_mentoring?: boolean | null;
  show_phone?: boolean | null;
  show_phone_publicly?: boolean | null;
  show_email?: boolean | null;
  show_email_publicly?: boolean | null;
  show_linkedin_publicly?: boolean | null;
  show_in_directory?: boolean | null;

  // System & Access Status
  access_level?: AccessLevel | null;
  admin_status?: AdminStatus | null;
  is_profile_complete?: boolean | null;
  submitted_for_review?: boolean | null;

  verification_status?: VerificationStatus | null;
  verification_score?: number | null;
  verification_answers?: VerificationAnswers | null;

  approved_at?: string | null;
  last_profile_reviewed_at?: string | null;
  reviewed_by?: string | null;
  verified_by_peers?: number | null;
  needs_admin_review?: boolean | null;

  created_at?: string | null;
  updated_at?: string | null;
  deep_search_text?: string | null;
}

export interface VerificationLog {
  id: number;
  profile_id: string;
  action: string;
  previous_status?: string | null;
  new_status?: string | null;
  performed_by?: string | null;
  notes?: string | null;
  created_at: string;
}

export type Announcement = {
  id: string;
  title: string;
  content: string;
  type: "Event" | "News" | "Urgent";
  link_url: string | null;
  is_active: boolean;
  created_at: string;
};