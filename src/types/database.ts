export interface Profile {
  id: string;
  email: string;
  full_name: string;
  entry_year?: number | null;
  graduation_year?: number | null;
  regular_self_finance?: "Regular" | "Self-Finance" | null;
  roll_number?: string | null;
  home_district?: string | null;
  student_type?: "Hostelite" | "Day Scholar" | null;

  current_country?: string | null;
  current_city?: string | null;
  current_position?: string | null;
  profession?: string | null;
  current_organization?: string | null;
  industry?: string | null;
  experience_years?: number | null;
  employment_status?:
    | "Employed"
    | "Self-Employed"
    | "Business Owner"
    | "Student"
    | "Retired"
    | "Not Working"
    | null;

  phone?: string | null;
  linkedin_url?: string | null;
  languages?: string[] | null;
  bio?: string | null;
  achievements?: string | null;
  featured_in_presentation?: boolean | null;
  available_for_mentoring?: boolean | null;

  verification_status: "pending" | "basic" | "full" | "rejected";
  verification_score: number;
  verification_answers?: {
    houses?: string;
    teachers?: string;
    staff?: string;
    principal?: string;
    established_year?: string;
  } | null;

  approved_at?: string | null;
  verified_by_peers?: number | null;
  needs_admin_review?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface VerificationLog {
  id: number;
  profile_id: string;
  action: string;
  previous_status?: string;
  new_status?: string;
  performed_by?: string;
  notes?: string;
  created_at: string;
}