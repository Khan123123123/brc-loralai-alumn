export interface VerificationAnswers { houses?: string; teachers?: string; staff?: string; ghulam_nabi?: string; }

export const evaluateVerificationAnswers = (answers: VerificationAnswers): number => {
  let score = 0;
  if (!answers) return score;
  
  if (answers.houses) {
    const houses = answers.houses.toLowerCase();
    const brcHouses = ['quaid', 'iqbal', 'sir syed', 'rehman', 'jinnah', 'liaquat'];
    let matches = 0;
    brcHouses.forEach(h => { if (houses.includes(h)) matches++; });
    if (matches >= 2) score += 10;
    if (matches >= 3) score += 5;
  }
  
  if (answers.teachers) {
    const teachers = answers.teachers.toLowerCase();
    const subjects = ['math', 'physics', 'chemistry', 'biology', 'english', 'urdu', 'islamiat', 'computer'];
    let matches = 0;
    subjects.forEach(s => { if (teachers.includes(s)) matches++; });
    if (matches >= 2) score += 10;
    if (matches >= 4) score += 5;
  }
  
  if (answers.staff) {
    const staff = answers.staff.toLowerCase();
    const keywords = ['peon', 'mess', 'worker', 'clerk', 'warden', 'guards', 'safai', 'cook'];
    let matches = 0;
    keywords.forEach(k => { if (staff.includes(k)) matches++; });
    if (matches >= 2) score += 10;
    if (matches >= 3) score += 5;
  }
  
  if (answers.ghulam_nabi) {
    const ans = answers.ghulam_nabi.toLowerCase();
    if (ans.includes('hostel warden') || ans.includes('provost') || ans.includes('administrator')) score += 15;
    else if (ans.includes('warden') || ans.includes('hostel')) score += 10;
    else if (ans.includes('staff') || ans.includes('employee')) score += 5;
  }
  
  return Math.min(score, 60);
};

export const calculateProfileScore = (profile: any): number => {
  let score = 0;
  if (profile.full_name && profile.entry_year && profile.graduation_year && profile.program && profile.current_city && profile.current_position) score += 20;
  if (profile.verification_answers) score += evaluateVerificationAnswers(profile.verification_answers);
  if (profile.verified_by_peers) score += Math.min(profile.verified_by_peers * 10, 20);
  return Math.min(score, 100);
};

export const getVerificationStatus = (score: number) => score >= 70 ? 'full' : score >= 50 ? 'basic' : 'pending';
