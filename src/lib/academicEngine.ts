/**
 * MiRendimiento - Mathematical and Statistical Academic Engine
 * Implementación transparente con algoritmos de cálculo, tendencias y proyecciones
 */

import {
  GradeEntry,
  Subject,
  AcademicPeriod,
  GradingSystemConfig,
  SubjectStats,
  PeriodStats,
  AcademicAlert,
  DataSufficiency,
  TrendDirection,
  ScaleRange,
  AcademicGoal,
} from '../types';

export const DEFAULT_GRADING_CONFIG: GradingSystemConfig = {
  institutionName: 'Institución Educativa (Configurable)',
  minGrade: 1.0,
  maxGrade: 5.0,
  passingGrade: 3.0,
  decimalPrecision: 1,
  minGradesForSufficiency: 3,
  minWeightPercentForSufficiency: 60,
  ranges: [
    {
      id: 'bajo',
      label: 'Bajo',
      min: 1.0,
      max: 2.9,
      color: '#ef4444',
      badgeBg: 'bg-rose-50 border-rose-200 text-rose-700',
      badgeText: '🔴 Bajo (Requiere apoyo)',
      description: 'Promedio inferior al desempeño mínimo aprobatorio (1.0 - 2.9).',
    },
    {
      id: 'basico',
      label: 'Básico / Por mejorar',
      min: 3.0,
      max: 3.9,
      color: '#f59e0b',
      badgeBg: 'bg-amber-50 border-amber-200 text-amber-800',
      badgeText: '🟡 Básico / Por mejorar',
      description: 'Promedio aprobatorio básico con oportunidad clara de mejora (3.0 - 3.9).',
    },
    {
      id: 'alto',
      label: 'Alto',
      min: 4.0,
      max: 4.5,
      color: '#10b981',
      badgeBg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      badgeText: '🟢 Alto',
      description: 'Buen desempeño académico sostenido (4.0 - 4.5).',
    },
    {
      id: 'superior',
      label: 'Superior',
      min: 4.6,
      max: 5.0,
      color: '#3b82f6',
      badgeBg: 'bg-blue-50 border-blue-200 text-blue-800',
      badgeText: '🔵 Superior',
      description: 'Desempeño sobresaliente y de excelencia (4.6 - 5.0).',
    },
  ],
};

/**
 * Redondeo decimal seguro para sistemas de 1.0 a 5.0
 */
export function roundScore(value: number, decimals: number = 1): number {
  const factor = Math.pow(10, decimals);
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

/**
 * Formateo en español con coma decimal (ej. "3,8")
 */
export function formatScoreSpanish(value: number | null | undefined, decimals: number = 1): string {
  if (value === null || value === undefined || isNaN(value)) {
    return '—';
  }
  return value.toFixed(decimals).replace('.', ',');
}

/**
 * Determina la clasificación de escala de un puntaje según la configuración
 */
export function classifyGrade(score: number | null, config: GradingSystemConfig): ScaleRange | null {
  if (score === null || isNaN(score)) return null;
  const rounded = roundScore(score, 1);
  for (const range of config.ranges) {
    if (rounded >= range.min && rounded <= range.max) {
      return range;
    }
  }
  // Fallback boundary handling
  if (rounded < config.minGrade) return config.ranges[0];
  if (rounded > config.maxGrade) return config.ranges[config.ranges.length - 1];
  return null;
}

/**
 * Calcula el promedio de una materia en un período específico
 */
export function calculateSubjectAverage(
  subject: Subject,
  grades: GradeEntry[],
  config: GradingSystemConfig
): { average: number | null; totalWeight: number; formulaDetails: string } {
  if (!grades || grades.length === 0) {
    return {
      average: null,
      totalWeight: 0,
      formulaDetails: 'Sin calificaciones registradas para este período.',
    };
  }

  if (subject.calculationMethod === 'weighted') {
    // Promedio Ponderado
    const validWeightedGrades = grades.filter(
      (g) => g.weightPercent !== undefined && g.weightPercent > 0
    );

    if (validWeightedGrades.length > 0) {
      let sumProduct = 0;
      let sumWeights = 0;

      validWeightedGrades.forEach((g) => {
        const weight = g.weightPercent || 0;
        sumProduct += g.score * weight;
        sumWeights += weight;
      });

      if (sumWeights > 0) {
        // Normalizamos si el peso total es menor o diferente a 100
        const calculatedAverage = sumProduct / sumWeights;
        const normalized = roundScore(calculatedAverage, 2);
        return {
          average: normalized,
          totalWeight: sumWeights,
          formulaDetails: `Promedio Ponderado: Σ(nota × peso) / Σ(pesos) = ${roundScore(
            sumProduct,
            2
          )} / ${sumWeights}% = ${formatScoreSpanish(normalized)} (peso acumulado: ${sumWeights}%)`,
        };
      }
    }
  }

  // Promedio Simple (Aritmético)
  const sum = grades.reduce((acc, g) => acc + g.score, 0);
  const simpleAverage = roundScore(sum / grades.length, 2);

  return {
    average: simpleAverage,
    totalWeight: 100,
    formulaDetails: `Promedio Simple: Σ(notas) / n = ${roundScore(sum, 2)} / ${
      grades.length
    } = ${formatScoreSpanish(simpleAverage)}`,
  };
}

/**
 * Evalúa la suficiencia de la información disponible
 */
export function evaluateDataSufficiency(
  gradesCount: number,
  totalWeightPercent: number,
  isWeighted: boolean,
  config: GradingSystemConfig
): { sufficiency: DataSufficiency; message: string } {
  if (gradesCount === 0) {
    return {
      sufficiency: 'no_data',
      message:
        'Todavía no hay resultados registrados. Esto NO significa que tengas actividades pendientes; consulta con tu docente para verificar.',
    };
  }

  if (isWeighted) {
    if (totalWeightPercent >= config.minWeightPercentForSufficiency && gradesCount >= 2) {
      return {
        sufficiency: 'sufficient',
        message: `Información suficiente (${gradesCount} actividades, ${totalWeightPercent}% del período evaluado).`,
      };
    }
    return {
      sufficiency: 'incomplete',
      message: `Información preliminar: faltan datos (${gradesCount} actividades, solo ${totalWeightPercent}% evaluado).`,
    };
  }

  // Simple average sufficiency
  if (gradesCount >= config.minGradesForSufficiency) {
    return {
      sufficiency: 'sufficient',
      message: `Información suficiente (${gradesCount} calificaciones registradas).`,
    };
  }

  return {
    sufficiency: 'incomplete',
    message: `Información incompleta (${gradesCount} de ${config.minGradesForSufficiency} actividades recomendadas para un cálculo consolidado).`,
  };
}

/**
 * Calcula estadísticas completas para una materia en un período
 */
export function computeSubjectStats(
  subject: Subject,
  periodId: string,
  allGrades: GradeEntry[],
  periods: AcademicPeriod[],
  config: GradingSystemConfig,
  targetGrade?: number
): SubjectStats {
  const currentPeriodGrades = allGrades.filter(
    (g) => g.subjectId === subject.id && g.periodId === periodId
  );

  const { average, totalWeight } = calculateSubjectAverage(
    subject,
    currentPeriodGrades,
    config
  );

  const { sufficiency, message: sufficiencyMessage } = evaluateDataSufficiency(
    currentPeriodGrades.length,
    totalWeight,
    subject.calculationMethod === 'weighted',
    config
  );

  const classification = classifyGrade(average, config);

  // Análisis de tendencia comparando con períodos anteriores
  const currentPeriodObj = periods.find((p) => p.id === periodId);
  const currentPeriodOrder = currentPeriodObj ? currentPeriodObj.order : 1;

  let trend: TrendDirection = 'insufficient_data';
  let trendDelta: number | null = null;
  let trendMessage = 'Sin referencia previa para calcular tendencia.';

  if (currentPeriodOrder > 1 && average !== null) {
    const previousPeriodObj = periods.find((p) => p.order === currentPeriodOrder - 1);
    if (previousPeriodObj) {
      const prevGrades = allGrades.filter(
        (g) => g.subjectId === subject.id && g.periodId === previousPeriodObj.id
      );
      const prevCalc = calculateSubjectAverage(subject, prevGrades, config);

      if (prevCalc.average !== null) {
        trendDelta = roundScore(average - prevCalc.average, 1);
        if (trendDelta >= 0.2) {
          trend = 'improving';
          trendMessage = `📈 Mejorando: aumento de +${formatScoreSpanish(
            trendDelta
          )} puntos respecto al ${previousPeriodObj.name}.`;
        } else if (trendDelta <= -0.2) {
          trend = 'declining';
          trendMessage = `📉 Disminuyendo: variación de ${formatScoreSpanish(
            trendDelta
          )} puntos respecto al ${previousPeriodObj.name}.`;
        } else {
          trend = 'stable';
          trendMessage = `➡️ Rendimiento estable respecto al ${previousPeriodObj.name}.`;
        }
      }
    }
  }

  // Meta del estudiante
  let targetDelta: number | undefined;
  let targetStatus: 'achieved' | 'near' | 'in_progress' | 'none' = 'none';

  if (targetGrade && targetGrade > 0) {
    if (average !== null) {
      targetDelta = roundScore(targetGrade - average, 1);
      if (targetDelta <= 0) {
        targetStatus = 'achieved';
      } else if (targetDelta <= 0.3) {
        targetStatus = 'near';
      } else {
        targetStatus = 'in_progress';
      }
    }
  }

  // Desglose de origen
  const studentCount = currentPeriodGrades.filter((g) => g.origin === 'student').length;
  const verifiedCount = currentPeriodGrades.filter((g) => g.origin === 'verified').length;

  const dates = currentPeriodGrades
    .map((g) => g.updatedAt || g.createdAt || g.date)
    .filter(Boolean)
    .sort()
    .reverse();

  return {
    subjectId: subject.id,
    subjectName: subject.name,
    periodId,
    average,
    totalGrades: currentPeriodGrades.length,
    totalWeightPercent: totalWeight,
    sufficiency,
    sufficiencyMessage,
    classification,
    trend,
    trendDelta,
    trendMessage,
    targetGrade,
    targetDelta,
    targetStatus,
    originBreakdown: {
      studentCount,
      verifiedCount,
    },
    lastUpdateDate: dates[0] || undefined,
  };
}

/**
 * Calcula estadísticas globales para un período académico
 */
export function computePeriodStats(
  periodId: string,
  subjects: Subject[],
  allGrades: GradeEntry[],
  periods: AcademicPeriod[],
  config: GradingSystemConfig
): PeriodStats {
  const currentPeriodObj = periods.find((p) => p.id === periodId);
  const periodName = currentPeriodObj ? currentPeriodObj.name : 'Período';
  const currentOrder = currentPeriodObj ? currentPeriodObj.order : 1;

  const subjectStatsList = subjects.map((s) =>
    computeSubjectStats(s, periodId, allGrades, periods, config)
  );

  const evaluated = subjectStatsList.filter((s) => s.average !== null);
  const sufficient = subjectStatsList.filter((s) => s.sufficiency === 'sufficient');
  const incomplete = subjectStatsList.filter((s) => s.sufficiency === 'incomplete');
  const noData = subjectStatsList.filter((s) => s.sufficiency === 'no_data');

  let generalAverage: number | null = null;
  if (evaluated.length > 0) {
    const sum = evaluated.reduce((acc, s) => acc + (s.average || 0), 0);
    generalAverage = roundScore(sum / evaluated.length, 2);
  }

  const classification = classifyGrade(generalAverage, config);

  let deltaVsPrevious: number | null = null;
  let deltaVsFirst: number | null = null;
  let trend: TrendDirection = 'insufficient_data';

  if (currentOrder > 1 && generalAverage !== null) {
    // Comparar con período inmediatamente anterior
    const prevPeriod = periods.find((p) => p.order === currentOrder - 1);
    if (prevPeriod) {
      const prevStats = computePeriodStats(prevPeriod.id, subjects, allGrades, periods, config);
      if (prevStats.generalAverage !== null) {
        deltaVsPrevious = roundScore(generalAverage - prevStats.generalAverage, 1);
        if (deltaVsPrevious >= 0.1) {
          trend = 'improving';
        } else if (deltaVsPrevious <= -0.1) {
          trend = 'declining';
        } else {
          trend = 'stable';
        }
      }
    }

    // Comparar con 1er período
    const firstPeriod = periods.find((p) => p.order === 1);
    if (firstPeriod && firstPeriod.id !== periodId) {
      const firstStats = computePeriodStats(firstPeriod.id, subjects, allGrades, periods, config);
      if (firstStats.generalAverage !== null) {
        deltaVsFirst = roundScore(generalAverage - firstStats.generalAverage, 1);
      }
    }
  }

  return {
    periodId,
    periodName,
    generalAverage,
    subjectsCount: subjects.length,
    evaluatedSubjectsCount: evaluated.length,
    sufficientSubjectsCount: sufficient.length,
    incompleteSubjectsCount: incomplete.length,
    noDataSubjectsCount: noData.length,
    classification,
    deltaVsPrevious,
    deltaVsFirst,
    trend,
  };
}

/**
 * Genera alertas inteligentes y no alarmistas para orientar al estudiante
 */
export function generateAcademicAlerts(
  subjects: Subject[],
  allGrades: GradeEntry[],
  periodId: string,
  periods: AcademicPeriod[],
  config: GradingSystemConfig,
  goals: AcademicGoal[]
): AcademicAlert[] {
  const alerts: AcademicAlert[] = [];

  subjects.forEach((subject) => {
    const stats = computeSubjectStats(subject, periodId, allGrades, periods, config);

    // Alerta 1: Sin datos
    if (stats.sufficiency === 'no_data') {
      alerts.push({
        id: `no-data-${subject.id}`,
        type: 'no_data',
        title: `Información pendiente en ${subject.name}`,
        message: `No hay resultados registrados todavía. Esto no significa necesariamente que tengas actividades pendientes; verifica con tu docente.`,
        severity: 'info',
        subjectId: subject.id,
        subjectName: subject.name,
        actionHint: 'Registrar notas que tengas a mano o consultar al profesor.',
      });
    }

    // Alerta 2: Información incompleta
    else if (stats.sufficiency === 'incomplete') {
      alerts.push({
        id: `incomplete-${subject.id}`,
        type: 'incomplete_data',
        title: `Datos preliminares en ${subject.name}`,
        message: `Solo cuentas con ${stats.totalGrades} resultado(s) registrado(s). El promedio actual (${formatScoreSpanish(
          stats.average
        )}) puede variar conforme se evalúen más actividades.`,
        severity: 'warning',
        subjectId: subject.id,
        subjectName: subject.name,
        actionHint: 'Agrega nuevas calificaciones a medida que se publiquen.',
      });
    }

    // Alerta 3: Materia que requiere mayor atención (Bajo rendimiento respetuoso)
    if (stats.average !== null && stats.average < config.passingGrade) {
      alerts.push({
        id: `risk-${subject.id}`,
        type: 'attention_priority',
        title: `${subject.name} podría requerir mayor atención`,
        message: `Tu promedio registrado actual es de ${formatScoreSpanish(
          stats.average
        )}, por debajo del mínimo aprobatorio de ${formatScoreSpanish(
          config.passingGrade
        )}. Explora el simulador de escenarios para planificar tus próximas entregas.`,
        severity: 'alert',
        subjectId: subject.id,
        subjectName: subject.name,
        actionHint: 'Revisar temas clave y consultar dudas con el docente.',
      });
    }

    // Alerta 4: Mejora destacada
    if (stats.trend === 'improving' && stats.trendDelta !== null && stats.trendDelta >= 0.3) {
      alerts.push({
        id: `improvement-${subject.id}`,
        type: 'improvement',
        title: `¡Evolución positiva en ${subject.name}!`,
        message: `Tu rendimiento ha subido +${formatScoreSpanish(
          stats.trendDelta
        )} puntos respecto al período anterior.`,
        severity: 'success',
        subjectId: subject.id,
        subjectName: subject.name,
        actionHint: 'Continúa con la metodología de estudio que vienes aplicando.',
      });
    }
  });

  // Alerta 5: Metas cercanas
  goals
    .filter((g) => g.periodId === periodId)
    .forEach((goal) => {
      if (goal.subjectId) {
        const sub = subjects.find((s) => s.id === goal.subjectId);
        if (sub) {
          const stats = computeSubjectStats(sub, periodId, allGrades, periods, config);
          if (
            stats.average !== null &&
            stats.average < goal.targetGrade &&
            goal.targetGrade - stats.average <= 0.3
          ) {
            alerts.push({
              id: `goal-near-${goal.id}`,
              type: 'goal_near',
              title: `Meta muy cercana en ${sub.name}`,
              message: `Estás a tan solo ${formatScoreSpanish(
                goal.targetGrade - stats.average
              )} puntos de tu meta de ${formatScoreSpanish(goal.targetGrade)}.`,
              severity: 'info',
              subjectId: sub.id,
              subjectName: sub.name,
              actionHint: 'Un buen desempeño en la siguiente actividad te permitirá alcanzarla.',
            });
          }
        }
      }
    });

  return alerts;
}

/**
 * Simulador de Escenarios Hipotéticos (What-If Analysis)
 * Calcula proyecciones matemáticas transparentes sin inventar datos
 */
export function simulateSubjectScenario(
  subject: Subject,
  currentGrades: GradeEntry[],
  hypotheticalGrades: { title: string; score: number; weightPercent?: number }[],
  config: GradingSystemConfig
): {
  projectedAverage: number;
  deltaFromCurrent: number | null;
  targetAchieved?: boolean;
  explanation: string;
} {
  const currentCalc = calculateSubjectAverage(subject, currentGrades, config);

  // Unimos las notas reales y las simuladas
  const simulatedEntries: GradeEntry[] = [
    ...currentGrades,
    ...hypotheticalGrades.map((h, i) => ({
      id: `sim-${i}`,
      subjectId: subject.id,
      periodId: 'sim-period',
      title: h.title || `Simulación ${i + 1}`,
      score: h.score,
      weightPercent: h.weightPercent,
      type: 'evaluacion' as const,
      date: new Date().toISOString().split('T')[0],
      origin: 'system_projection' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })),
  ];

  const simulatedCalc = calculateSubjectAverage(subject, simulatedEntries, config);
  const projectedAverage = simulatedCalc.average || 0;
  const delta = currentCalc.average !== null ? roundScore(projectedAverage - currentCalc.average, 1) : null;

  return {
    projectedAverage,
    deltaFromCurrent: delta,
    explanation: `Proyección matemática basada en ${currentGrades.length} nota(s) registradas y ${hypotheticalGrades.length} nota(s) simuladas (${simulatedCalc.formulaDetails}).`,
  };
}

/**
 * Calcula la calificación requerida en la(s) siguiente(s) evaluación(es) para alcanzar una meta
 */
export function calculateRequiredScoreForTarget(
  subject: Subject,
  currentGrades: GradeEntry[],
  targetGrade: number,
  remainingWeightPercent: number = 20, // default if weighted
  config: GradingSystemConfig
): { requiredScore: number | null; isFeasible: boolean; message: string } {
  if (targetGrade > config.maxGrade) {
    return {
      requiredScore: null,
      isFeasible: false,
      message: `La meta de ${formatScoreSpanish(targetGrade)} supera la escala máxima institucional (${formatScoreSpanish(config.maxGrade)}).`,
    };
  }

  if (subject.calculationMethod === 'weighted') {
    let currentSumProduct = 0;
    let currentWeights = 0;
    currentGrades.forEach((g) => {
      const w = g.weightPercent || 0;
      currentSumProduct += g.score * w;
      currentWeights += w;
    });

    const targetSumProduct = targetGrade * (currentWeights + remainingWeightPercent);
    const neededSumProduct = targetSumProduct - currentSumProduct;
    const neededScore = neededSumProduct / remainingWeightPercent;
    const rounded = roundScore(neededScore, 1);

    if (rounded > config.maxGrade) {
      return {
        requiredScore: rounded,
        isFeasible: false,
        message: `Para llegar a ${formatScoreSpanish(targetGrade)}, necesitarías un puntaje proyectado de ${formatScoreSpanish(
          rounded
        )} en el ${remainingWeightPercent}% restante (supera el 5,0 máximo).`,
      };
    }

    if (rounded < config.minGrade) {
      return {
        requiredScore: config.minGrade,
        isFeasible: true,
        message: `Ya tienes el rendimiento acumulado suficiente para asegurar tu meta con cualquier calificación válida.`,
      };
    }

    return {
      requiredScore: rounded,
      isFeasible: true,
      message: `Necesitas obtener aproximadamente ${formatScoreSpanish(
        rounded
      )} en la próxima evaluación (estimada en ${remainingWeightPercent}%) para alcanzar tu meta de ${formatScoreSpanish(targetGrade)}.`,
    };
  }

  // Modo Simple
  const currentSum = currentGrades.reduce((acc, g) => acc + g.score, 0);
  const totalItems = currentGrades.length + 1;
  const neededScore = targetGrade * totalItems - currentSum;
  const rounded = roundScore(neededScore, 1);

  if (rounded > config.maxGrade) {
    return {
      requiredScore: rounded,
      isFeasible: false,
      message: `Necesitarías un ${formatScoreSpanish(rounded)} en tu siguiente calificación para alcanzar ${formatScoreSpanish(
        targetGrade
      )} (superior a la nota máxima).`,
    };
  }

  if (rounded < config.minGrade) {
    return {
      requiredScore: config.minGrade,
      isFeasible: true,
      message: `Tu meta está prácticamente asegurada si mantienes calificaciones aprobatorias.`,
    };
  }

  return {
    requiredScore: rounded,
    isFeasible: true,
    message: `Necesitas aproximadamente un ${formatScoreSpanish(
      rounded
    )} en la siguiente evaluación para situar tu promedio en ${formatScoreSpanish(targetGrade)}.`,
  };
}
