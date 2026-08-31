import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  LayoutGrid,
  List,
  PlusCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Trash2,
  Edit2,
  Calculator,
  User,
  Calendar,
  Sparkles,
  Info,
  ShieldCheck,
  ChevronRight,
  ArrowUpDown,
  FileText,
  Clock,
  Layers,
  School
} from 'lucide-react';
import {
  Subject,
  AcademicPeriod,
  GradeEntry,
  GradingSystemConfig,
  SubjectStats,
  DataSufficiency,
  GradeType,
} from '../types';
import { formatScoreSpanish } from '../lib/academicEngine';

interface SubjectsListProps {
  subjects: Subject[];
  subjectStats: SubjectStats[];
  grades: GradeEntry[];
  currentPeriod: AcademicPeriod;
  config: GradingSystemConfig;
  onOpenNewGrade: (preselectedSubjectId?: string) => void;
  onEditGrade: (grade: GradeEntry) => void;
  onDeleteGrade: (gradeId: string) => void;
  onOpenNewSubject: () => void;
  onEditSubject: (subject: Subject) => void;
  onDeleteSubject: (subjectId: string) => void;
  selectedSubjectDetailId: string | null;
  onSelectSubjectDetail: (id: string | null) => void;
}

const GRADE_TYPE_LABELS: Record<GradeType, { label: string; icon: string }> = {
  examen: { label: 'Examen', icon: '📝' },
  trabajo: { label: 'Trabajo', icon: '📄' },
  taller: { label: 'Taller', icon: '🛠️' },
  quiz: { label: 'Quiz', icon: '⚡' },
  proyecto: { label: 'Proyecto', icon: '🚀' },
  exposicion: { label: 'Exposición', icon: '🗣️' },
  actividad_clase: { label: 'Actividad de clase', icon: '✏️' },
  actividad: { label: 'Actividad', icon: '✏️' },
  participacion: { label: 'Participación', icon: '🙋' },
  evaluacion: { label: 'Evaluación', icon: '📋' },
  recuperacion: { label: 'Recuperación', icon: '🔄' },
  otro: { label: 'Otro', icon: '📌' },
};

export const SubjectsList: React.FC<SubjectsListProps> = ({
  subjects,
  subjectStats,
  grades,
  currentPeriod,
  config,
  onOpenNewGrade,
  onEditGrade,
  onDeleteGrade,
  onOpenNewSubject,
  onEditSubject,
  onDeleteSubject,
  selectedSubjectDetailId,
  onSelectSubjectDetail,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sufficiencyFilter, setSufficiencyFilter] = useState<'all' | DataSufficiency>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [detailTypeFilter, setDetailTypeFilter] = useState<string>('all');

  // Filtrado de materias
  const filteredSubjects = subjects.filter((subject) => {
    const matchesSearch =
      subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (subject.professorName && subject.professorName.toLowerCase().includes(searchTerm.toLowerCase()));

    const stat = subjectStats.find((s) => s.subjectId === subject.id);
    const matchesSufficiency =
      sufficiencyFilter === 'all' || (stat && stat.sufficiency === sufficiencyFilter);

    return matchesSearch && matchesSufficiency;
  });

  const activeSubject = subjects.find((s) => s.id === selectedSubjectDetailId);
  const activeSubjectStats = subjectStats.find((s) => s.subjectId === selectedSubjectDetailId);
  const activeSubjectGrades = grades.filter(
    (g) => g.subjectId === selectedSubjectDetailId && g.periodId === currentPeriod.id
  );

  const filteredDetailGrades = activeSubjectGrades.filter((g) => {
    if (detailTypeFilter === 'all') return true;
    return g.type === detailTypeFilter;
  });

  const studentEnteredCount = activeSubjectGrades.filter(
    (g) => g.origin === 'student' || !g.origin
  ).length;
  const officialOrVerifiedCount = activeSubjectGrades.filter(
    (g) => g.origin === 'official' || g.origin === 'verified'
  ).length;

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 font-display">
              Materias y Calificaciones ({currentPeriod.name})
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wider">
              Registro Voluntario
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Registra voluntariamente tus evaluaciones conocidas (exámenes, talleres, trabajos, quices) y consulta tu promedio estimado.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenNewSubject}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nueva Materia</span>
          </button>
          <button
            onClick={() => onOpenNewGrade()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-all shadow-xs shadow-indigo-200"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Registrar Calificación</span>
          </button>
        </div>
      </div>

      {/* Principle & Transparency Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white shadow-sm border border-slate-800 text-xs">
        <div className="flex items-start gap-2.5">
          <div className="p-2 rounded-xl bg-white/10 text-amber-300 shrink-0 font-mono text-sm font-bold">
            📝
          </div>
          <div>
            <h4 className="font-bold text-white text-xs">Datos ingresados por ti</h4>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
              Notas que registraste manualmente tras recibir exámenes, talleres o quices físicos o verbales.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <div className="p-2 rounded-xl bg-white/10 text-emerald-300 shrink-0 font-mono text-sm font-bold">
            🧮
          </div>
          <div>
            <h4 className="font-bold text-white text-xs">Datos calculados</h4>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
              Promedios estimados, tendencias y análisis calculados matemáticamente en tiempo real.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <div className="p-2 rounded-xl bg-white/10 text-sky-300 shrink-0 font-mono text-sm font-bold">
            🏫
          </div>
          <div>
            <h4 className="font-bold text-white text-xs">Promedio oficial institucional</h4>
            <p className="text-[11px] text-slate-300 mt-0.5 leading-snug">
              Emitido formalmente por el colegio en sus boletines de período. Los cálculos de la app son una referencia.
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar materia, docente o código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Filters & View Toggle */}
        <div className="flex items-center gap-2 overflow-x-auto">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium border border-slate-200/60">
            <button
              onClick={() => setSufficiencyFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                sufficiencyFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todas ({subjects.length})
            </button>
            <button
              onClick={() => setSufficiencyFilter('sufficient')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                sufficiencyFilter === 'sufficient'
                  ? 'bg-white text-emerald-800 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🟢 Suficiente
            </button>
            <button
              onClick={() => setSufficiencyFilter('incomplete')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                sufficiencyFilter === 'incomplete'
                  ? 'bg-white text-amber-800 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🟡 Incompleta
            </button>
            <button
              onClick={() => setSufficiencyFilter('no_data')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                sufficiencyFilter === 'no_data'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🔴 Sin datos
            </button>
          </div>

          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/60">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500'
              }`}
              title="Vista en Cuadrícula"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'table' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-500'
              }`}
              title="Vista en Tabla"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid or Table View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSubjects.map((subject) => {
            const stat = subjectStats.find((s) => s.subjectId === subject.id);
            const subjectGrades = grades.filter(
              (g) => g.subjectId === subject.id && g.periodId === currentPeriod.id
            );

            const manualCount = subjectGrades.filter((g) => g.origin === 'student' || !g.origin).length;

            return (
              <div
                key={subject.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all p-5 flex flex-col justify-between group space-y-3"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                        {subject.code || 'Materia'} • {subject.calculationMethod === 'weighted' ? 'Ponderado' : 'Simple'}
                      </span>
                      <h3 className="font-bold text-base text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {subject.name}
                      </h3>
                      {subject.professorName && (
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>{subject.professorName}</span>
                        </p>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Promedio calculado
                      </span>
                      <div className="text-2xl font-black font-display text-slate-900">
                        {formatScoreSpanish(stat?.average)}
                      </div>
                      <span className="text-[10px] text-slate-400">/ 5,0</span>
                    </div>
                  </div>

                  {/* Badges & Status */}
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    {/* Classification Badge */}
                    {stat?.classification ? (
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${stat.classification.badgeBg}`}
                      >
                        {stat.classification.label}
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                        Sin promedio
                      </span>
                    )}

                    {/* Sufficiency Badge */}
                    {stat?.sufficiency === 'sufficient' && (
                      <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                        🟢 Información suficiente
                      </span>
                    )}
                    {stat?.sufficiency === 'incomplete' && (
                      <span className="text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                        🟡 Información parcial
                      </span>
                    )}
                    {stat?.sufficiency === 'no_data' && (
                      <span className="text-[11px] font-medium text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                        🔴 Sin calificaciones
                      </span>
                    )}

                    {/* Trend Badge */}
                    {stat?.trend === 'improving' && (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                        <TrendingUp className="w-3 h-3" /> +{formatScoreSpanish(stat.trendDelta)}
                      </span>
                    )}
                    {stat?.trend === 'declining' && (
                      <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md flex items-center gap-0.5">
                        <TrendingDown className="w-3 h-3" /> {formatScoreSpanish(stat.trendDelta)}
                      </span>
                    )}
                  </div>

                  {/* Transparency Notice Box */}
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] space-y-1">
                    {subjectGrades.length > 0 ? (
                      <>
                        <div className="flex items-center gap-1 text-slate-700 font-medium">
                          <span>📝</span>
                          <span>Basado en <strong>{manualCount}</strong> {manualCount === 1 ? 'calificación ingresada' : 'calificaciones ingresadas'} por ti.</span>
                        </div>
                        {stat?.sufficiency === 'incomplete' && (
                          <p className="text-amber-800 text-[10px] flex items-center gap-1">
                            <span>⚠️</span>
                            <span>Promedio con datos conocidos. Podrían existir notas adicionales.</span>
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-slate-500 text-[10px]">
                        No has registrado notas aún. Pulsa el botón '+' para agregar tus calificaciones conocidas.
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onSelectSubjectDetail(subject.id)}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 border border-slate-200/60"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Ver Detalle ({subjectGrades.length})</span>
                  </button>

                  <button
                    onClick={() => onOpenNewGrade(subject.id)}
                    className="p-1.5 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-all"
                    title="Añadir calificación a esta materia"
                  >
                    <PlusCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Materia</th>
                  <th className="py-3 px-4">Docente</th>
                  <th className="py-3 px-4 text-center">Método</th>
                  <th className="py-3 px-4 text-center">Notas Conocidas</th>
                  <th className="py-3 px-4">Transparencia / Estado</th>
                  <th className="py-3 px-4 text-right">Promedio Estimado</th>
                  <th className="py-3 px-4">Desempeño</th>
                  <th className="py-3 px-4 text-center">Tendencia</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSubjects.map((subject) => {
                  const stat = subjectStats.find((s) => s.subjectId === subject.id);
                  const subjectGrades = grades.filter(
                    (g) => g.subjectId === subject.id && g.periodId === currentPeriod.id
                  );

                  return (
                    <tr key={subject.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {subject.name}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {subject.professorName || '—'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-semibold text-slate-700">
                          {subject.calculationMethod === 'weighted' ? 'Ponderado' : 'Simple'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-semibold text-slate-800">
                        {subjectGrades.length} 📝
                      </td>
                      <td className="py-3 px-4">
                        {stat?.sufficiency === 'sufficient' && (
                          <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                            🟢 Suficiente
                          </span>
                        )}
                        {stat?.sufficiency === 'incomplete' && (
                          <span className="text-[11px] font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md">
                            🟡 Información parcial
                          </span>
                        )}
                        {stat?.sufficiency === 'no_data' && (
                          <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                            🔴 Sin calificaciones
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-black font-display text-slate-900 text-sm">
                        {formatScoreSpanish(stat?.average)}
                      </td>
                      <td className="py-3 px-4">
                        {stat?.classification ? (
                          <span
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${stat.classification.badgeBg}`}
                          >
                            {stat.classification.label}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Sin clasificar</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {stat?.trend === 'improving' && (
                          <span className="text-emerald-600 font-bold flex items-center justify-center gap-1">
                            <TrendingUp className="w-3.5 h-3.5" /> +{formatScoreSpanish(stat.trendDelta)}
                          </span>
                        )}
                        {stat?.trend === 'declining' && (
                          <span className="text-rose-600 font-bold flex items-center justify-center gap-1">
                            <TrendingDown className="w-3.5 h-3.5" /> {formatScoreSpanish(stat.trendDelta)}
                          </span>
                        )}
                        {stat?.trend === 'stable' && (
                          <span className="text-slate-500 font-medium flex items-center justify-center gap-1">
                            <Minus className="w-3.5 h-3.5" /> Estable
                          </span>
                        )}
                        {stat?.trend === 'insufficient_data' && (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => onSelectSubjectDetail(subject.id)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-semibold hover:bg-indigo-100 transition-colors"
                        >
                          Ver Detalle
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subject Detail Modal */}
      {activeSubject && activeSubjectStats && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 my-8 space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-md">
                    {currentPeriod.name}
                  </span>
                  <span className="text-xs font-medium text-slate-400">
                    {activeSubject.calculationMethod === 'weighted' ? 'Promedio Ponderado' : 'Promedio Simple'}
                  </span>
                  <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    📝 {activeSubjectGrades.length} Calificaciones Conocidas
                  </span>
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900 font-display mt-1">
                  {activeSubject.name}
                </h3>
                {activeSubject.professorName && (
                  <p className="text-xs text-slate-500 mt-0.5">Docente: {activeSubject.professorName}</p>
                )}
              </div>

              <button
                onClick={() => onSelectSubjectDetail(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
              >
                ✕
              </button>
            </div>

            {/* Crucial Transparency Comparison Banner */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/90 text-xs space-y-2 text-amber-950">
              <div className="flex items-center gap-2 font-bold text-amber-900">
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Transparencia y Distinción Fundamental</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3 bg-white/90 rounded-xl border border-amber-200">
                  <span className="text-[10px] uppercase font-bold text-indigo-700 block">
                    📝 Tu promedio según los datos que conoces
                  </span>
                  <div className="text-2xl font-black text-slate-900 font-display mt-0.5">
                    {formatScoreSpanish(activeSubjectStats.average)}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-tight">
                    Calculado con {activeSubjectGrades.length} actividades que tienes en tu poder.
                  </p>
                </div>

                <div className="p-3 bg-white/90 rounded-xl border border-amber-200">
                  <span className="text-[10px] uppercase font-bold text-slate-600 block">
                    🏫 Tu promedio oficial según la institución
                  </span>
                  <div className="text-xs font-semibold text-slate-700 mt-1">
                    Emitido formalmente al cierre del período
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-tight">
                    ⚠️ Este promedio puede no coincidir si existen evaluaciones adicionales no registradas o ponderaciones institucionales no ingresadas.
                  </p>
                </div>
              </div>
            </div>

            {/* Performance Stats Banner */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-xs font-semibold text-slate-500">🧮 Promedio Calculado</span>
                <div className="text-3xl font-extrabold text-slate-900 font-display mt-1">
                  {formatScoreSpanish(activeSubjectStats.average)}
                  <span className="text-xs font-normal text-slate-400 ml-1">/ 5,0</span>
                </div>
                <span className="text-xs font-semibold text-slate-700 mt-1 block">
                  {activeSubjectStats.classification?.label || 'Sin clasificar'}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-xs font-semibold text-slate-500">Estado de la Información</span>
                <div className="mt-1">
                  {activeSubjectStats.sufficiency === 'sufficient' && (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
                      🟢 Información suficiente
                    </span>
                  )}
                  {activeSubjectStats.sufficiency === 'incomplete' && (
                    <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md inline-block">
                      🟡 Información parcial
                    </span>
                  )}
                  {activeSubjectStats.sufficiency === 'no_data' && (
                    <span className="text-xs font-bold text-slate-700 bg-slate-200 px-2 py-0.5 rounded-md inline-block">
                      🔴 Sin calificaciones registradas
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5 leading-snug">
                  {activeSubjectStats.sufficiencyMessage}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-xs font-semibold text-slate-500">Tendencia vs Anterior</span>
                <div className="text-base font-bold text-slate-900 mt-1">
                  {activeSubjectStats.trend === 'improving' && '📈 Mejorando'}
                  {activeSubjectStats.trend === 'declining' && '📉 Disminuyendo'}
                  {activeSubjectStats.trend === 'stable' && '➡️ Estable'}
                  {activeSubjectStats.trend === 'insufficient_data' && '⚠️ Sin datos previos'}
                </div>
                <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                  {activeSubjectStats.trendMessage}
                </p>
              </div>
            </div>

            {/* Step-by-Step Mathematical Explanation */}
            <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-900">
                <Calculator className="w-4 h-4 text-indigo-600" />
                <span>🧮 Desglose de la Fórmula Matemática</span>
              </div>
              <p className="text-xs text-indigo-950 font-mono bg-white p-2.5 rounded-xl border border-indigo-100 overflow-x-auto">
                {activeSubject.calculationMethod === 'weighted'
                  ? `Promedio Ponderado = Σ(nota × peso) / Σ(pesos) = ${
                      activeSubjectGrades.length > 0
                        ? activeSubjectGrades
                            .map((g) => `(${formatScoreSpanish(g.score)} × ${g.weightPercent || 0}%)`)
                            .join(' + ')
                        : '0'
                    } = ${formatScoreSpanish(activeSubjectStats.average)}`
                  : `Promedio Simple = Σ(notas) / ${activeSubjectGrades.length || 1} = (${activeSubjectGrades
                      .map((g) => formatScoreSpanish(g.score))
                      .join(' + ')}) / ${activeSubjectGrades.length || 1} = ${formatScoreSpanish(
                      activeSubjectStats.average
                    )}`}
              </p>
              <p className="text-[11px] text-indigo-700">
                Fuente: datos legítimamente ingresados por el estudiante. Cada cambio actualiza promedios, tendencias y metas automáticamente.
              </p>
            </div>

            {/* List of Registered Grades with Filter */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900">
                    Calificaciones Registradas ({filteredDetailGrades.length} de {activeSubjectGrades.length})
                  </h4>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={detailTypeFilter}
                    onChange={(e) => setDetailTypeFilter(e.target.value)}
                    className="text-xs p-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-medium"
                  >
                    <option value="all">Todas las actividades</option>
                    <option value="examen">📝 Exámenes</option>
                    <option value="trabajo">📄 Trabajos</option>
                    <option value="taller">🛠️ Talleres</option>
                    <option value="quiz">⚡ Quices</option>
                    <option value="proyecto">🚀 Proyectos</option>
                    <option value="exposicion">🗣️ Exposiciones</option>
                    <option value="actividad_clase">✏️ Actividades de clase</option>
                    <option value="participacion">🙋 Participación</option>
                    <option value="recuperacion">🔄 Recuperaciones</option>
                  </select>

                  <button
                    onClick={() => onOpenNewGrade(activeSubject.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-all shadow-xs"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Añadir Nota</span>
                  </button>
                </div>
              </div>

              {filteredDetailGrades.length > 0 ? (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white">
                  {filteredDetailGrades.map((grade) => {
                    const typeConfig = GRADE_TYPE_LABELS[grade.type] || { label: grade.type, icon: '📌' };
                    return (
                      <div
                        key={grade.id}
                        className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-slate-900 text-xs">{grade.title}</span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 flex items-center gap-1">
                              <span>{typeConfig.icon}</span>
                              <span>{typeConfig.label}</span>
                            </span>

                            {grade.origin === 'student' || !grade.origin ? (
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                                📝 Ingresado por ti
                              </span>
                            ) : grade.origin === 'official' ? (
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200 flex items-center gap-1">
                                🏫 Institucional Oficial
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" /> Verificado: {grade.verifiedBy || 'Docente'}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 flex flex-wrap items-center gap-2">
                            <span>📅 Fecha actividad: {grade.date}</span>
                            {grade.weightPercent !== undefined && (
                              <span>• ⚖️ Peso: {grade.weightPercent}%</span>
                            )}
                            {grade.notes && <span>• 💬 Observación: "{grade.notes}"</span>}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-lg font-black font-display text-slate-900">
                            {formatScoreSpanish(grade.score)}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => onEditGrade(grade)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                              title="Editar Calificación"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onDeleteGrade(grade.id)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Eliminar Calificación"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                  <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">
                    No hay calificaciones que coincidan con el filtro
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
                    Puedes registrar libremente tus notas conocidas usando el botón "Añadir Nota".
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <button
                onClick={() => {
                  onDeleteSubject(activeSubject.id);
                  onSelectSubjectDetail(null);
                }}
                className="text-xs text-rose-600 hover:text-rose-800 font-semibold"
              >
                Eliminar Materia
              </button>

              <button
                onClick={() => onSelectSubjectDetail(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-all"
              >
                Cerrar Detalle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
