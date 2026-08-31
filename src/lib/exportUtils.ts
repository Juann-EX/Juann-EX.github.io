/**
 * MiRendimiento - Export & Backup Utilities
 * Generación de reportes transparentes en CSV, PDF y copias de seguridad JSON
 */

import {
  Subject,
  AcademicPeriod,
  GradeEntry,
  GradingSystemConfig,
  SubjectStats,
  PeriodStats,
  ChangeLogEntry,
} from '../types';
import { formatScoreSpanish } from './academicEngine';

/**
 * Exporta el conjunto de calificaciones y materias en formato CSV compatible con Excel
 */
export function exportGradesToCSV(
  subjects: Subject[],
  grades: GradeEntry[],
  periods: AcademicPeriod[],
  stats: SubjectStats[],
  periodStats: PeriodStats,
  config: GradingSystemConfig
): void {
  const headers = [
    'Período',
    'Materia',
    'Docente',
    'Tipo de Cálculo',
    'Actividad / Evaluación',
    'Tipo',
    'Calificación (1.0-5.0)',
    'Peso (%)',
    'Fecha',
    'Origen del Dato',
    'Estado de Suficiencia',
    'Promedio Materia',
    'Clasificación',
    'Notas Adicionales',
  ];

  const rows: string[][] = [];

  // Mapeo de actividades individuales
  grades.forEach((g) => {
    const subj = subjects.find((s) => s.id === g.subjectId);
    const per = periods.find((p) => p.id === g.periodId);
    const subStat = stats.find((st) => st.subjectId === g.subjectId && st.periodId === g.periodId);

    const originText =
      g.origin === 'verified'
        ? `Verificado por ${g.verifiedBy || 'Docente'}`
        : 'Registrado por Estudiante';

    rows.push([
      per ? per.name : g.periodId,
      subj ? subj.name : g.subjectId,
      subj?.professorName || 'No especificado',
      subj?.calculationMethod === 'weighted' ? 'Ponderado' : 'Simple',
      `"${(g.title || '').replace(/"/g, '""')}"`,
      g.type,
      formatScoreSpanish(g.score),
      g.weightPercent !== undefined ? `${g.weightPercent}%` : 'N/A',
      g.date,
      originText,
      subStat ? subStat.sufficiencyMessage : 'N/A',
      formatScoreSpanish(subStat?.average),
      subStat?.classification?.label || 'Sin clasificar',
      `"${(g.notes || '').replace(/"/g, '""')}"`,
    ]);
  });

  // Si alguna materia no tiene notas en este período, incluir fila informativa
  subjects.forEach((subj) => {
    const hasGrades = grades.some((g) => g.subjectId === subj.id && g.periodId === periodStats.periodId);
    if (!hasGrades) {
      const per = periods.find((p) => p.id === periodStats.periodId);
      rows.push([
        per ? per.name : periodStats.periodId,
        subj.name,
        subj.professorName || 'No especificado',
        subj.calculationMethod === 'weighted' ? 'Ponderado' : 'Simple',
        'Sin calificaciones registradas',
        'N/A',
        '—',
        'N/A',
        '—',
        'Sin datos',
        'Sin datos (Consulta con tu docente)',
        '—',
        'Sin datos',
        'Información pendiente de registro',
      ]);
    }
  });

  const csvContent = [
    `# REPORTE DE RENDIMIENTO ACADÉMICO - MiRendimiento`,
    `# Nota ética: Cálculos matemáticos generados con base en datos legítimos registrados por el usuario. No reemplaza el boletín oficial.`,
    `# Fecha de exportación: ${new Date().toLocaleString('es-CO')}`,
    `# Promedio General del Período: ${formatScoreSpanish(periodStats.generalAverage)}`,
    headers.join(';'),
    ...rows.map((r) => r.join(';')),
  ].join('\r\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `MiRendimiento_Reporte_${periodStats.periodName.replace(/\s+/g, '_')}_${new Date()
      .toISOString()
      .split('T')[0]}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exporta copia de seguridad JSON completa
 */
export function exportBackupJSON(payload: {
  subjects: Subject[];
  grades: GradeEntry[];
  periods: AcademicPeriod[];
  config: GradingSystemConfig;
  changelog: ChangeLogEntry[];
}): void {
  const jsonString = JSON.stringify(
    {
      app: 'MiRendimiento',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      disclaimer:
        'Copia de seguridad personal e independiente. Los datos corresponden exclusivamente a la información registrada por el estudiante.',
      ...payload,
    },
    null,
    2
  );

  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `MiRendimiento_Backup_${new Date().toISOString().split('T')[0]}.json`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Activa la vista de impresión optimizada para PDF
 */
export function triggerBrowserPrint(): void {
  window.print();
}
