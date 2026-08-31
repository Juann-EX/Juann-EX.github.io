import React, { useState, useEffect } from 'react';
import { GradeEntry, GradeType, Subject, AcademicPeriod, DataOrigin } from '../types';
import { ShieldCheck, User, Calendar, Check, AlertCircle, Sparkles, BookOpen, Clock, Tag } from 'lucide-react';
import { formatScoreSpanish } from '../lib/academicEngine';

interface GradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (grade: Partial<GradeEntry>) => void;
  subjects: Subject[];
  periods: AcademicPeriod[];
  currentPeriodId: string;
  initialGrade?: GradeEntry | null;
  preselectedSubjectId?: string;
}

export const GradeModal: React.FC<GradeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  subjects,
  periods,
  currentPeriodId,
  initialGrade,
  preselectedSubjectId,
}) => {
  const [subjectId, setSubjectId] = useState<string>('');
  const [periodId, setPeriodId] = useState<string>(currentPeriodId);
  const [title, setTitle] = useState<string>('');
  const [scoreStr, setScoreStr] = useState<string>('4.0');
  const [weightStr, setWeightStr] = useState<string>('20');
  const [type, setType] = useState<GradeType>('examen');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [origin, setOrigin] = useState<DataOrigin>('student');
  const [verifiedBy, setVerifiedBy] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (initialGrade) {
      setSubjectId(initialGrade.subjectId);
      setPeriodId(initialGrade.periodId);
      setTitle(initialGrade.title);
      setScoreStr(initialGrade.score.toString());
      setWeightStr(initialGrade.weightPercent !== undefined ? initialGrade.weightPercent.toString() : '20');
      setType(initialGrade.type);
      setDate(initialGrade.date || new Date().toISOString().split('T')[0]);
      setOrigin(initialGrade.origin);
      setVerifiedBy(initialGrade.verifiedBy || '');
      setNotes(initialGrade.notes || '');
    } else {
      setSubjectId(preselectedSubjectId || (subjects.length > 0 ? subjects[0].id : ''));
      setPeriodId(currentPeriodId);
      setTitle('');
      setScoreStr('4.0');
      setWeightStr('20');
      setType('examen');
      setDate(new Date().toISOString().split('T')[0]);
      setOrigin('student');
      setVerifiedBy('');
      setNotes('');
    }
    setValidationError(null);
  }, [initialGrade, preselectedSubjectId, currentPeriodId, isOpen, subjects]);

  if (!isOpen) return null;

  const selectedSubject = subjects.find((s) => s.id === subjectId);
  const isWeighted = selectedSubject?.calculationMethod === 'weighted';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const parsedScore = parseFloat(scoreStr.replace(',', '.'));
    if (isNaN(parsedScore) || parsedScore < 1.0 || parsedScore > 5.0) {
      setValidationError('La calificación debe ser un valor decimal válido entre 1,0 y 5,0 (ej. 3,8).');
      return;
    }

    let parsedWeight: number | undefined = undefined;
    if (isWeighted) {
      parsedWeight = parseFloat(weightStr);
      if (isNaN(parsedWeight) || parsedWeight < 1 || parsedWeight > 100) {
        setValidationError('El peso porcentual debe estar entre 1% y 100%.');
        return;
      }
    } else if (weightStr.trim() !== '') {
      const optWeight = parseFloat(weightStr);
      if (!isNaN(optWeight) && optWeight > 0 && optWeight <= 100) {
        parsedWeight = optWeight;
      }
    }

    if (!title.trim()) {
      setValidationError('Por favor ingresa un nombre o descripción de la actividad evaluativa.');
      return;
    }

    onSave({
      id: initialGrade ? initialGrade.id : undefined,
      subjectId,
      periodId,
      title: title.trim(),
      score: parsedScore,
      weightPercent: parsedWeight,
      type,
      date,
      origin,
      verifiedBy: origin === 'verified' || origin === 'official' ? verifiedBy.trim() || 'Docente' : undefined,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 my-8 space-y-5">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                Registro Opcional
              </span>
              <span className="text-[11px] text-slate-400">Calificaciones Conocidas</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-display mt-0.5">
              {initialGrade ? 'Editar Calificación' : 'Registrar Resultado de Actividad'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Agrega voluntariamente notas de exámenes, trabajos, talleres o quices que tengas en tu poder.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
          >
            ✕
          </button>
        </div>

        {/* Transparency Banner */}
        <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-900 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-amber-800">
            <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Transparencia de los Datos</span>
          </div>
          <p className="text-amber-800 leading-snug">
            Esta información será utilizada para calcular tu <strong>promedio estimado</strong> y estadísticas. Recuerda que no reemplaza el boletín oficial emitido por la institución.
          </p>
        </div>

        {validationError && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{validationError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Materia y Período */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Materia</label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                required
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.calculationMethod === 'weighted' ? 'Ponderado' : 'Simple'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Período Académico</label>
              <select
                value={periodId}
                onChange={(e) => setPeriodId(e.target.value)}
                required
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
              >
                {periods.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.isCurrent ? '(Actual)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Nombre de la actividad */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Nombre de la Actividad Evaluativa
            </label>
            <input
              type="text"
              placeholder="Ej. Examen de Álgebra, Taller #2, Quiz Funciones, Exposición..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
            />
          </div>

          {/* Calificación y Tipo de Actividad */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Calificación Obtenida (1,0 - 5,0)
              </label>
              <input
                type="number"
                step="0.1"
                min="1.0"
                max="5.0"
                placeholder="Ej. 3.8"
                value={scoreStr}
                onChange={(e) => setScoreStr(e.target.value)}
                required
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-bold text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Escala oficial estándar: 1,0 a 5,0</span>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Tipo de Actividad
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as GradeType)}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
              >
                <option value="examen">📝 Examen</option>
                <option value="trabajo">📄 Trabajo</option>
                <option value="taller">🛠️ Taller</option>
                <option value="quiz">⚡ Quiz</option>
                <option value="proyecto">🚀 Proyecto</option>
                <option value="exposicion">🗣️ Exposición</option>
                <option value="actividad_clase">✏️ Actividad de clase</option>
                <option value="actividad">✏️ Actividad general</option>
                <option value="participacion">🙋 Participación</option>
                <option value="evaluacion">📋 Evaluación</option>
                <option value="recuperacion">🔄 Recuperación</option>
                <option value="otro">📌 Otro</option>
              </select>
            </div>
          </div>

          {/* Porcentaje o Peso */}
          <div className={`p-3 rounded-2xl border space-y-1.5 ${isWeighted ? 'bg-amber-50/70 border-amber-200/80' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center justify-between">
              <label className={`font-bold block ${isWeighted ? 'text-amber-900' : 'text-slate-700'}`}>
                Porcentaje o Peso ({isWeighted ? 'Requerido para cálculo ponderado' : 'Opcional si lo conoces'})
              </label>
              {isWeighted && (
                <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                  Ponderado
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max="100"
                placeholder="Ej. 20"
                value={weightStr}
                onChange={(e) => setWeightStr(e.target.value)}
                className="w-24 p-2 rounded-xl bg-white border border-slate-300 text-slate-900 font-bold"
              />
              <span className="text-xs text-slate-600 font-semibold">% sobre el 100% del período</span>
            </div>
            <p className="text-[11px] text-slate-500">
              {isWeighted
                ? 'Esta materia calcula el promedio con ponderación porcentual.'
                : 'Si dejas el peso vacío, la materia promediará de forma simple (aritmética).'}
            </p>
          </div>

          {/* Fecha y Origen del Dato */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Fecha de la Actividad</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Origen de la Información</label>
              <select
                value={origin}
                onChange={(e) => setOrigin(e.target.value as DataOrigin)}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white font-medium"
              >
                <option value="student">📝 Datos ingresados por el estudiante</option>
                <option value="official">🏫 Datos oficiales institucionales</option>
                <option value="verified">👨‍🏫 Verificado con docente</option>
              </select>
            </div>
          </div>

          {(origin === 'verified' || origin === 'official') && (
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Fuente o Docente que Verificó
              </label>
              <input
                type="text"
                placeholder="Nombre del docente o sistema institucional..."
                value={verifiedBy}
                onChange={(e) => setVerifiedBy(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800"
              />
            </div>
          )}

          {/* Observaciones Opcionales */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Observación Opcional
            </label>
            <input
              type="text"
              placeholder="Ej. Retroalimentación recibida, comentarios del docente, temas evaluados..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800"
            />
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="text-[11px] text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Se guardará en el historial de cambios</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-all shadow-xs"
              >
                {initialGrade ? 'Guardar Cambios' : 'Registrar Calificación'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
