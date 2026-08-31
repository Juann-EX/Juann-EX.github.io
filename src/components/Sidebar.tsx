import React from 'react';
import {
  BarChart3,
  BookOpen,
  Calendar,
  Target,
  Sparkles,
  History,
  FileCode2,
  Settings,
  Download,
  PlusCircle,
  ShieldCheck,
  GraduationCap,
  X
} from 'lucide-react';
import { AcademicPeriod } from '../types';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  periods: AcademicPeriod[];
  selectedPeriodId: string;
  setSelectedPeriodId: (id: string) => void;
  onOpenNewGrade: () => void;
  onOpenExport: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  periods,
  selectedPeriodId,
  setSelectedPeriodId,
  onOpenNewGrade,
  onOpenExport,
  isOpenMobile,
  onCloseMobile,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Panel General', icon: BarChart3 },
    { id: 'subjects', label: 'Materias', icon: BookOpen },
    { id: 'periods', label: 'Comparativa', icon: Calendar },
    { id: 'goals', label: 'Metas & Simulador', icon: Target },
    { id: 'advisor', label: 'Asesor IA Ético', icon: Sparkles, badge: 'Gemini' },
    { id: 'history', label: 'Historial / Auditoría', icon: History },
    { id: 'python', label: 'Motor Python', icon: FileCode2 },
    { id: 'settings', label: 'Configuración', icon: Settings },
  ];

  const handleNavClick = (tabId: string) => {
    setCurrentTab(tabId);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Aside */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-200 ease-in-out shrink-0 border-r border-slate-800/80 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-lg text-white shadow-sm shadow-indigo-500/30">
              M
            </div>
            <div>
              <span className="font-bold tracking-tight text-lg text-white font-display block leading-none">
                MiRendimiento
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
                Análisis Académico
              </span>
            </div>
          </div>

          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`w-full p-3 rounded-lg text-sm font-medium flex items-center justify-between transition-all ${
                  isActive
                    ? 'bg-slate-800 text-white font-bold shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : 'opacity-70'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/30 text-indigo-300 border border-indigo-400/20">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick Action in Sidebar */}
        <div className="px-4 py-2 space-y-2">
          <button
            onClick={() => {
              onOpenNewGrade();
              onCloseMobile();
            }}
            className="w-full py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-indigo-600/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Registrar Calificación</span>
          </button>
        </div>

        {/* Important Ethical Notice Box in Footer */}
        <div className="p-4 mt-auto border-t border-slate-800">
          <div className="bg-slate-800/90 rounded-lg p-3 text-xs text-slate-300 border border-slate-700/60 space-y-1">
            <div className="flex items-center gap-1.5 text-indigo-400 font-bold text-[11px] uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Nota Importante</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              Estos cálculos se basan en datos ingresados manualmente y no son calificaciones oficiales.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
