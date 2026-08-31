import React from 'react';
import { Printer, Download, ArrowLeft, ShieldCheck } from 'lucide-react';
import {
  Subject,
  AcademicPeriod,
  GradeEntry,
  GradingSystemConfig,
  SubjectStats,
  PeriodStats,
} from '../types';
import { formatScoreSpanish } from '../lib/academicEngine';
import { triggerBrowserPrint, exportGradesToCSV } from '../lib/exportUtils';

interface PrintableReportProps {
  currentPeriod: AcademicPeriod;
  periodStats: PeriodStats;
  subjectStats: SubjectStats[];
  subjects: Subject[];
  grades: GradeEntry[];
  config: GradingSystemConfig;
  onClose: () => void;
}

export const PrintableReport: React.FC<PrintableReportProps> = ({
  currentPeriod,
  periodStats,
  subjectStats,
  subjects,
  grades,
  config,
  onClose,
}) => {
  return (
    <div className="space-y-6">
      {/* Top action bar (hidden in print) */}
      <div className="no-print bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <button
          onClick={onClose}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Panel</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportGradesToCSV(subjects, grades, [currentPeriod], subjectStats, periodStats, config)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Descargar CSV</span>
          </button>
          <button
            onClick={triggerBrowserPrint}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-semibold transition-all shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / Guardar en PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Sheet */}
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-200/80 shadow-xs max-w-4xl mx-auto print:border-none print:shadow-none print:p-0 print:m-0">
        {/* Document Header */}
        <div className="border-b-2 border-slate-900 pb-5">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">
                MiRendimiento • Reporte de Análisis Académico
              </span>
              <h1 className="text-2xl font-black text-slate-900 font-display mt-0.5">
                {config.institutionName || 'Institución Educativa'}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Año Lectivo: {config.academicYear || '2026'} • {currentPeriod.name}
              </p>
            </div>

            <div className="text-right">
              <div className="text-xs font-bold text-slate-900">
                Estudiante: {config.studentName || 'Estudiante'}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Fecha: {new Date().toLocaleDateString('es-CO')}
              </div>
            </div>
          </div>

          {/* Legal / Ethical Notice */}
          <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 leading-snug">
            <strong>Aviso de Autenticidad y Transparencia:</strong> Este documento es un informe de análisis personal generado mediante fórmulas matemáticas a partir de los datos legítimamente registrados por el estudiante. <em>No reemplaza ni sustituye el boletín oficial de calificaciones emitido por la institución educativa.</em>
          </div>
        </div>

        {/* Global Stats Summary */}
        <div className="grid grid-cols-3 gap-4 my-6 text-center">
          <div className="p-4 rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Promedio General</span>
            <div className="text-3xl font-extrabold text-slate-900 font-display mt-1">
              {formatScoreSpanish(periodStats.generalAverage)}
              <span className="text-xs font-normal text-slate-400"> / 5,0</span>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Nivel de Desempeño</span>
            <div className="text-lg font-bold text-slate-900 mt-2">
              {periodStats.classification?.label || 'Sin clasificar'}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Cobertura de Datos</span>
            <div className="text-lg font-bold text-slate-900 mt-2">
              {periodStats.evaluatedSubjectsCount} de {subjects.length} materias
            </div>
          </div>
        </div>

        {/* Detailed Subject Table */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Desglose Detallado por Asignatura
          </h3>
          <table className="w-full text-left text-xs border border-slate-200">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3 border-r border-slate-200">Asignatura</th>
                <th className="py-2.5 px-3 border-r border-slate-200">Docente</th>
                <th className="py-2.5 px-3 border-r border-slate-200 text-center">Método</th>
                <th className="py-2.5 px-3 border-r border-slate-200 text-center">Evaluaciones</th>
                <th className="py-2.5 px-3 border-r border-slate-200 text-right">Promedio</th>
                <th className="py-2.5 px-3">Estado de la Información</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {subjectStats.map((stat) => {
                const subj = subjects.find((s) => s.id === stat.subjectId);
                return (
                  <tr key={stat.subjectId} className="even:bg-slate-50/50">
                    <td className="py-2.5 px-3 font-bold text-slate-900 border-r border-slate-200">
                      {stat.subjectName}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 border-r border-slate-200">
                      {subj?.professorName || '—'}
                    </td>
                    <td className="py-2.5 px-3 text-center border-r border-slate-200 text-[11px]">
                      {subj?.calculationMethod === 'weighted' ? 'Ponderado' : 'Simple'}
                    </td>
                    <td className="py-2.5 px-3 text-center font-semibold border-r border-slate-200">
                      {stat.totalGrades}
                    </td>
                    <td className="py-2.5 px-3 text-right font-black text-slate-900 border-r border-slate-200 text-sm">
                      {formatScoreSpanish(stat.average)}
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-slate-600">
                      {stat.sufficiencyMessage}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer Signature area */}
        <div className="mt-12 pt-8 border-t border-slate-200 flex justify-between text-xs text-slate-500">
          <div>
            <div className="w-48 border-b border-slate-400 mb-1" />
            <span>Firma del Estudiante / Acudiente</span>
          </div>
          <div className="text-right">
            <span>Generado digitalmente con MiRendimiento</span>
          </div>
        </div>
      </div>
    </div>
  );
};
