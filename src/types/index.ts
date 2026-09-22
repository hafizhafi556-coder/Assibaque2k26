export type TeamId = 'nayro' | 'zayro' | 'lucero';

export type UserRole = 'public' | 'team_manager' | 'judge' | 'admin';

export type Language = 'en' | 'ml';

export type ThemeMode = 'light' | 'dark';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  teamId?: TeamId;
  judgeId?: string;
}

export interface Student {
  id: string;
  student_id: string;
  admission_number: string;
  chest_number: string;
  student_name: string;
  gender: 'male' | 'female';
  class: string;
  division: string;
  category?: string;
  team: TeamId;
  phone: string;
  photo_url?: string;
  student_photo?: string;
  status: 'active' | 'inactive';
}

export type PosterStatus = 'Generated' | 'Published' | 'Archived';
export type PosterAspectRatio = '4:5' | '9:16' | '1:1';

export interface ResultPosterRecord {
  poster_id: string;
  result_id?: string;
  programme_id: string;
  poster_url?: string;
  generated_at: string;
  generated_by: string;
  status: PosterStatus;
  aspect_ratio?: PosterAspectRatio;
  institution_name?: string;
  fest_name?: string;
  fest_motto?: string;
  fest_year?: string;
  fest_logo?: string;
  custom_title?: string;
  template_type?: 'standard' | 'podium' | 'portrait';
}

export interface Team {
  id: TeamId;
  name: string;
  displayNameMl: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  slogan: string;
  sloganMl: string;
  logo: string;
  // Computed values
  totalPoints: number;
  rank: number;
  goldCount: number;
  silverCount: number;
  bronzeCount: number;
  studentsCount: number;
  programsCount: number;
  completedResultsCount: number;
}

export interface Category {
  id: string;
  code: string;
  name: string;
  nameMl: string;
  description: string;
}

export type EventCategory = 'GENERAL' | 'SUB_JUNIOR' | 'JUNIOR' | 'SENIOR' | 'HIFZ' | string;
export type EventType = 'stage' | 'non_stage' | 'off_stage';

export interface JudgingCriterion {
  id: string;
  name: string;
  maxMarks: number;
}

export type ProgrammeStatus = 'upcoming' | 'live' | 'completed' | 'cancelled' | 'scheduled' | 'ongoing' | 'published';

export type ProgrammeCriteriaType = 'individual' | 'group' | 'general';

export interface Programme {
  id: string;
  programme_id?: string;
  programme_code: string;
  programme_name: string;
  programme_name_ml?: string;
  category: string; // Category code or name
  sub_category?: string;
  language?: string;
  class_group?: string;
  type: 'individual' | 'group' | 'general' | 'stage' | 'non_stage' | 'off_stage';
  section?: 'individual' | 'group' | 'general';
  criteria_type?: ProgrammeCriteriaType;
  maximum_marks: number;
  team_points?: number; // default max or multiplier
  judge_id?: string;
  venue: string;
  scheduled_date?: string;
  scheduled_time: string; // e.g. "2026-09-22 09:30" or "10:00 AM"
  status: ProgrammeStatus;
  criteria: JudgingCriterion[];
}

export type ParticipantStatus = 'registered' | 'present' | 'absent' | 'disqualified' | 'completed';

export interface Participant {
  id: string;
  participant_id: string;
  student_id: string;
  programme_id: string;
  chest_number: string;
  team: TeamId;
  status: ParticipantStatus;
}

export interface Judge {
  id: string;
  judge_id?: string;
  name: string;
  specialization: string;
  phone: string;
  email?: string;
  username?: string;
  password?: string;
  assignedProgrammes: string[]; // programme ids
}

export type ResultStatus = 'draft' | 'submitted' | 'verified' | 'published';

export interface Result {
  id: string;
  result_id?: string;
  programme_id: string;
  participant_id: string;
  student_id: string;
  chest_number: string;
  team: TeamId;
  scores: Record<string, number>; // criterionId -> marks
  total_marks: number;
  grade: string;
  position: 1 | 2 | 3 | null;
  points_awarded: number;
  judge_id: string;
  remarks: string;
  status: ResultStatus;
  is_locked: boolean;
  published_date?: string;
  submitted_date?: string;
  verified_by?: string;
  published_by?: string;
}

export interface CriterionPoints {
  first: number;
  second: number;
  third: number;
}

export interface GradePoints {
  A: number;
  B: number;
  C: number;
}

export interface PointConfig {
  individual: CriterionPoints; // INDIVIDUAL 5, 3, 1
  group: CriterionPoints;      // GROUP 10, 5, 3
  general: CriterionPoints;    // GENERAL 15, 8, 5
  grades: GradePoints;         // A = 5, B = 3, C = 1
  first?: number;
  second?: number;
  third?: number;
  participation?: number;
  specialAward?: number;
  tieHandling?: 'standard' | 'shared';
}

export type CertificateType = 'achievement' | 'participation' | 'special_award';
export type CertificateTheme = 'emerald' | 'navy' | 'maroon' | 'charcoal' | 'ivory';

export interface FestSettings {
  festName: string;
  festNameMl: string;
  fest_name?: string;
  festYear: string;
  fest_year?: string;
  festTheme: string;
  festThemeMl: string;
  festMotto?: string;
  fest_motto?: string;
  festLogo: string;
  fest_logo?: string;
  festDescription: string;
  startDate: string;
  endDate: string;
  institutionName: string;
  institutionNameMl: string;
  institution_name?: string;
  institutionLogo: string;
  contactInformation: string;
  pointScheme: PointConfig;

  // Programme Registration Lock Controls
  registration_locked?: boolean;
  registration_lock_message?: string;
  registration_lock_message_ml?: string;

  // Signatory & Certificate Settings
  fest_controller_name?: string;
  fest_controller_designation?: string;
  fest_controller_signature?: string;
  vice_principal_name?: string;
  vice_principal_designation?: string;
  vice_principal_signature?: string;
  certificate_prefix?: string;
  certificate_theme?: CertificateTheme;
  certificate_show_photo?: boolean;
  certificate_show_qr?: boolean;
  certificate_show_marks?: boolean;
  certificate_show_grade?: boolean;
  certificate_show_code?: boolean;
  certificate_issue_date?: string;
}

export interface Announcement {
  id: string;
  title: string;
  titleMl?: string;
  title_ml?: string;
  content: string;
  contentMl?: string;
  content_ml?: string;
  category?: 'general' | 'result' | 'programme' | 'urgent';
  priority?: 'urgent' | 'high' | 'normal' | 'low';
  timestamp?: string;
  created_at?: string;
  isPinned?: boolean;
  is_pinned?: boolean;
}

export interface Certificate {
  id: string;
  certificate_number: string;
  certificate_type: CertificateType;
  title?: string;
  student_id: string;
  student_name: string;
  chest_number: string;
  class_name?: string;
  student_photo?: string;
  programme_id: string;
  programme_code?: string;
  programme_name: string;
  category?: string;
  position?: 1 | 2 | 3 | null;
  grade?: string;
  marks?: number;
  max_marks?: number;
  special_award_name?: string;
  team: TeamId;
  team_name?: string;
  fest_name: string;
  fest_motto?: string;
  fest_logo?: string;
  year: string;
  date: string;
  institution_name: string;
  fest_controller_name?: string;
  fest_controller_designation?: string;
  fest_controller_signature?: string;
  vice_principal_name?: string;
  vice_principal_designation?: string;
  vice_principal_signature?: string;
  theme?: CertificateTheme;
  show_photo?: boolean;
  show_qr?: boolean;
  show_marks?: boolean;
  show_grade?: boolean;
  status: 'active' | 'revoked';
  created_at?: string;
  qr_verification_url?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  details: string;
  performedBy?: string;
  user_name?: string;
  role?: string;
  user_role?: string;
  timestamp: string;
}
