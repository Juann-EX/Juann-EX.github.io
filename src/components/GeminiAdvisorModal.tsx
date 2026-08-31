import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Copy,
  Check,
  MessageSquare
} from 'lucide-react';
import {
  AcademicPeriod,
  Subject,
  GradeEntry,
  GradingSystemConfig,
  SubjectStats,
  PeriodStats,
  AcademicAlert,
  AcademicGoal,
} from '../types';
import { formatScoreSpanish } from '../lib/academicEngine';

interface GeminiAdvisorModalProps {
  currentPeriod: AcademicPeriod;
  periodStats: PeriodStats;
  subjectStats: SubjectStats[];
  alerts: AcademicAlert[];
  goals: AcademicGoal[];
}

interface Message {
  role: 'assistant' | 'user';
  text: string;
  timestamp: string;
}

export const GeminiAdvisorModal: React.FC<GeminiAdvisorModalProps> = ({
  currentPeriod,
  periodStats,
  subjectStats,
  alerts,
  goals,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Generate initial diagnostic analysis on load
  const fetchAdvice = async (customQuestion?: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/gemini/academic-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          periodName: currentPeriod.name,
          generalAverage: periodStats.generalAverage,
          subjects: subjectStats.map((s) => ({
            name: s.subjectName,
            average: s.average,
            sufficiency: s.sufficiency,
            sufficiencyMessage: s.sufficiencyMessage,
            trend: s.trend,
            gradesCount: s.totalGrades,
          })),
          alerts: alerts.map((a) => ({ title: a.title, message: a.message })),
          goals: goals.map((g) => ({ label: g.label, target: g.targetGrade })),
          userQuestion: customQuestion,
        }),
      });

      const data = await response.json();
      if (data.success && data.advice) {
        if (customQuestion) {
          setMessages((prev) => [
            ...prev,
            { role: 'user', text: customQuestion, timestamp: new Date().toLocaleTimeString('es-CO') },
            { role: 'assistant', text: data.advice, timestamp: new Date().toLocaleTimeString('es-CO') },
          ]);
        } else {
          setMessages([
            {
              role: 'assistant',
              text: data.advice,
              timestamp: new Date().toLocaleTimeString('es-CO'),
            },
          ]);
        }
      }
    } catch (err) {
      console.error('Error contacting advisor:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text:
            'Te sugerimos continuar registrando tus evaluaciones para tener un panorama más completo. Si tienes dudas en materias como ' +
            (subjectStats[0]?.subjectName || 'alguna asignatura') +
            ', una consulta con tu docente te brindará gran claridad.',
          timestamp: new Date().toLocaleTimeString('es-CO'),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdvice();
  }, [currentPeriod.id]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuestion.trim() || isLoading) return;
    const q = inputQuestion.trim();
    setInputQuestion('');
    fetchAdvice(q);
  };

  const handleCopyText = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 font-display">
              Asesor Académico Orientador (IA Ética)
            </h2>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 border border-indigo-200">
              Gemini 3.7 Flash
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Interpretación respetuosa y constructiva de tus datos académicos actuales, sin juicios ni calificaciones inventadas.
          </p>
        </div>

        <button
          onClick={() => fetchAdvice()}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-all shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Actualizar Diagnóstico</span>
        </button>
      </div>

      {/* Ethical Guarantee Ribbon */}
      <div className="p-4 rounded-2xl bg-indigo-900 text-white flex items-start gap-3 shadow-xs">
        <div className="p-2 rounded-xl bg-indigo-800 text-indigo-300 shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="text-xs space-y-0.5">
          <span className="font-bold text-white block">Garantía de Asesoría Responsable</span>
          <p className="text-indigo-200 leading-relaxed">
            Este orientador no juzga, no etiqueta ni inventa resultados. Reconoce cuándo los datos son insuficientes y formula recomendaciones prácticas para acompañar tu proceso de aprendizaje.
          </p>
        </div>
      </div>

      {/* Chat / Message Stream */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs flex flex-col h-[520px]">
        {/* Messages Container */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none'
                    : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-bl-none'
                }`}
              >
                <div className="flex items-center justify-between gap-4 mb-2 pb-1 border-b border-black/5 text-[10px] opacity-75">
                  <span className="font-bold">
                    {msg.role === 'user' ? 'Tú (Estudiante)' : 'Asesor MiRendimiento'}
                  </span>
                  <span>{msg.timestamp}</span>
                </div>

                <div className="whitespace-pre-line text-xs">{msg.text}</div>

                {msg.role === 'assistant' && (
                  <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Basado en tus registros de {currentPeriod.name}</span>
                    <button
                      onClick={() => handleCopyText(msg.text, idx)}
                      className="inline-flex items-center gap-1 hover:text-indigo-600 transition-colors"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600">Copiado</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 animate-pulse">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
                <span className="inline-block w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
                <span className="inline-block w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]" />
                <span className="ml-2 font-medium">Analizando tus estadísticas éticamente...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Question Prompts */}
        <div className="px-6 py-2 border-t border-slate-100 bg-slate-50/50 flex flex-wrap gap-1.5 text-[11px]">
          <span className="text-slate-400 font-semibold py-1">Preguntas sugeridas:</span>
          <button
            onClick={() => {
              setInputQuestion('¿Qué materia debería priorizar esta semana y por qué?');
            }}
            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-indigo-400 hover:text-indigo-600 transition-all"
          >
            🎯 ¿Qué materia priorizar?
          </button>
          <button
            onClick={() => {
              setInputQuestion('¿Cómo puedo interpretar mis materias que están sin calificaciones?');
            }}
            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-indigo-400 hover:text-indigo-600 transition-all"
          >
            🔍 Materias sin calificaciones
          </button>
          <button
            onClick={() => {
              setInputQuestion('Dame 3 consejos de estudio específicos para elevar mi promedio general.');
            }}
            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-indigo-400 hover:text-indigo-600 transition-all"
          >
            💡 3 consejos de estudio
          </button>
        </div>

        {/* Question Input Bar */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            placeholder="Haz una pregunta a tu Asesor Orientador sobre tus estadísticas..."
            value={inputQuestion}
            onChange={(e) => setInputQuestion(e.target.value)}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
          <button
            type="submit"
            disabled={!inputQuestion.trim() || isLoading}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Enviar</span>
          </button>
        </form>
      </div>
    </div>
  );
};
