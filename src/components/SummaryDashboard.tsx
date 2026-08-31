import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Target,
  BookOpen,
  ArrowRight,
  Sparkles,
  Info,
  Clock,
  ExternalLink,
  PlusCircle,
  Award,
  Layers,
  Activity
} from 'lucide-react';
import {
  Subject,
  AcademicPeriod,
  GradeEntry,
  GradingSystemConfig,
  SubjectStats,
  PeriodStats,
  AcademicAlert,
  AcademicGoal,
} from '../types';
import { formatScoreSpanish } from '../lib/academicEngine';

interface SummaryDashboardProps {
  currentPeriod: AcademicPeriod;
  periodStats: PeriodStats;
  subjectStats: SubjectStats[];
  subjects: Subject[];
  alerts: AcademicAlert[];
  goals: AcademicGoal[];
  config: GradingSystemConfig;
  onOpenNewGrade: () => void;
  onSelectSubject: (subjectId: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const SummaryDashboard: React.FC<SummaryDashboardProps> = ({
  currentPeriod,
  periodStats,
  subjectStats,
  subjects,
  alerts,
  goals,
  config,
  onOpenNewGrade,
  onSelectSubject,
  onNavigateTab,
}) => {
  // Meta general para este período
  const generalGoal = goals.find(
    (g) => g.periodId === currentPeriod.id && !g.subjectId
  );
  const targetGradeValue = generalGoal ? generalGoal.targetGrade : 4.0;
  const currentAvgNum = periodStats.generalAverage || 0;
  const goalProgressPercent = Math.min(100, Math.round((currentAvgNum / targetGradeValue) * 100));

  // Helper for 2-letter subject monograms
  const getSubjectMonogram = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Helper for border and badge colors based on classification and sufficiency
  const getSubjectStyle = (stat: SubjectStats) => {
    if (stat.sufficiency === 'no_data') {
      return {
        borderClass: 'border-l-4 border-l-slate-400',
        monogramBg: 'bg-slate-100 text-slate-600',
        badgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
        badgeText: 'Sin datos',
        textColor: 'text-slate-500',
      };
    }
    if (stat.average !== null && stat.average < config.passingGrade) {
      return {
        borderClass: 'border-l-4 border-l-red-500',
        monogramBg: 'bg-red-50 text-red-500',
        badgeBg: 'bg-red-100 text-red-700 border-red-200',
        badgeText: 'Bajo',
        textColor: 'text-red-600',
      };
    }
    if (stat.average !== null && stat.average < 3.8) {
      return {
        borderClass: 'border-l-4 border-l-amber-500',
        monogramBg: 'bg-amber-50 text-amber-600',
        badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
        badgeText: 'Básico',
        textColor: 'text-amber-700',
      };
    }
    if (stat.average !== null && stat.average >= 4.5) {
      return {
        borderClass: 'border-l-4 border-l-indigo-500',
        monogramBg: 'bg-indigo-50 text-indigo-600',
        badgeBg: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        badgeText: 'Superior',
        textColor: 'text-indigo-700',
      };
    }
    return {
      borderClass: 'border-l-4 border-l-emerald-500',
      monogramBg: 'bg-emerald-50 text-emerald-600',
      badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      badgeText: 'Alto',
      textColor: 'text-emerald-700',
    };
  };

  // Subjects needing highest attention or no data
  const attentionSubjects = subjectStats.filter(
    (s) => s.average !== null && s.average < config.passingGrade
  );

  return (
    <div className="space-y-6">
      {/* Crucial Transparency Distinction Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                Principio Fundamental de Transparencia
              </span>
            </div>
            <h3 className="text-base font-bold text-slate-900 font-display">
              Tu promedio estimado vs Promedio oficial
            </h3>
            <p className="text-xs text-slate-500 max-w-2xl">
              La aplicación calcula tu rendimiento en base a las <strong>calificaciones que voluntariamente registras</strong> (exámenes, talleres, quices). Nunca presenta un cálculo parcial como si fuera el boletín oficial emitido por la institución.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center min-w-[140px]">
              <span className="text-[10px] uppercase font-bold text-indigo-700 block">
                📝 Según tus datos
              </span>
              <div className="text-2xl font-black text-slate-900 font-display">
                {formatScoreSpanish(periodStats.generalAverage)}
              </div>
              <span className="text-[10px] text-slate-400">Promedio Calculado</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center min-w-[140px]">
              <span className="text-[10px] uppercase font-bold text-slate-600 block">
                🏫 Fuente Oficial
              </span>
              <div className="text-xs font-semibold text-slate-700 mt-1">
                Boletín del Colegio
              </div>
              <span className="text-[10px] text-slate-400">Emisión institucional</span>
            </div>
          </div>
        </div>
      </div>

      {/* 1. Geometric Balance - Top 4 Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Metric 1: Tendencia / Delta */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">Tendencia</p>
            <p className="text-lg font-bold text-slate-800">
              {periodStats.deltaVsPrevious !== null ? (
                <>
                  {periodStats.deltaVsPrevious >= 0 ? '+' : ''}
                  {formatScoreSpanish(periodStats.deltaVsPrevious)} pts
                </>
              ) : (
                'Período inicial'
              )}
            </p>
          </div>
        </div>

        {/* Metric 2: Materias Registradas */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-lg shrink-0">
            {subjects.length}
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">Materias</p>
            <p className="text-lg font-bold text-slate-800">
              {periodStats.evaluatedSubjectsCount} Evaluadas
            </p>
          </div>
        </div>

        {/* Metric 3: Alertas / Cobertura de Información */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">Alertas</p>
            <p className="text-lg font-bold text-slate-800">
              {periodStats.incompleteSubjectsCount > 0 || periodStats.noDataSubjectsCount > 0
                ? `${periodStats.incompleteSubjectsCount + periodStats.noDataSubjectsCount} Pendientes`
                : 'Sin alertas'}
            </p>
          </div>
        </div>

        {/* Metric 4: Meta General */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
            <Target className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">
                Meta {formatScoreSpanish(targetGradeValue)}
              </p>
              <span className="text-[11px] font-bold text-blue-600">{goalProgressPercent}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${goalProgressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main 3-Column Layout (2 Cols Subjects Left, 1 Col Dark Slate Analysis Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Geometric Subject Cards List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 font-display">
              Desglose por Asignatura ({currentPeriod.name})
            </h2>
            <button
              onClick={() => onNavigateTab('subjects')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              Ver todas las materias <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {subjectStats.map((stat) => {
              const subj = subjects.find((s) => s.id === stat.subjectId);
              const style = getSubjectStyle(stat);
              const monogram = getSubjectMonogram(stat.subjectName);

              return (
                <div
                  key={stat.subjectId}
                  onClick={() => onSelectSubject(stat.subjectId)}
                  className={`bg-white p-4 rounded-xl border border-slate-200 ${style.borderClass} shadow-sm flex items-center justify-between cursor-pointer hover:border-slate-300 hover:shadow-md transition-all group`}
                >
                  <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                    <div
                      className={`w-10 h-10 ${style.monogramBg} rounded flex items-center justify-center font-bold text-sm shrink-0`}
                    >
                      {monogram}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors text-sm sm:text-base truncate">
                        {stat.subjectName}
                      </h3>
                      <p className="text-xs text-slate-500 truncate">
                        {stat.totalGrades} datos registrados •{' '}
                        {stat.sufficiency === 'sufficient' && (
                          <span className="text-emerald-600 font-medium">Información suficiente</span>
                        )}
                        {stat.sufficiency === 'incomplete' && (
                          <span className="text-amber-600 font-medium">Datos preliminares</span>
                        )}
                        {stat.sufficiency === 'no_data' && (
                          <span className="text-slate-400 font-medium">Sin datos aún</span>
                        )}
                        {subj?.professorName && ` • ${subj.professorName}`}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 ml-3">
                    <div className="text-xl font-black text-slate-900 font-display">
                      {formatScoreSpanish(stat.average)}
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider inline-block ${style.badgeBg}`}
                    >
                      {style.badgeText}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Geometric Dark Slate Analytical Panel */}
        <div className="bg-slate-900 rounded-xl p-6 text-white flex flex-col justify-between shadow-sm space-y-6">
          <div className="space-y-4">
            <h3 className="font-bold text-base flex items-center gap-2 text-white">
              <span className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-pulse" />
              Análisis de Datos y Orientación
            </h3>

            {/* Alert / Notice Card inside Slate Panel */}
            <div className="p-4 bg-slate-800/70 rounded-lg border border-slate-700 space-y-1">
              <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider">
                Alerta de Información
              </p>
              <p className="text-xs text-slate-200 leading-relaxed">
                {periodStats.noDataSubjectsCount > 0
                  ? `Existen ${periodStats.noDataSubjectsCount} materia(s) sin calificaciones registradas. Consulta cordialmente con tu docente para verificar si ya existen actividades evaluadas.`
                  : 'Todas las materias tienen al menos una calificación registrada para este período.'}
              </p>
            </div>

            {/* Achievement / Goal Card */}
            <div className="p-4 bg-indigo-950/60 rounded-lg border border-indigo-500/30 space-y-1">
              <p className="text-[11px] text-indigo-300 uppercase font-bold tracking-wider">
                Logro Cercano
              </p>
              <p className="text-xs text-slate-200 leading-relaxed">
                {periodStats.generalAverage && periodStats.generalAverage < targetGradeValue ? (
                  <>
                    Estás a solo{' '}
                    <span className="font-bold text-white">
                      {formatScoreSpanish(targetGradeValue - periodStats.generalAverage)} puntos
                    </span>{' '}
                    de tu meta general de {formatScoreSpanish(targetGradeValue)}. ¡Mantén el esfuerzo en tus asignaturas clave!
                  </>
                ) : (
                  <>
                    ¡Has superado tu meta general de {formatScoreSpanish(targetGradeValue)} en este período! Continúa manteniendo la constancia en tus evaluaciones.
                  </>
                )}
              </p>
            </div>

            {/* Gemini AI Advisor Promotion Box */}
            <div className="p-4 bg-slate-800/40 rounded-lg border border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-1.5 text-indigo-300">
                  <Sparkles className="w-3.5 h-3.5" />
                  Asesor Académico IA
                </span>
                <span className="text-[10px] text-slate-400">Gemini</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Orientación pedagógica responsable y sin juicios basada en tus notas legítimas.
              </p>
              <button
                onClick={() => onNavigateTab('advisor')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold inline-flex items-center gap-1"
              >
                Abrir consulta ética <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={onOpenNewGrade}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs sm:text-sm transition-all shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 active:scale-98"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Registrar Calificación</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
