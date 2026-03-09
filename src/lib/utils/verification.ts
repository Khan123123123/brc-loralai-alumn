import type { VerificationAnswers } from "@/types/database";

export type ProfileScoreInput = {
  full_name?: string | null;
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
  languages?: string[] | null;
  bio?: string | null;
  achievements?: string | null;
  verification_answers?: VerificationAnswers | null;
};

const clean = (value?: string | number | null) =>
  String(value ?? "").trim().toLowerCase();

const hasValue = (value?: string | number | null) =>
  String(value ?? "").trim() !== "";

export function calculateProfileScore(data: ProfileScoreInput): number {
  let score = 0;

  if (hasValue(data.full_name)) score += 12;
  if (hasValue(data.entry_year)) score += 8;
  if (hasValue(data.graduation_year)) score += 8;
  if (hasValue(data.home_district)) score += 6;
  if (hasValue(data.student_type)) score += 4;
  if (hasValue(data.roll_number)) score += 4;

  if (hasValue(data.current_city)) score += 8;
  if (hasValue(data.current_country)) score += 4;
  if (hasValue(data.current_position)) score += 8;
  if (hasValue(data.profession)) score += 6;
  if (hasValue(data.current_organization)) score += 6;
  if (hasValue(data.industry)) score += 4;
  if (hasValue(data.employment_status)) score += 3;

  if (hasValue(data.phone)) score += 5;
  if (hasValue(data.linkedin_url)) score += 5;
  if (data.languages && data.languages.length > 0) score += 4;
  if (hasValue(data.bio)) score += 4;
  if (hasValue(data.achievements)) score += 3;

  const answers = data.verification_answers || {};
  if (clean(answers.houses).length >= 2) score += 4;
  if (clean(answers.teachers_with_subjects).length >= 2) score += 4;
  if (clean(answers.staff_member).length >= 2) score += 4;
  if (clean(answers.principal).length >= 2) score += 4;
  if (clean(answers.hostel_after_principal).length >= 2) score += 4;
  if (clean(answers.other_proof).length >= 2) score += 4;

  return Math.min(score, 100);
}

export function isProfileComplete(data: ProfileScoreInput): boolean {
  return Boolean(
    hasValue(data.full_name) &&
      hasValue(data.entry_year) &&
      hasValue(data.graduation_year) &&
      hasValue(data.home_district) &&
      hasValue(data.current_city) &&
      hasValue(data.current_position)
  );
}

export function getAccessLevelFromProfile(
  data: ProfileScoreInput
): "limited" | "full" {
  const score = calculateProfileScore(data);
  const complete = isProfileComplete(data);

  if (complete && score >= 70) {
    return "full";
  }

  return "limited";
}

export function getLegacyVerificationStatus(
  accessLevel: "limited" | "full",
  adminStatus: "pending" | "approved" | "rejected"
): "pending" | "full" | "rejected" {
  if (adminStatus === "rejected") return "rejected";
  if (accessLevel === "full" && adminStatus === "approved") return "full";
  return "pending";
}