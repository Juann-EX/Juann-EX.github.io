import React, { useState } from 'react';
import { ShieldCheck, Info, ChevronDown, ChevronUp, Lock, CheckCircle2, AlertCircle } from 'lucide-react';

export const EthicalNoticeBanner: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const ethicalPrinciples = [
    {
      num: 1,
      title: 'No reemplaza el portal oficial',
      desc: 'Herramienta complementaria de análisis personal, sin modificar las políticas institucionales.',
    },
    {
      num: 2,
      title: 'Sin accesos no autorizados',
      desc: 'No intenta acceder, extraer ni desbloquear calificaciones restringidas del colegio.',
    },
    {
      num: 3,
      title: 'Cero invención de notas',
      desc: 'Los cálculos se basan exclusivamente en los resultados que tú ingresas legítimamente.',
    },
    {
      num: 4,
      title: 'Origen transparente del dato',
      desc: 'Diferenciación explícita entre datos del estudiante, datos verificados y cálculos automáticos.',
    },
    {
      num: 5,
      title: 'Sin suposiciones sobre notas faltantes',
      desc: 'Una nota no registrada nunca se asume como tarea reprobada o pendiente.',
    },
    {
      num: 6,
      title: 'Avisos de datos insuficientes',
      desc: 'El sistema advierte cuando un promedio se basa en pocos datos antes de sacar conclusiones.',
    },
    {
      num: 7,
      title: 'Privacidad y control local',
      desc: 'Tus datos son personales, no se venden ni se emplean para fines publicitarios.',
    },
    {
      num: 8,
      title: 'Comprensión sin etiquetas negativas',
      desc: 'Lenguaje respetuoso y orientativo enfocado en oportunidades de mejora.',
    },
    {
      num: 9,
      title: 'Estadísticas claras y humanas',
      desc: 'Métricas sencillas, tendencias visuales y comparaciones entre períodos.',
    },
    {
      num: 10,
      title: 'Escala decimal exacta (1,0 a 5,0)',
      desc: 'Cálculos matemáticos rigurosos con soporte para ponderaciones y promedios simples.',
    },
  ];

  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-indigo-900/50 mb-6 no-print">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Compromiso Ético y Principio de Transparencia
              </h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                100% Legítimo
              </span>
            </div>
            <p className="text-xs text-indigo-200/90 mt-0.5 leading-relaxed max-w-3xl">
              “No podemos mostrarte información que no tienes permitido ver, pero sí podemos ayudarte a comprender mejor la información que tienes.”
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition-all self-start sm:self-center shrink-0 border border-white/10"
        >
          <Info className="w-3.5 h-3.5 text-indigo-300" />
          <span>{isExpanded ? 'Ocultar Principios' : 'Ver 10 Principios Éticos'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-indigo-800/60 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {ethicalPrinciples.map((item) => (
            <div
              key={item.num}
              className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white/5 border border-white/5"
            >
              <div className="w-5 h-5 rounded-full bg-indigo-500/30 text-indigo-300 flex items-center justify-center text-[10px] font-bold shrink-0">
                {item.num}
              </div>
              <div>
                <span className="font-semibold text-indigo-100 block">{item.title}</span>
                <span className="text-indigo-200/80 text-[11px] leading-snug">{item.desc}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
