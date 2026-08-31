import React, { useState } from 'react';
import {
  Target,
  Sparkles,
  Calculator,
  PlusCircle,
  Trash2,
  TrendingUp,
  Award,
  CheckCircle2,
  AlertCircle,
  Info,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import {
  Subject,
  AcademicPeriod,
  GradeEntry,
  GradingSystemConfig,
  SubjectStats,
  AcademicGoal,
} from '../types';
import {
  computeSubjectStats,
  simulateSubjectScenario,
  calculateRequiredScoreForTarget,
  formatScoreSpanish,
} from '../lib/academicEngine';

interface GoalsAndSimulatorProps {
  periods: AcademicPeriod[];
  subjects: Subject[];
  grades: GradeEntry[];
  currentPeriodId: string;
  config: GradingSystemConfig;
  goals: AcademicGoal[];
  onSaveGoal: (goal: AcademicGoal) => void;
}

export const GoalsAndSimulator: React.FC<GoalsAndSimulatorProps> = ({
  periods,
  subjects,
  grades,
  currentPeriodId,
  config,
  goals,
  onSaveGoal,
}) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    subjects.length > 0 ? subjects[0].id : ''
  );
  const [targetGoalInput, setTargetGoalInput] = useState<string>('4.0');

  // Hypothetical scenario items
  const [hypoGrades, setHypoGrades] = useState<
    Array<{ id: string; title: string; score: number; weight: number }>
  >([
    { id: '1', title: 'Examen Final Próximo', score: 4.5, weight: 30 },
  ]);

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];
  const subjectGrades = grades.filter(
    (g) => g.subjectId === selectedSubject?.id && g.periodId === currentPeriodId
  );
  const currentStat = selectedSubject
    ? computeSubjectStats(selectedSubject, currentPeriodId, grades, periods, config)
    : null;

  // Meta actual guardada para esta materia
  const savedGoal = goals.find(
    (g) => g.subjectId === selectedSubject?.id && g.periodId === currentPeriodId
  );

  // Ejecución de la simulación
  const simulationResult = selectedSubject
    ? simulateSubjectScenario(
        selectedSubject,
        subjectGrades,
        hypoGrades.map((h) => ({
          title: h.title,
          score: h.score,
          weightPercent: h.weight,
        })),
        config
      )
    : null;

  // Cálculo de nota requerida para alcanzar una meta deseada
  const targetGradeNum = parseFloat(targetGoalInput.replace(',', '.')) || 4.0;
  const currentAccumulatedWeight = currentStat?.totalWeightPercent || 0;
  const remainingWeight = Math.max(10, 100 - currentAccumulatedWeight);

  const requiredCalculation = selectedSubject
    ? calculateRequiredScoreForTarget(
        selectedSubject,
        subjectGrades,
        targetGradeNum,
        remainingWeight,
        config
      )
    : null;

  const handleAddHypoGrade = () => {
    setHypoGrades([
      ...hypoGrades,
      {
        id: Math.random().toString(),
        title: `Actividad Proyectada #${hypoGrades.length + 1}`,
        score: 4.0,
        weight: 20,
      },
    ]);
  };

  const handleRemoveHypoGrade = (id: string) => {
    setHypoGrades(hypoGrades.filter((h) => h.id !== id));
  };

  const handleSaveGoal = () => {
    if (!selectedSubject) return;
    const newGoal: AcademicGoal = {
      id: savedGoal ? savedGoal.id : `goal-${Date.now()}`,
      periodId: currentPeriodId,
      subjectId: selectedSubject.id,
      targetGrade: targetGradeNum,
      note: `Meta para ${selectedSubject.name}`,
      createdAt: new Date().toISOString(),
    };
    onSaveGoal(newGoal);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 font-display">
            Metas y Simulador de Rendimiento ("¿Qué pasaría si...?")
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Proyecta posibles escenarios académicos y calcula qué calificación necesitas para alcanzar tus objetivos.
          </p>
        </div>
      </div>

      {/* Selector de Materia */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Seleccionar Asignatura para Simular
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="mt-1 font-bold text-sm text-slate-900 bg-transparent border-0 focus:ring-0 p-0 cursor-pointer"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.calculationMethod === 'weighted' ? 'Ponderado' : 'Simple'})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600">Tu Meta:</span>
            <input
              type="number"
              step="0.1"
              min="1.0"
              max="5.0"
              value={targetGoalInput}
              onChange={(e) => setTargetGoalInput(e.target.value)}
              className="w-20 p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-bold text-center text-xs focus:bg-white"
            />
          </div>
          <button
            onClick={handleSaveGoal}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition-all shadow-xs"
          >
            Fijar Meta
          </button>
        </div>
      </div>

      {/* Two Column Layout: Simulator Left, Goal Math Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Simulator */}
        <div className="lg:col-span-2 space-y-5">
          {/* Comparison Cards: Actual vs Simulado */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Promedio Actual Registrado
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900 font-display">
                  {formatScoreSpanish(currentStat?.average)}
                </span>
                <span className="text-xs text-slate-400">/ 5,0</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Con {subjectGrades.length} evaluación(es) ({currentStat?.totalWeightPercent}% del peso)
              </p>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100/50 p-5 rounded-2xl border border-indigo-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                  Promedio Proyectado
                </span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-indigo-600 text-white">
                  Simulación
                </span>
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-indigo-900 font-display">
                  {formatScoreSpanish(simulationResult?.projectedAverage)}
                </span>
                <span className="text-xs text-indigo-400">/ 5,0</span>
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-indigo-700">
                {simulationResult && simulationResult.deltaFromCurrent !== null && (
                  <span>
                    {simulationResult.deltaFromCurrent >= 0 ? '📈 +' : '📉 '}
                    {formatScoreSpanish(simulationResult.deltaFromCurrent)} puntos de variación
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Interactive Form: Hypothetical Grades */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900 font-display">
                  Evaluaciones Hipotéticas
                </h3>
                <p className="text-xs text-slate-500">
                  Añade notas proyectadas para ver cómo impactan tu promedio final.
                </p>
              </div>

              <button
                onClick={handleAddHypoGrade}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-600 text-xs font-semibold hover:bg-indigo-100 transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>+ Agregar Hipótesis</span>
              </button>
            </div>

            <div className="space-y-3">
              {hypoGrades.map((hg, idx) => (
                <div
                  key={hg.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex-1">
                    <input
                      type="text"
                      value={hg.title}
                      onChange={(e) => {
                        const updated = [...hypoGrades];
                        updated[idx].title = e.target.value;
                        setHypoGrades(updated);
                      }}
                      className="w-full font-bold text-slate-900 bg-transparent border-0 focus:ring-0 p-0"
                    />
                    <span className="text-[10px] text-slate-400">Escenario hipotético #{idx + 1}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500 font-medium">Nota:</span>
                      <input
                        type="number"
                        step="0.1"
                        min="1.0"
                        max="5.0"
                        value={hg.score}
                        onChange={(e) => {
                          const updated = [...hypoGrades];
                          updated[idx].score = parseFloat(e.target.value) || 1.0;
                          setHypoGrades(updated);
                        }}
                        className="w-16 p-1.5 rounded-lg bg-white border border-slate-200 font-bold text-slate-900 text-center"
                      />
                    </div>

                    {selectedSubject?.calculationMethod === 'weighted' && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-500 font-medium">Peso (%):</span>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={hg.weight}
                          onChange={(e) => {
                            const updated = [...hypoGrades];
                            updated[idx].weight = parseFloat(e.target.value) || 0;
                            setHypoGrades(updated);
                          }}
                          className="w-16 p-1.5 rounded-lg bg-white border border-slate-200 font-bold text-slate-900 text-center"
                        />
                      </div>
                    )}

                    <button
                      onClick={() => handleRemoveHypoGrade(hg.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Eliminar hipótesis"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              {hypoGrades.length === 0 && (
                <div className="p-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                  <p className="text-xs text-slate-500">
                    No has agregado evaluaciones hipotéticas. Haz clic en <strong>+ Agregar Hipótesis</strong> para simular.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Required Grade & Math Formula Explainer */}
        <div className="space-y-5">
          {/* Target Feasibility Card */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-base text-slate-900 font-display">
                Cálculo de Nota Requerida
              </h3>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-2">
              <span className="text-xs text-indigo-900 font-semibold block">
                Para alcanzar tu meta de <strong>{formatScoreSpanish(targetGradeNum)}</strong>:
              </span>

              <div className="text-sm font-bold text-indigo-950 leading-relaxed">
                {requiredCalculation?.message || 'Calculando requerimiento...'}
              </div>
            </div>

            {/* Formula Breakdown */}
            <div className="space-y-2 text-xs text-slate-600">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                Fórmula de Despeje Empleada:
              </h4>
              <p className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono text-[11px] text-slate-800">
                {selectedSubject?.calculationMethod === 'weighted'
                  ? 'Nota_Requerida = [ Meta × Peso_Total - Σ(Nota_i × Peso_i) ] / Peso_Restante'
                  : 'Nota_Requerida = Meta × (n + 1) - Σ(Notas_Existentes)'}
              </p>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Este cálculo es estrictamente transparente, basado en la regla matemática y no inventa ningún resultado.
              </p>
            </div>
          </div>

          {/* Ethical Guidance Note */}
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 text-amber-900 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold">
              <Info className="w-4 h-4 text-amber-600" />
              <span>Importante</span>
            </div>
            <p className="text-[11px] leading-relaxed text-amber-800">
              Los escenarios simulados son únicamente herramientas de proyección personal y no modifican ni garantizan tus calificaciones oficiales.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
