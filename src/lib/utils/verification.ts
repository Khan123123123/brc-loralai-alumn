// Auto-verification scoring - ONLY pending or full
export function calculateProfileScore(profile: any): number {
  let score = 0;
  
  // Basic BRC info (40 points)
  if (profile.full_name?.length > 3) score += 10;
  if (profile.entry_year && profile.entry_year > 1980) score += 10;
  if (profile.graduation_year && profile.graduation_year > profile.entry_year) score += 10;
  if (profile.home_district) score += 10;
  
  // Professional info (30 points)
  if (profile.current_position?.length > 3) score += 10;
  if (profile.profession?.length > 3) score += 10;
  if (profile.current_organization?.length > 3) score += 10;
  
  // Contact & Bio (10 points)
  if (profile.phone || profile.linkedin_url) score += 10;
  if (profile.bio?.length > 50) score += 5; // Bonus
  
  // Verification answers - Auto checked (20 points max)
  const answers = profile.verification_answers || {};
  
  // Q1: House names (5 points)
  if (checkHouses(answers.houses)) score += 5;
  
  // Q2: Teachers (5 points)
  if (checkTeachers(answers.teachers)) score += 5;
  
  // Q3: Staff (5 points)
  if (checkStaff(answers.staff)) score += 5;
  
  // Q4: Principal OR Establishment year (5 points)
  if (checkPrincipal(answers.principal) || checkEstablishment(answers.established_year)) score += 5;
  
  return Math.min(score, 100);
}

// Auto-check: Must mention 2+ valid house names
function checkHouses(answer: string): boolean {
  if (!answer || answer.length < 5) return false;
  const validHouses = ['jinnah', 'iqbal', 'liaquat', 'fatima', 'quaid', 'unity', 'faith'];
  const lower = answer.toLowerCase();
  let matches = 0;
  validHouses.forEach(house => {
    if (lower.includes(house)) matches++;
  });
  return matches >= 2;
}

// Auto-check: Must mention 2+ teacher names
function checkTeachers(answer: string): boolean {
  if (!answer || answer.length < 10) return false;
  const names = answer.split(/,|\band\b/).filter(n => n.trim().length > 2);
  return names.length >= 2;
}

// Auto-check: Must mention known staff or detailed info
function checkStaff(answer: string): boolean {
  if (!answer || answer.length < 5) return false;
  const lower = answer.toLowerCase();
  const knownStaff = ['ghulam nabi', 'nabi', 'mess', 'guard', 'peon', 'warden'];
  return knownStaff.some(name => lower.includes(name)) || answer.length > 15;
}

// Auto-check: Principal name
function checkPrincipal(answer: string): boolean {
  if (!answer || answer.length < 3) return false;
  const lower = answer.toLowerCase();
  const valid = ['principal', 'headmaster', 'khan', 'ahmed', 'malik', 'qaiser', 'shah', 'director'];
  return valid.some(v => lower.includes(v));
}

// Auto-check: Establishment year (BRC established 1982)
function checkEstablishment(answer: string): boolean {
  if (!answer) return false;
  return answer.includes('1982') || answer.includes('1983') || answer.includes('80');
}

// ONLY two statuses: pending or full
export function getVerificationStatus(score: number): 'full' | 'pending' {
  if (score >= 70) return "full";
  return "pending";
}

// Helper to check if user has access
export function hasFullAccess(status: string): boolean {
  return status === 'full';
}

// Helper to check if pending
export function isPending(status: string): boolean {
  return status === 'pending' || !status;
}