import React from 'react';
import {
  Menu,
  PlusCircle,
  Download,
  Calendar,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { AcademicPeriod, PeriodStats, GradingSystemConfig } from '../types';
import { formatScoreSpanish } from '../lib/academicEngine';

interface NavbarProps {
  currentTab: string;
  periods: AcademicPeriod[];
  selectedPeriodId: string;
  setSelectedPeriodId: (id: string) => void;
  onOpenNewGrade: () => void;
  onOpenExport: () => void;
  onOpenMobileMenu: () => void;
  periodStats?: PeriodStats;
  config?: GradingSystemConfig;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  periods,
  selectedPeriodId,
  setSelectedPeriodId,
  onOpenNewGrade,
  onOpenExport,
  onOpenMobileMenu,
  periodStats,
  config,
}) => {
  const currentPeriod = periods.find((p) => p.id === selectedPeriodId) || periods[0];

  const getTabTitle = (tab: string) => {
    switch (tab) {
      case 'dashboard':
        return 'Resumen del Período Actual';
      case 'subjects':
        return 'Gestión de Materias y Calificaciones';
      case 'periods':
        return 'Comparativa y Evolución entre Períodos';
      case 'goals':
        return 'Metas Académicas y Simulador';
      case 'advisor':
        return 'Asesor Académico IA Ético';
      case 'history':
        return 'Historial de Cambios y Auditoría';
      case 'python':
        return 'Motor de Validación Python & Paridad';
      case 'settings':
        return 'Configuración del Sistema';
      case 'report':
        return 'Reporte Académico Imprimible';
      default:
        return 'Panel Principal';
    }
  };

  // Student Initials
  const studentName = config?.studentName || 'Juan Diego';
  const initials = studentName
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'JU';

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 shrink-0 sticky top-0 z-30 shadow-xs no-print">
      {/* Left: Mobile Menu Trigger + Tab Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 lg:hidden transition-colors"
          title="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 font-display leading-tight">
            {getTabTitle(currentTab)}
          </h1>
          <p className="text-[11px] text-slate-500 hidden sm:block">
            {config?.institutionName || 'Colegio / Institución'} • {currentPeriod?.name || 'Período 1'} (Año {config?.academicYear || '2026'})
          </p>
        </div>
      </div>

      {/* Right: Period Switcher, Quick Stats & Action Controls */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Period Selector Pills */}
        <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200/80 text-xs">
          {periods.map((period) => {
            const isSelected = period.id === selectedPeriodId;
            return (
              <button
                key={period.id}
                id={`header-period-${period.id}`}
                onClick={() => setSelectedPeriodId(period.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-white text-indigo-700 font-bold shadow-xs border border-slate-200/60'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {period.name}
              </button>
            );
          })}
        </div>

        {/* Promedio General Metric */}
        {periodStats && (
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest leading-none">
              Promedio General
            </span>
            <span className="text-xl sm:text-2xl font-black text-indigo-600 font-display leading-tight mt-0.5">
              {formatScoreSpanish(periodStats.generalAverage)}
            </span>
          </div>
        )}

        <div className="w-px h-8 bg-slate-200 hidden sm:block" />

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenExport}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all border border-slate-200/60"
            title="Exportar Reporte / CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Exportar</span>
          </button>

          <button
            onClick={onOpenNewGrade}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all shadow-xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Nueva Nota</span>
          </button>

          {/* Student Profile Avatar */}
          <div
            className="w-9 h-9 rounded-full bg-slate-200 border-2 border-white shadow-xs overflow-hidden flex items-center justify-center font-bold text-xs text-slate-600 shrink-0"
            title={`Estudiante: ${studentName}`}
          >
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
};
