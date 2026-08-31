import React, { useState, useEffect } from 'react';
import {
  GradingSystemConfig,
  Subject,
  GradeEntry,
  AcademicPeriod,
  ChangeLogEntry,
  AcademicGoal,
} from './types';
import {
  INITIAL_PERIODS,
  INITIAL_SUBJECTS,
  INITIAL_GRADES,
  INITIAL_CHANGELOG,
  INITIAL_GOALS,
} from './lib/mockData';
import {
  DEFAULT_GRADING_CONFIG,
  computeSubjectStats,
  computePeriodStats,
  generateAcademicAlerts,
} from './lib/academicEngine';

import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { EthicalNoticeBanner } from './components/EthicalNoticeBanner';
import { SummaryDashboard } from './components/SummaryDashboard';
import { SubjectsList } from './components/SubjectsList';
import { PeriodComparisonView } from './components/PeriodComparisonView';
import { GoalsAndSimulator } from './components/GoalsAndSimulator';
import { GeminiAdvisorModal } from './components/GeminiAdvisorModal';
import { ChangeHistoryModal } from './components/ChangeHistoryModal';
import { PythonEngineModal } from './components/PythonEngineModal';
import { SettingsModal } from './components/SettingsModal';
import { PrintableReport } from './components/PrintableReport';
import { GradeModal } from './components/GradeModal';
import { SubjectModal } from './components/SubjectModal';

export const App: React.FC = () => {
  // --- Persistent Application State ---
  const [config, setConfig] = useState<GradingSystemConfig>(() => {
    const saved = localStorage.getItem('mirendimiento_config');
    return saved ? JSON.parse(saved) : DEFAULT_GRADING_CONFIG;
  });

  const [periods, setPeriods] = useState<AcademicPeriod[]>(() => {
    const saved = localStorage.getItem('mirendimiento_periods');
    return saved ? JSON.parse(saved) : INITIAL_PERIODS;
  });

  const [selectedPeriodId, setSelectedPeriodId] = useState<string>('period-3');

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem('mirendimiento_subjects');
    return saved ? JSON.parse(saved) : INITIAL_SUBJECTS;
  });

  const [grades, setGrades] = useState<GradeEntry[]>(() => {
    const saved = localStorage.getItem('mirendimiento_grades');
    return saved ? JSON.parse(saved) : INITIAL_GRADES;
  });

  const [changeLog, setChangeLog] = useState<ChangeLogEntry[]>(() => {
    const saved = localStorage.getItem('mirendimiento_changelog');
    return saved ? JSON.parse(saved) : INITIAL_CHANGELOG;
  });

  const [goals, setGoals] = useState<AcademicGoal[]>(() => {
    const saved = localStorage.getItem('mirendimiento_goals');
    return saved ? JSON.parse(saved) : INITIAL_GOALS;
  });

  // UI Navigation State
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [selectedSubjectDetailId, setSelectedSubjectDetailId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modals
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<GradeEntry | null>(null);
  const [preselectedSubjectId, setPreselectedSubjectId] = useState<string | undefined>(undefined);

  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('mirendimiento_config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('mirendimiento_periods', JSON.stringify(periods));
  }, [periods]);

  useEffect(() => {
    localStorage.setItem('mirendimiento_subjects', JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem('mirendimiento_grades', JSON.stringify(grades));
  }, [grades]);

  useEffect(() => {
    localStorage.setItem('mirendimiento_changelog', JSON.stringify(changeLog));
  }, [changeLog]);

  useEffect(() => {
    localStorage.setItem('mirendimiento_goals', JSON.stringify(goals));
  }, [goals]);

  // Active Period
  const currentPeriod =
    periods.find((p) => p.id === selectedPeriodId) || periods[0] || INITIAL_PERIODS[0];

  // Mathematical Analytics Engine Computations
  const subjectStats = subjects.map((subject) =>
    computeSubjectStats(subject, selectedPeriodId, grades, periods, config)
  );

  const periodStats = computePeriodStats(
    selectedPeriodId,
    subjects,
    grades,
    periods,
    config
  );

  const alerts = generateAcademicAlerts(
    subjects,
    grades,
    selectedPeriodId,
    periods,
    config,
    goals
  );

  // Handlers for Grade Management with Audit Log
  const handleOpenNewGrade = (subjectId?: string) => {
    setEditingGrade(null);
    setPreselectedSubjectId(subjectId);
    setIsGradeModalOpen(true);
  };

  const handleEditGrade = (grade: GradeEntry) => {
    setEditingGrade(grade);
    setPreselectedSubjectId(grade.subjectId);
    setIsGradeModalOpen(true);
  };

  const handleSaveGrade = (gradeData: Partial<GradeEntry>) => {
    const subj = subjects.find((s) => s.id === gradeData.subjectId);
    const subjName = subj ? subj.name : 'Materia';
    const periodObj = periods.find((p) => p.id === (gradeData.periodId || selectedPeriodId));
    const periodName = periodObj ? periodObj.name : 'Período';
    const nowISO = new Date().toISOString();

    if (gradeData.id) {
      // Edit existing
      const oldGrade = grades.find((g) => g.id === gradeData.id);
      const updatedGrades = grades.map((g) =>
        g.id === gradeData.id
          ? ({
              ...g,
              ...gradeData,
              updatedAt: nowISO,
            } as GradeEntry)
          : g
      );
      setGrades(updatedGrades);

      // Log edit
      const logEntry: ChangeLogEntry = {
        id: `log-${Date.now()}`,
        timestamp: nowISO,
        registeredAt: nowISO,
        entityType: 'grade',
        entityId: gradeData.id,
        entityTitle: `${gradeData.title} (${subjName})`,
        action: 'update',
        author: gradeData.origin === 'verified' || gradeData.origin === 'official' ? 'Docente' : 'Estudiante',
        oldValue: oldGrade ? `${oldGrade.score}` : undefined,
        newValue: `${gradeData.score}`,
        description: `Actualizó calificación en ${subjName}: "${gradeData.title}" a ${gradeData.score}`,
        activityDate: gradeData.date || oldGrade?.date,
        subjectName: subjName,
        periodName: periodName,
        gradeType: gradeData.type,
        score: gradeData.score,
        origin: gradeData.origin,
      };
      setChangeLog([logEntry, ...changeLog]);
    } else {
      // Create new
      const newGrade: GradeEntry = {
        id: `grade-${Date.now()}`,
        subjectId: gradeData.subjectId!,
        periodId: gradeData.periodId || selectedPeriodId,
        title: gradeData.title!,
        score: gradeData.score!,
        weightPercent: gradeData.weightPercent,
        type: gradeData.type || 'examen',
        date: gradeData.date || new Date().toISOString().split('T')[0],
        origin: gradeData.origin || 'student',
        verifiedBy: gradeData.verifiedBy,
        notes: gradeData.notes,
        createdAt: nowISO,
        updatedAt: nowISO,
      };

      setGrades([newGrade, ...grades]);

      // Log creation
      const logEntry: ChangeLogEntry = {
        id: `log-${Date.now()}`,
        timestamp: nowISO,
        registeredAt: nowISO,
        entityType: 'grade',
        entityId: newGrade.id,
        entityTitle: `${newGrade.title} (${subjName})`,
        action: 'create',
        author: newGrade.origin === 'verified' || newGrade.origin === 'official' ? 'Docente' : 'Estudiante',
        newValue: `${newGrade.score} (Peso: ${newGrade.weightPercent !== undefined ? newGrade.weightPercent + '%' : 'N/A'})`,
        description: `Registró calificación voluntaria en ${subjName}: "${newGrade.title}" con ${newGrade.score}`,
        activityDate: newGrade.date,
        subjectName: subjName,
        periodName: periodName,
        gradeType: newGrade.type,
        score: newGrade.score,
        origin: newGrade.origin,
      };
      setChangeLog([logEntry, ...changeLog]);
    }
  };

  const handleDeleteGrade = (gradeId: string) => {
    const toDelete = grades.find((g) => g.id === gradeId);
    if (!toDelete) return;
    const subj = subjects.find((s) => s.id === toDelete.subjectId);
    const periodObj = periods.find((p) => p.id === toDelete.periodId);

    if (confirm(`¿Deseas eliminar la calificación "${toDelete.title}" (${toDelete.score})?`)) {
      setGrades(grades.filter((g) => g.id !== gradeId));

      const logEntry: ChangeLogEntry = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        registeredAt: new Date().toISOString(),
        entityType: 'grade',
        entityId: gradeId,
        entityTitle: `${toDelete.title} (${subj?.name || 'Materia'})`,
        action: 'delete',
        author: 'Estudiante',
        oldValue: `${toDelete.score}`,
        description: `Eliminó calificación en ${subj?.name || 'Materia'}: "${toDelete.title}"`,
        activityDate: toDelete.date,
        subjectName: subj?.name,
        periodName: periodObj?.name,
        gradeType: toDelete.type,
        score: toDelete.score,
        origin: toDelete.origin,
      };
      setChangeLog([logEntry, ...changeLog]);
    }
  };

  // Handlers for Subject Management
  const handleOpenNewSubject = () => {
    setEditingSubject(null);
    setIsSubjectModalOpen(true);
  };

  const handleEditSubject = (subject: Subject) => {
    setEditingSubject(subject);
    setIsSubjectModalOpen(true);
  };

  const handleSaveSubject = (subjData: Partial<Subject>) => {
    if (subjData.id) {
      setSubjects(
        subjects.map((s) => (s.id === subjData.id ? ({ ...s, ...subjData } as Subject) : s))
      );
    } else {
      const newSubject: Subject = {
        id: `subj-${Date.now()}`,
        name: subjData.name!,
        code: subjData.code,
        professorName: subjData.professorName,
        calculationMethod: subjData.calculationMethod || 'weighted',
        targetGrade: subjData.targetGrade || 4.0,
        colorTag: subjData.colorTag || 'indigo',
        observations: subjData.observations,
        isCustom: true,
      };
      setSubjects([...subjects, newSubject]);

      const logEntry: ChangeLogEntry = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        entityType: 'subject',
        entityId: newSubject.id,
        entityTitle: newSubject.name,
        action: 'create',
        author: 'Estudiante',
        newValue: newSubject.name,
        description: `Creó la materia "${newSubject.name}" (${newSubject.calculationMethod})`,
      };
      setChangeLog([logEntry, ...changeLog]);
    }
  };

  const handleDeleteSubject = (subjectId: string) => {
    const subj = subjects.find((s) => s.id === subjectId);
    if (!subj) return;

    if (
      confirm(
        `¿Estás seguro de eliminar la materia "${subj.name}" y todas sus calificaciones registradas?`
      )
    ) {
      setSubjects(subjects.filter((s) => s.id !== subjectId));
      setGrades(grades.filter((g) => g.subjectId !== subjectId));

      const logEntry: ChangeLogEntry = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        entityType: 'subject',
        entityId: subjectId,
        entityTitle: subj.name,
        action: 'delete',
        author: 'Estudiante',
        oldValue: subj.name,
        description: `Eliminó la materia "${subj.name}" y sus registros asociados.`,
      };
      setChangeLog([logEntry, ...changeLog]);
    }
  };

  // Reset to initial demo data
  const handleResetData = () => {
    localStorage.clear();
    setConfig(DEFAULT_GRADING_CONFIG);
    setPeriods(INITIAL_PERIODS);
    setSubjects(INITIAL_SUBJECTS);
    setGrades(INITIAL_GRADES);
    setChangeLog(INITIAL_CHANGELOG);
    setGoals(INITIAL_GOALS);
    setSelectedPeriodId('period-3');
    setCurrentTab('dashboard');
  };

  const handleRestoreBackup = (data: any) => {
    if (data.config) setConfig(data.config);
    if (data.periods) setPeriods(data.periods);
    if (data.subjects) setSubjects(data.subjects);
    if (data.grades) setGrades(data.grades);
    if (data.changelog) setChangeLog(data.changelog);
    if (data.goals) setGoals(data.goals);
    setCurrentTab('dashboard');
  };

  return (
    <div className="flex h-screen w-full bg-[#F3F4F6] font-sans text-slate-800 overflow-hidden">
      {/* 1. Geometric Balance - Dark Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        periods={periods}
        selectedPeriodId={selectedPeriodId}
        setSelectedPeriodId={setSelectedPeriodId}
        onOpenNewGrade={() => handleOpenNewGrade()}
        onOpenExport={() => setCurrentTab('report')}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* 2. Main Content Layout Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Top Header Navbar */}
        <Navbar
          currentTab={currentTab}
          periods={periods}
          selectedPeriodId={selectedPeriodId}
          setSelectedPeriodId={setSelectedPeriodId}
          onOpenNewGrade={() => handleOpenNewGrade()}
          onOpenExport={() => setCurrentTab('report')}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          periodStats={periodStats}
          config={config}
        />

        {/* Scrollable View Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {/* Ethical Notice Banner (Always accessible at the top of the views) */}
          {currentTab !== 'report' && <EthicalNoticeBanner />}

          {/* Tab 1: Dashboard */}
          {currentTab === 'dashboard' && (
            <SummaryDashboard
              currentPeriod={currentPeriod}
              periodStats={periodStats}
              subjectStats={subjectStats}
              subjects={subjects}
              alerts={alerts}
              goals={goals}
              config={config}
              onOpenNewGrade={() => handleOpenNewGrade()}
              onSelectSubject={(subjId) => {
                setSelectedSubjectDetailId(subjId);
                setCurrentTab('subjects');
              }}
              onNavigateTab={(tab) => setCurrentTab(tab)}
            />
          )}

          {/* Tab 2: Subjects & Grades Management */}
          {currentTab === 'subjects' && (
            <SubjectsList
              subjects={subjects}
              subjectStats={subjectStats}
              grades={grades}
              currentPeriod={currentPeriod}
              config={config}
              onOpenNewGrade={handleOpenNewGrade}
              onEditGrade={handleEditGrade}
              onDeleteGrade={handleDeleteGrade}
              onOpenNewSubject={handleOpenNewSubject}
              onEditSubject={handleEditSubject}
              onDeleteSubject={handleDeleteSubject}
              selectedSubjectDetailId={selectedSubjectDetailId}
              onSelectSubjectDetail={setSelectedSubjectDetailId}
            />
          )}

          {/* Tab 3: Period Comparison & Historical Evolution */}
          {currentTab === 'periods' && (
            <PeriodComparisonView
              periods={periods}
              subjects={subjects}
              grades={grades}
              config={config}
              selectedPeriodId={selectedPeriodId}
            />
          )}

          {/* Tab 4: Goals and What-If Simulator */}
          {currentTab === 'goals' && (
            <GoalsAndSimulator
              periods={periods}
              subjects={subjects}
              grades={grades}
              currentPeriodId={selectedPeriodId}
              config={config}
              goals={goals}
              onSaveGoal={(newGoal) => {
                const updated = goals.filter((g) => g.id !== newGoal.id);
                setGoals([...updated, newGoal]);
              }}
            />
          )}

          {/* Tab 5: Responsible Gemini AI Academic Advisor */}
          {currentTab === 'advisor' && (
            <GeminiAdvisorModal
              currentPeriod={currentPeriod}
              periodStats={periodStats}
              subjectStats={subjectStats}
              alerts={alerts}
              goals={goals}
            />
          )}

          {/* Tab 6: Change History & Audit Logs */}
          {currentTab === 'history' && <ChangeHistoryModal changeLog={changeLog} />}

          {/* Tab 7: Python Parity Engine & Formula Transparency */}
          {currentTab === 'python' && (
            <PythonEngineModal
              subjects={subjects}
              grades={grades}
              periods={periods}
              currentPeriodId={selectedPeriodId}
            />
          )}

          {/* Tab 8: System Settings & Backup */}
          {currentTab === 'settings' && (
            <SettingsModal
              config={config}
              onUpdateConfig={setConfig}
              subjects={subjects}
              grades={grades}
              periods={periods}
              changeLog={changeLog}
              stats={subjectStats}
              periodStats={periodStats}
              onResetData={handleResetData}
              onRestoreBackup={handleRestoreBackup}
            />
          )}

          {/* Tab 9: Printable / PDF Academic Report */}
          {currentTab === 'report' && (
            <PrintableReport
              currentPeriod={currentPeriod}
              periodStats={periodStats}
              subjectStats={subjectStats}
              subjects={subjects}
              grades={grades}
              config={config}
              onClose={() => setCurrentTab('dashboard')}
            />
          )}
        </main>

        {/* 3. Geometric Balance - Clean Footer */}
        <footer className="h-12 bg-white border-t border-slate-200 px-4 sm:px-8 flex items-center justify-between text-[11px] text-slate-400 font-medium shrink-0 no-print">
          <div className="flex gap-4">
            <span className="font-semibold text-slate-500">© 2026 MIRendIMIENTO</span>
            <span className="hidden sm:inline">HERRAMIENTA COMPLEMENTARIA</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full" />
            <span className="font-semibold text-slate-600">MODO: ANÁLISIS PERSONAL ACTIVADO</span>
          </div>
        </footer>
      </div>

      {/* Grade Registration / Edit Modal */}
      <GradeModal
        isOpen={isGradeModalOpen}
        onClose={() => {
          setIsGradeModalOpen(false);
          setEditingGrade(null);
        }}
        onSave={handleSaveGrade}
        subjects={subjects}
        periods={periods}
        currentPeriodId={selectedPeriodId}
        initialGrade={editingGrade}
        preselectedSubjectId={preselectedSubjectId}
      />

      {/* Subject Creation / Edit Modal */}
      <SubjectModal
        isOpen={isSubjectModalOpen}
        onClose={() => {
          setIsSubjectModalOpen(false);
          setEditingSubject(null);
        }}
        onSave={handleSaveSubject}
        initialSubject={editingSubject}
      />
    </div>
  );
};

export default App;
