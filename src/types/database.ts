export interface Profile {
  id: string;
  email: string;
  full_name: string;
  entry_year: number;
  graduation_year: number;
  program: string;
  education_level?: string;
  regular_self_finance?: 'Regular' | 'Self-Finance';
  roll_number?: string;
  home_district?: string;
  student_type?: 'Hostelite' | 'Day Scholar';
  current_country?: string;
  current_city: string;
  current_position?: string;
  profession?: string;
  current_organization?: string;
  industry?: string;
  experience_years?: number;
  employment_status?: 'Employed' | 'Self-Employed' | 'Business Owner' | 'Student' | 'Retired' | 'Not Working';
  phone?: string;
  linkedin_url?: string;
  open_to?: string[];
  languages?: string[];
  bio?: string;
  achievements?: string;
  featured_in_presentation?: boolean;
  available_for_mentoring?: boolean;
  verification_status: 'pending' | 'basic' | 'full' | 'rejected';
  verification_score: number;
  verification_answers: { houses?: string; teachers?: string; staff?: string; ghulam_nabi?: string; };
  verified_by_peers: number;
  needs_admin_review: boolean;
  created_at: string;
  updated_at: string;
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
