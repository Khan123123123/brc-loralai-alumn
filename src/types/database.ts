export type AccessLevel = "limited" | "full";

export type AdminStatus = "pending" | "approved" | "rejected";

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
  end_date: string;
}

export interface Job {
  company: string;
  title: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;

  slug?: string | null;
  profile_photo_url?: string | null;

  entry_year?: number | null;
  graduation_year?: number | null;
  regular_self_finance?: FinanceType | null;
  roll_number?: string | null;
  home_district?: string | null;
  student_type?: StudentType | null;

  current_country?: string | null;
  current_city?: string | null;
  current_position?: string | null;
  profession?: string | null;
  current_organization?: string | null;
  industry?: string | null;
  experience_years?: number | null;
  employment_status?: EmploymentStatus | null;

  higher_education?: Education[] | null;
  job_history?: Job[] | null;

  phone?: string | null;
  linkedin_url?: string | null;
  languages?: string[] | null;
  bio?: string | null;
  achievements?: string | null;

  featured_in_presentation?: boolean | null;
  available_for_mentoring?: boolean | null;

  show_phone_publicly?: boolean | null;
  show_email_publicly?: boolean | null;
  show_linkedin_publicly?: boolean | null;
  show_in_directory?: boolean | null;

  access_level?: AccessLevel | null;
  admin_status?: AdminStatus | null;

  is_profile_complete?: boolean | null;
  submitted_for_review?: boolean | null;

  verification_status?: "pending" | "basic" | "full" | "rejected" | null;
  verification_score?: number | null;
  verification_answers?: VerificationAnswers | null;

  approved_at?: string | null;
  last_profile_reviewed_at?: string | null;
  reviewed_by?: string | null;
  verified_by_peers?: number | null;
  needs_admin_review?: boolean | null;

  created_at?: string | null;
  updated_at?: string | null;
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