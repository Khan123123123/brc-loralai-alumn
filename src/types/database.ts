export type VerificationStatus = "pending" | "basic" | "full" | "rejected";
export type AccessLevel = "none" | "limited" | "full";
export type AdminStatus = "pending" | "approved" | "rejected";
export type AccountType = "Alumni" | "Faculty" | "Student";

export interface Job {
  title: string;
  company: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  description?: string;
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  start_date: string;
  end_date?: string;
}

export interface VerificationAnswers {
  houses?: string;
  teachers?: string;
  staff?: string;
  principal?: string;
  established_year?: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  slug?: string;
  avatar_url?: string;
  account_type: AccountType;
  
  // New Engaging Fields
  languages?: string[];
  achievements_brc?: string;
  achievements_after?: string;
  favorite_teacher?: string;
  message_for_koharians?: string;

  // BRC Details
  entry_year?: number;
  graduation_year?: number;
  house?: string;
  roll_number?: string;
  subjects_taught?: string[];

  // Professional
  profession?: string;
  industry?: string;
  current_position?: string;
  current_organization?: string;
  expertise_areas?: string[];
  job_history?: Job[];
  higher_education?: Education[];

  // Location
  current_city?: string;
  current_country?: string;
  home_city?: string;
  home_district?: string;

  // Contact (Privacy Protected)
  phone_number?: string;
  linkedin_url?: string;
  twitter_url?: string;
  website_url?: string;

  // Settings & Status
  show_email: boolean;
  show_phone: boolean;
  available_for_mentoring: boolean;
  show_in_directory: boolean;

  // System
  verification_status: VerificationStatus;
  access_level: AccessLevel;
  admin_status: AdminStatus;
  verification_answers?: VerificationAnswers;
  is_profile_complete: boolean;
  
  created_at: string;
  updated_at: string;
  approved_at?: string;
  deep_search_text?: string;
  bio?: string;
  achievements?: string;
}