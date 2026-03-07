import type { AdminStatus, Profile } from "@/types/database";

export function normalizeAdminStatus(
  profile?: Pick<Profile, "admin_status" | "verification_status"> | null
): AdminStatus {
  if (profile?.admin_status === "approved") return "approved";
  if (profile?.admin_status === "rejected") return "rejected";

  if (profile?.verification_status === "full") return "approved";
  if (profile?.verification_status === "rejected") return "rejected";

  return "pending";
}

export function normalizeAccessLevel(
  profile?: Pick<Profile, "access_level" | "verification_status"> | null
): "limited" | "full" {
  if (profile?.access_level === "full") return "full";
  if (profile?.verification_status === "full") return "full";
  return "limited";
}

export function isApproved(
  profile?: Pick<Profile, "admin_status" | "verification_status"> | null
) {
  return normalizeAdminStatus(profile) === "approved";
}

export function hasFullAccess(
  profile?: Pick<Profile, "access_level" | "admin_status" | "verification_status"> | null
) {
  return (
    normalizeAccessLevel(profile) === "full" &&
    normalizeAdminStatus(profile) === "approved"
  );
}

export function hasLimitedAccess(
  profile?: Pick<Profile, "access_level" | "admin_status" | "verification_status"> | null
) {
  return !hasFullAccess(profile);
}

export function canAppearInDirectory(
  profile?: Pick<Profile, "show_in_directory"> | null
) {
  return profile?.show_in_directory !== false;
}

export function canViewPublicContactField(
  fieldIsPublic?: boolean | null,
  viewerHasFullAccess?: boolean
) {
  return Boolean(fieldIsPublic) && Boolean(viewerHasFullAccess);
}

export function getAccessLabel(
  profile?: Pick<Profile, "access_level" | "admin_status" | "verification_status"> | null
) {
  return hasFullAccess(profile) ? "Full Access" : "Limited Access";
}