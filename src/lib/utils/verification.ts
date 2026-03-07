import type { Profile, VerificationAnswers } from "@/types/database";

export type ProfileScoreInput = Partial<
  Pick<
    Profile,
    | "full_name"
    | "entry_year"
    | "graduation_year"
    | "home_district"
    | "student_type"
    | "roll_number"
    | "current_country"
    | "current_city"
    | "current_position"
    | "profession"
    | "current_organization"
    | "industry"
    | "employment_status"
    | "phone"
    | "linkedin_url"
    | "languages"
    | "bio"
    | "achievements"
  >
> & {
  verification_answers?: VerificationAnswers | null;
};

const clean = (value?: string | null) => (value || "").trim().toLowerCase();

export function calculateProfileScore(data: ProfileScoreInput): number {
  let score = 0;

  if (clean(data.full_name)) score += 12;
  if (data.entry_year) score += 8;
  if (data.graduation_year) score += 8;
  if (clean(data.home_district)) score += 6;
  if (clean(data.student_type)) score += 4;
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
  if (clean(data.achievements)) score += 3;

  const answers = data.verification_answers || {};
  if (clean(answers.houses).length >= 2) score += 4;
  if (clean(answers.teachers).length >= 2) score += 4;
  if (clean(answers.staff).length >= 2) score += 4;
  if (clean(answers.principal).length >= 2) score += 4;
  if (clean(answers.established_year).length >= 2) score += 4;

  return Math.min(score, 100);
}

export function isProfileComplete(data: ProfileScoreInput): boolean {
  return Boolean(
    clean(data.full_name) &&
      data.entry_year &&
      data.graduation_year &&
      clean(data.home_district) &&
      clean(data.current_city) &&
      clean(data.current_position)
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