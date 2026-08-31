/**
 * MiRendimiento - Types and Interfaces
 * Sistema ético y transparente de análisis de rendimiento académico
 */

export type DataSufficiency = 'sufficient' | 'incomplete' | 'no_data';

export type DataOrigin = 'student' | 'official' | 'verified' | 'system_projection';

export type TrendDirection = 'improving' | 'declining' | 'stable' | 'insufficient_data';

export type GradeClassification = 'bajo' | 'basico' | 'alto' | 'superior';

export type GradeType = 
  | 'examen' 
  | 'trabajo' 
  | 'taller' 
  | 'quiz' 
  | 'proyecto' 
  | 'exposicion' 
  | 'actividad_clase' 
  | 'actividad'
  | 'evaluacion' 
  | 'participacion' 
  | 'recuperacion' 
  | 'otro';

export interface GradeEntry {
  id: string;
  subjectId: string;
  periodId: string;
  title: string;
  score: number; // Decimal: 1.0 - 5.0
  maxScore?: number; // Default: 5.0
  weightPercent?: number; // For weighted average (e.g. 20%)
  type: GradeType;
  date: string; // ISO date string (YYYY-MM-DD)
  origin: DataOrigin;
  notes?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Subject {
  id: string;
  name: string;
  code?: string;
  professorName?: string;
  calculationMethod: 'simple' | 'weighted';
  targetGrade?: number; // e.g. 4.0
  colorTag: string;
  observations?: string;
  isCustom?: boolean;
}

export interface AcademicPeriod {
  id: string;
  name: string; // '1° Período', '2° Período', '3° Período', '4° Período'
  order: number;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
}

export interface ScaleRange {
  id: GradeClassification;
  label: string;
  min: number;
  max: number;
  color: string;
  badgeBg: string;
  badgeText: string;
  description: string;
}

export interface GradingSystemConfig {
  institutionName: string;
  minGrade: number; // 1.0
  maxGrade: number; // 5.0
  passingGrade: number; // 3.0
  decimalPrecision: number; // 1 or 2
  minGradesForSufficiency: number; // e.g. 3 minimum registered grades
  minWeightPercentForSufficiency: number; // e.g. 50%
  ranges: ScaleRange[];
}

export interface SubjectStats {
  subjectId: string;
  subjectName: string;
  periodId: string;
  average: number | null;
  totalGrades: number;
  totalWeightPercent: number;
  sufficiency: DataSufficiency;
  sufficiencyMessage: string;
  classification: ScaleRange | null;
  trend: TrendDirection;
  trendDelta: number | null;
  trendMessage: string;
  targetGrade?: number;
  targetDelta?: number; // e.g. -0.4 (faltan 0.4 para la meta)
  targetStatus?: 'achieved' | 'near' | 'in_progress' | 'none';
  originBreakdown: {
    studentCount: number;
    verifiedCount: number;
  };
  lastUpdateDate?: string;
}

export interface PeriodStats {
  periodId: string;
  periodName: string;
  generalAverage: number | null;
  subjectsCount: number;
  evaluatedSubjectsCount: number;
  sufficientSubjectsCount: number;
  incompleteSubjectsCount: number;
  noDataSubjectsCount: number;
  classification: ScaleRange | null;
  deltaVsPrevious: number | null;
  deltaVsFirst: number | null;
  trend: TrendDirection;
}

export interface AcademicAlert {
  id: string;
  type: 'incomplete_data' | 'no_data' | 'improvement' | 'decline' | 'goal_near' | 'verification_needed' | 'attention_priority';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'success' | 'alert';
  subjectId?: string;
  subjectName?: string;
  actionHint?: string;
}

export interface ChangeLogEntry {
  id: string;
  timestamp: string; // ISO datetime when registered in app
  registeredAt?: string;
  entityType: 'grade' | 'subject' | 'period' | 'goal' | 'settings';
  entityId: string;
  entityTitle: string;
  action: 'create' | 'update' | 'delete' | 'restore';
  author: 'Estudiante' | 'Docente' | 'Sistema';
  fieldChanged?: string;
  oldValue?: string | number;
  newValue?: string | number;
  description: string;
  // Specific audit fields for historical transparency
  activityDate?: string;
  subjectName?: string;
  periodName?: string;
  gradeType?: GradeType;
  score?: number;
  origin?: DataOrigin;
}

export interface AcademicGoal {
  id: string;
  subjectId?: string; // undefined means general average goal
  periodId: string;
  targetGrade: number;
  note?: string;
  createdAt: string;
}

export interface SimulationScenario {
  subjectId: string;
  targetGrade: number;
  hypotheticalGrades: {
    title: string;
    score: number;
    weightPercent?: number;
    type: GradeType;
  }[];
}
