import type { Profile } from "@/types/database";
import { canViewPublicContactField, hasFullAccess } from "./access";

export function slugifyProfileName(fullName: string, graduationYear?: number | null) {
  const base = `${fullName || "member"}-${graduationYear || "alumni"}`
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return base || "member-alumni";
}

export function getDisplayName(profile: Pick<Profile, "full_name" | "email">) {
  return profile.full_name?.trim() || profile.email || "Alumni Member";
}

export function getAvatarFallback(profile: Pick<Profile, "full_name" | "email">) {
  const display = getDisplayName(profile);
  return display.charAt(0).toUpperCase();
}

export function getSafeDirectoryCardData(
  profile: Profile,
  viewerHasFullAccess: boolean
) {
  return {
    id: profile.id,
    slug: profile.slug,
    full_name: profile.full_name,
    graduation_year: profile.graduation_year,
    home_district: profile.home_district,
    current_city: profile.current_city,
    current_country: profile.current_country,
    profession: profile.profession,
    current_position: profile.current_position,
    current_organization: viewerHasFullAccess ? profile.current_organization : null,
    industry: viewerHasFullAccess ? profile.industry : null,
    bio: viewerHasFullAccess ? profile.bio : null,
    achievements: viewerHasFullAccess ? profile.achievements : null,
    available_for_mentoring: viewerHasFullAccess
      ? profile.available_for_mentoring
      : false,
    featured_in_presentation: viewerHasFullAccess
      ? profile.featured_in_presentation
      : false,
    profile_photo_url: profile.profile_photo_url || profile.avatar_url,
  };
}

export function getVisibleContactFields(
  profile: Profile,
  viewerProfile?: Pick<Profile, "access_level" | "admin_status" | "verification_status"> | null
) {
  const viewerHasFullAccess = hasFullAccess(viewerProfile);

  // Checks both the new show_email flag and the old show_email_publicly flag
  const isEmailVisible = profile.show_email ?? profile.show_email_publicly;
  const isPhoneVisible = profile.show_phone ?? profile.show_phone_publicly;

  return {
    email: canViewPublicContactField(isEmailVisible, viewerHasFullAccess)
      ? profile.email
      : null,
    phone: canViewPublicContactField(isPhoneVisible, viewerHasFullAccess)
      ? (profile.phone || profile.phone_number)
      : null,
    linkedin_url: canViewPublicContactField(
      profile.show_linkedin_publicly,
      viewerHasFullAccess
    )
      ? profile.linkedin_url
      : null,
  };
}