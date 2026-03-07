type VerificationAnswers = {
  houses?: string;
  teachers?: string;
  staff?: string;
  principal?: string;
  established_year?: string;
};

type ProfileScoreInput = {
  full_name?: string;
  entry_year?: string | number | null;
  graduation_year?: string | number | null;
  home_district?: string | null;
  student_type?: string | null;
  roll_number?: string | null;
  current_country?: string | null;
  current_city?: string | null;
  current_position?: string | null;
  profession?: string | null;
  current_organization?: string | null;
  industry?: string | null;
  employment_status?: string | null;
  phone?: string | null;
  linkedin_url?: string | null;
  languages?: string[];
  bio?: string | null;
  achievements?: string | null;
  verification_answers?: VerificationAnswers;
};

const clean = (value?: string | null) => (value || "").trim().toLowerCase();

export function calculateProfileScore(data: ProfileScoreInput): number {
  let score = 0;

  if (clean(data.full_name)) score += 10;
  if (data.entry_year) score += 8;
  if (data.graduation_year) score += 8;
  if (clean(data.home_district)) score += 6;
  if (clean(data.student_type)) score += 5;
  if (clean(data.roll_number)) score += 4;

  if (clean(data.current_city)) score += 8;
  if (clean(data.current_country)) score += 4;
  if (clean(data.current_position)) score += 8;
  if (clean(data.profession)) score += 6;
  if (clean(data.current_organization)) score += 6;
  if (clean(data.industry)) score += 4;
  if (clean(data.employment_status)) score += 3;
  if (clean(data.phone)) score += 5;
  if (clean(data.linkedin_url)) score += 5;
  if (data.languages && data.languages.length > 0) score += 4;
  if (clean(data.bio)) score += 4;
  if (clean(data.achievements)) score += 2;

  const answers = data.verification_answers || {};

  if (clean(answers.houses).length >= 2) score += 4;
  if (clean(answers.teachers).length >= 2) score += 4;
  if (clean(answers.staff).length >= 2) score += 4;
  if (clean(answers.principal).length >= 2) score += 4;
  if (clean(answers.established_year).length >= 2) score += 4;

  return Math.min(score, 100);
}

export function getVerificationStatus(score: number): "pending" | "basic" | "full" {
  if (score >= 70) return "full";
  if (score >= 40) return "basic";
  return "pending";
}

export function hasFullAccess(status?: string | null): boolean {
  return status === "full";
}