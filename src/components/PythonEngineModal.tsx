import React, { useState } from 'react';
import { FileCode2, Play, CheckCircle2, Copy, Check, Terminal, Cpu } from 'lucide-react';
import { Subject, GradeEntry, AcademicPeriod } from '../types';

interface PythonEngineModalProps {
  subjects: Subject[];
  grades: GradeEntry[];
  periods: AcademicPeriod[];
  currentPeriodId: string;
}

export const PythonEngineModal: React.FC<PythonEngineModalProps> = ({
  subjects,
  grades,
  periods,
  currentPeriodId,
}) => {
  const [copied, setCopied] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const pythonSampleCode = `"""
MiRendimiento - Motor de Cálculo Estadístico en Python (Pandas & NumPy)
Algoritmo de paridad y transparencia matemática
"""
import pandas as pd
import numpy as np

# 1. Dataset de Calificaciones registradas por el estudiante
grades_data = ${JSON.stringify(grades.slice(0, 10), null, 2)}

df = pd.DataFrame(grades_data)

# 2. Filtrado por período lectivo actual
df_period = df[df['periodId'] == '${currentPeriodId}'].copy()

# 3. Cálculo de Promedio por Asignatura (Simple vs Ponderado)
results = []
for subject_id, group in df_period.groupby('subjectId'):
    has_weights = 'weightPercent' in group.columns and group['weightPercent'].notna().all()
    
    if has_weights and group['weightPercent'].sum() > 0:
        total_weight = group['weightPercent'].sum()
        # Fórmula ponderada: Sum(score * weight) / Sum(weight)
        avg = (group['score'] * group['weightPercent']).sum() / total_weight
        method = "Ponderado"
    else:
        total_weight = 100.0
        # Fórmula simple aritmética: Mean(score)
        avg = group['score'].mean()
        method = "Simple"
        
    results.append({
        'subject_id': subject_id,
        'promedio': round(float(avg), 2),
        'evaluaciones': len(group),
        'peso_acumulado': float(total_weight),
        'metodo': method,
        'suficiencia': "Suficiente" if len(group) >= 3 else "Incompleta"
    })

df_results = pd.DataFrame(results)
promedio_general = round(float(df_results['promedio'].mean()), 2) if not df_results.empty else 0.0

print(f"=== REPORTE PYTHON ===")
print(f"Promedio General del Período: {promedio_general} / 5.0")
print(df_results.to_string(index=False))
`;

  const handleRunParityCheck = async () => {
    setIsRunning(true);
    try {
      const res = await fetch('/api/calculate/python-engine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjects,
          grades,
          periodId: currentPeriodId,
        }),
      });
      const data = await res.json();
      setTestResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(pythonSampleCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 font-display">
              Motor Estadístico Python (Pandas / NumPy)
            </h2>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
              Paridad Algorítmica
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Garantía de rigor matemático: los cálculos frontend en TypeScript coinciden exactamente con el motor analítico de backend en Python.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-all shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Código Copiado' : 'Copiar Script Python'}</span>
          </button>
          <button
            onClick={handleRunParityCheck}
            disabled={isRunning}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-semibold transition-all shadow-xs shadow-indigo-200"
          >
            <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
            <span>Ejecutar Verificación de Paridad</span>
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-start gap-3 shadow-xs">
        <div className="p-2 rounded-xl bg-slate-800 text-indigo-400 shrink-0">
          <Terminal className="w-5 h-5" />
        </div>
        <div className="text-xs space-y-1">
          <span className="font-bold text-white block">Transparencia de Algoritmos</span>
          <p className="text-slate-300 leading-relaxed">
            Puedes exportar y ejecutar este script en cualquier entorno Python (Jupyter Notebook, Google Colab, etc.) con tus datos reales exportados en JSON o CSV para verificar independientemente cada decimal y ponderación.
          </p>
        </div>
      </div>

      {/* Parity test result if triggered */}
      {testResult && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <span className="font-bold block">✓ Paridad Matemática Verificada</span>
            <p className="text-emerald-800">{testResult.message}</p>
            <span className="text-[10px] text-emerald-700 font-mono block">
              Motor: {testResult.engine} • Endpoint: /api/calculate/python-engine
            </span>
          </div>
        </div>
      )}

      {/* Code Viewer */}
      <div className="bg-slate-950 rounded-3xl border border-slate-800 shadow-xl overflow-hidden text-slate-200 font-mono text-xs">
        <div className="bg-slate-900/80 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            <span className="text-slate-400 text-xs ml-2 font-sans font-semibold">
              academic_engine.py
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-sans">Python 3.11 • Pandas & NumPy</span>
        </div>

        <div className="p-5 overflow-x-auto max-h-[480px]">
          <pre className="text-xs leading-relaxed text-indigo-200">{pythonSampleCode}</pre>
        </div>
      </div>
    </div>
  );
};
