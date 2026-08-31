import React, { useState } from 'react';
import {
  Settings,
  Download,
  Upload,
  RefreshCw,
  ShieldCheck,
  Save,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  Database
} from 'lucide-react';
import {
  GradingSystemConfig,
  Subject,
  GradeEntry,
  AcademicPeriod,
  ChangeLogEntry,
  SubjectStats,
  PeriodStats,
} from '../types';
import { exportGradesToCSV, exportBackupJSON } from '../lib/exportUtils';
import { formatScoreSpanish } from '../lib/academicEngine';

interface SettingsModalProps {
  config: GradingSystemConfig;
  onUpdateConfig: (newConfig: GradingSystemConfig) => void;
  subjects: Subject[];
  grades: GradeEntry[];
  periods: AcademicPeriod[];
  changeLog: ChangeLogEntry[];
  stats: SubjectStats[];
  periodStats: PeriodStats;
  onResetData: () => void;
  onRestoreBackup: (data: any) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  config,
  onUpdateConfig,
  subjects,
  grades,
  periods,
  changeLog,
  stats,
  periodStats,
  onResetData,
  onRestoreBackup,
}) => {
  const [passingGradeStr, setPassingGradeStr] = useState(config.passingGrade.toString());
  const [institutionName, setInstitutionName] = useState(config.institutionName || '');
  const [studentName, setStudentName] = useState(config.studentName || '');
  const [academicYear, setAcademicYear] = useState(config.academicYear || '2026');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const passing = parseFloat(passingGradeStr.replace(',', '.')) || 3.0;
    const updated: GradingSystemConfig = {
      ...config,
      passingGrade: passing,
      institutionName: institutionName.trim() || undefined,
      studentName: studentName.trim() || undefined,
      academicYear: academicYear.trim() || '2026',
    };
    onUpdateConfig(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.subjects && parsed.grades && parsed.periods) {
          onRestoreBackup(parsed);
          alert('¡Copia de seguridad restaurada con éxito!');
        } else {
          alert('El archivo seleccionado no tiene una estructura válida de MiRendimiento.');
        }
      } catch (err) {
        alert('Error al leer el archivo JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 font-display">
            Configuración del Sistema y Datos
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Ajusta la escala de evaluación, notas aprobatorias, información de perfil y copias de seguridad.
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Configuración guardada correctamente.</span>
        </div>
      )}

      {/* Two Columns: Config Left, Export/Backup Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: General Configuration Form */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Settings className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-base text-slate-900 font-display">
              Escala y Criterios Institucionales
            </h3>
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nombre del Estudiante</label>
                <input
                  type="text"
                  placeholder="Ej. Sofía Martínez"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Año Lectivo</label>
                <input
                  type="text"
                  placeholder="2026"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Institución Educativa</label>
              <input
                type="text"
                placeholder="Ej. Colegio San Agustín"
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white"
              />
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <label className="font-bold text-slate-900 block">
                Nota Mínima Aprobatoria (1,0 - 5,0)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  step="0.1"
                  min="1.0"
                  max="5.0"
                  value={passingGradeStr}
                  onChange={(e) => setPassingGradeStr(e.target.value)}
                  className="w-24 p-2 rounded-xl bg-white border border-slate-300 font-bold text-sm text-slate-900 text-center"
                />
                <span className="text-xs text-slate-500">
                  Valores inferiores activan alertas de atención preventiva.
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Cambios de Configuración</span>
            </button>
          </form>
        </div>

        {/* Right: Export & Backup Management */}
        <div className="space-y-6">
          {/* Export Box */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Download className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-base text-slate-900 font-display">
                Exportación y Descargas
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <button
                onClick={() =>
                  exportGradesToCSV(subjects, grades, periods, stats, periodStats, config)
                }
                className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-left hover:border-indigo-400 hover:bg-indigo-50/40 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900 group-hover:text-indigo-600 block">
                      Exportar Reporte en CSV (Excel)
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Incluye detalle de materias, promedios, pesos y estados de suficiencia.
                    </span>
                  </div>
                </div>
                <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
              </button>

              <button
                onClick={() =>
                  exportBackupJSON({
                    subjects,
                    grades,
                    periods,
                    config,
                    changelog: changeLog,
                  })
                }
                className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-left hover:border-indigo-400 hover:bg-indigo-50/40 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-indigo-600 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900 group-hover:text-indigo-600 block">
                      Descargar Copia de Seguridad JSON
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Guarda todos tus datos para restaurarlos en cualquier momento.
                    </span>
                  </div>
                </div>
                <Download className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
              </button>
            </div>
          </div>

          {/* Import / Reset Box */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Upload className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-base text-slate-900 font-display">
                Restauración de Datos
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1.5">
                  Restaurar desde archivo JSON
                </label>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-slate-500">¿Deseas restablecer los datos de ejemplo iniciales?</span>
                <button
                  onClick={() => {
                    if (confirm('¿Restablecer los datos de ejemplo del demo? Se reiniciarán las notas actuales.')) {
                      onResetData();
                    }
                  }}
                  className="inline-flex items-center gap-1 text-xs text-rose-600 hover:text-rose-800 font-semibold"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Restablecer Demo</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
