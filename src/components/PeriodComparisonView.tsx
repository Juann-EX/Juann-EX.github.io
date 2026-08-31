import React, { useState } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  BarChart2,
  ArrowUpRight,
  Info,
  Award
} from 'lucide-react';
import {
  Subject,
  AcademicPeriod,
  GradeEntry,
  GradingSystemConfig,
  SubjectStats,
  PeriodStats,
} from '../types';
import {
  computePeriodStats,
  computeSubjectStats,
  formatScoreSpanish,
} from '../lib/academicEngine';

interface PeriodComparisonViewProps {
  periods: AcademicPeriod[];
  subjects: Subject[];
  grades: GradeEntry[];
  config: GradingSystemConfig;
  selectedPeriodId: string;
}

export const PeriodComparisonView: React.FC<PeriodComparisonViewProps> = ({
  periods,
  subjects,
  grades,
  config,
  selectedPeriodId,
}) => {
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

  // Calcular estadísticas para cada período
  const periodStatsList = periods.map((p) =>
    computePeriodStats(p.id, subjects, grades, periods, config)
  );

  // Datos para la gráfica de evolución del promedio general
  const generalTrendData = periodStatsList.map((p) => ({
    periodName: p.periodName,
    promedio: p.generalAverage !== null ? p.generalAverage : null,
  }));

  // Datos para la gráfica comparativa por materias
  const subjectsComparisonData = subjects.map((subj) => {
    const row: Record<string, any> = { name: subj.name };
    periods.forEach((p) => {
      const stats = computeSubjectStats(subj, p.id, grades, periods, config);
      row[p.name] = stats.average;
    });
    return row;
  });

  // Comparación de aumento global (primer período vs actual o último con datos)
  const firstPeriodStats = periodStatsList[0];
  const currentPeriodStats =
    periodStatsList.find((p) => p.periodId === selectedPeriodId) || periodStatsList[0];

  const totalDelta =
    currentPeriodStats.generalAverage !== null && firstPeriodStats.generalAverage !== null
      ? (currentPeriodStats.generalAverage - firstPeriodStats.generalAverage).toFixed(1).replace('.', ',')
      : null;

  const isPositiveOverall =
    currentPeriodStats.generalAverage !== null &&
    firstPeriodStats.generalAverage !== null &&
    currentPeriodStats.generalAverage >= firstPeriodStats.generalAverage;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 font-display">
            Comparación y Evolución entre Períodos
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Analiza tus tendencias históricas, progreso acumulado y variaciones entre períodos académicos.
          </p>
        </div>

        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80">
          <button
            onClick={() => setChartType('line')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              chartType === 'line'
                ? 'bg-white text-indigo-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Evolución General
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              chartType === 'bar'
                ? 'bg-white text-indigo-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Comparar por Materias
          </button>
        </div>
      </div>

      {/* Global Progression Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {periodStatsList.map((pStat) => (
          <div
            key={pStat.periodId}
            className={`p-5 rounded-2xl border transition-all ${
              pStat.periodId === selectedPeriodId
                ? 'bg-indigo-50/50 border-indigo-300 ring-2 ring-indigo-500/10'
                : 'bg-white border-slate-200/80 shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {pStat.periodName}
              </span>
              {pStat.periodId === selectedPeriodId && (
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-md bg-indigo-600 text-white">
                  Seleccionado
                </span>
              )}
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 font-display">
                {formatScoreSpanish(pStat.generalAverage)}
              </span>
              <span className="text-xs text-slate-400">/ 5,0</span>
            </div>

            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                {pStat.evaluatedSubjectsCount} materias evaluadas
              </span>
              {pStat.deltaVsPrevious !== null && (
                <span
                  className={`font-semibold flex items-center gap-0.5 ${
                    pStat.deltaVsPrevious >= 0 ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {pStat.deltaVsPrevious >= 0 ? (
                    <TrendingUp className="w-3.5 h-3.5" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5" />
                  )}
                  {pStat.deltaVsPrevious >= 0 ? '+' : ''}
                  {formatScoreSpanish(pStat.deltaVsPrevious)} pts
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Delta Banner if overall improvement */}
      {totalDelta && currentPeriodStats.periodId !== firstPeriodStats.periodId && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500 text-white shadow-xs">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-emerald-950">
                {isPositiveOverall
                  ? `📈 Has aumentado +${totalDelta} puntos respecto al primer período`
                  : `Variación de ${totalDelta} puntos respecto al inicio`}
              </h4>
              <p className="text-xs text-emerald-800/80">
                Cálculo comparativo acumulado entre {firstPeriodStats.periodName} (
                {formatScoreSpanish(firstPeriodStats.generalAverage)}) y {currentPeriodStats.periodName} (
                {formatScoreSpanish(currentPeriodStats.generalAverage)}).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Visual Chart Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900 font-display">
              {chartType === 'line'
                ? 'Evolución del Promedio General'
                : 'Comparativa de Calificaciones por Materia'}
            </h3>
            <p className="text-xs text-slate-500">
              {chartType === 'line'
                ? 'Trayectoria de tus promedios a lo largo del año lectivo'
                : 'Desempeño relativo en cada asignatura por período'}
            </p>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' ? (
              <LineChart data={generalTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="periodName" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis
                  domain={[1.0, 5.0]}
                  ticks={[1.0, 2.0, 3.0, 4.0, 5.0]}
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(val: any) => [`${formatScoreSpanish(val)} / 5,0`, 'Promedio']}
                  labelFormatter={(lbl) => `Período: ${lbl}`}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    borderColor: '#e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="promedio"
                  stroke="#4f46e5"
                  strokeWidth={3}
                  dot={{ r: 6, fill: '#4f46e5', strokeWidth: 2, stroke: '#ffffff' }}
                  activeDot={{ r: 8 }}
                  connectNulls
                />
              </LineChart>
            ) : (
              <BarChart data={subjectsComparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis domain={[1.0, 5.0]} stroke="#64748b" fontSize={12} tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [val !== null ? `${formatScoreSpanish(val)}` : 'Sin datos']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    borderColor: '#e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="1° Período" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="2° Período" fill="#818cf8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="3° Período" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Comparative Multi-Period Matrix Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="font-bold text-base text-slate-900 font-display">
            Matriz Comparativa de Materias por Período
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Compara el promedio alcanzado en cada materia a través de todos los períodos lectivos.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Materia</th>
                {periods.map((p) => (
                  <th key={p.id} className="py-3 px-4 text-center">
                    {p.name}
                  </th>
                ))}
                <th className="py-3 px-4 text-center">Tendencia Global</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {subjects.map((subject) => {
                // Calcular para cada período
                const periodScores = periods.map((p) => {
                  const stat = computeSubjectStats(subject, p.id, grades, periods, config);
                  return { periodId: p.id, average: stat.average, sufficiency: stat.sufficiency };
                });

                const p1 = periodScores[0]?.average;
                const pLatest =
                  periodScores.find((ps) => ps.average !== null && ps.periodId === selectedPeriodId)
                    ?.average || periodScores[periodScores.length - 1]?.average;

                let overallTrendBadge = <span className="text-slate-400">—</span>;
                if (p1 !== null && p1 !== undefined && pLatest !== null && pLatest !== undefined) {
                  const delta = pLatest - p1;
                  if (delta >= 0.2) {
                    overallTrendBadge = (
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md flex items-center justify-center gap-1">
                        <TrendingUp className="w-3 h-3" /> +{formatScoreSpanish(delta)}
                      </span>
                    );
                  } else if (delta <= -0.2) {
                    overallTrendBadge = (
                      <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-md flex items-center justify-center gap-1">
                        <TrendingDown className="w-3 h-3" /> {formatScoreSpanish(delta)}
                      </span>
                    );
                  } else {
                    overallTrendBadge = (
                      <span className="text-slate-600 font-medium bg-slate-100 px-2 py-0.5 rounded-md flex items-center justify-center gap-1">
                        <Minus className="w-3 h-3" /> Estable
                      </span>
                    );
                  }
                }

                return (
                  <tr key={subject.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{subject.name}</td>
                    {periodScores.map((ps) => (
                      <td key={ps.periodId} className="py-3 px-4 text-center">
                        {ps.average !== null ? (
                          <span className="font-extrabold text-slate-900 font-display">
                            {formatScoreSpanish(ps.average)}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">Sin datos</span>
                        )}
                      </td>
                    ))}
                    <td className="py-3 px-4 text-center">{overallTrendBadge}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
