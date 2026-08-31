import React, { useState } from 'react';
import { History, ShieldCheck, Filter, User, Clock, CheckCircle2, Search, Calendar, BookOpen, Tag } from 'lucide-react';
import { ChangeLogEntry } from '../types';

interface ChangeHistoryModalProps {
  changeLog: ChangeLogEntry[];
}

export const ChangeHistoryModal: React.FC<ChangeHistoryModalProps> = ({ changeLog }) => {
  const [filterAction, setFilterAction] = useState<'all' | 'create' | 'update' | 'delete'>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredLogs = changeLog.filter((log) => {
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    const matchesSearch =
      searchTerm.trim() === '' ||
      log.entityTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.subjectName && log.subjectName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.periodName && log.periodName.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesAction && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 font-display">
              Historial y Trazabilidad de Calificaciones
            </h2>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              100% Transparente
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Registro detallado de cómo se obtuvo cada promedio: fechas, tipo de actividad, materia, calificación y usuario.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/80 text-xs">
          <button
            onClick={() => setFilterAction('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              filterAction === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Todos ({changeLog.length})
          </button>
          <button
            onClick={() => setFilterAction('create')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              filterAction === 'create' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
            }`}
          >
            Nuevos
          </button>
          <button
            onClick={() => setFilterAction('update')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              filterAction === 'update' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600'
            }`}
          >
            Modificados
          </button>
          <button
            onClick={() => setFilterAction('delete')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              filterAction === 'delete' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600'
            }`}
          >
            Eliminados
          </button>
        </div>
      </div>

      {/* Search and Transparency Info Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="md:col-span-2 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por materia, actividad o período..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl bg-white border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-xs"
          />
        </div>

        <div className="p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-center gap-2.5 text-xs text-indigo-900">
          <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
          <span className="text-[11px] leading-tight font-medium">
            Trazabilidad completa de calificaciones conocidas registradas voluntariamente.
          </span>
        </div>
      </div>

      {/* Log List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="divide-y divide-slate-100">
          {filteredLogs.map((log) => {
            const actionBadge = {
              create: 'bg-indigo-50 text-indigo-700 border-indigo-200',
              update: 'bg-amber-50 text-amber-800 border-amber-200',
              delete: 'bg-rose-50 text-rose-700 border-rose-200',
              restore: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            }[log.action] || 'bg-slate-100 text-slate-700 border-slate-200';

            const actionLabel = {
              create: '📝 Registro Creado',
              update: '✏️ Registro Modificado',
              delete: '🗑️ Registro Eliminado',
              restore: '🔄 Registro Restaurado',
            }[log.action] || 'Acción';

            return (
              <div key={log.id} className="p-4 sm:p-5 hover:bg-slate-50/60 transition-colors space-y-2">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${actionBadge}`}>
                      {actionLabel}
                    </span>
                    <span className="text-xs font-bold text-slate-900 font-display">
                      {log.entityTitle}
                    </span>
                    {log.periodName && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">
                        {log.periodName}
                      </span>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {new Date(log.timestamp).toLocaleString('es-CO')}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-snug">
                  {log.description}
                </p>

                {/* Audit Grid Metadata */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Materia</span>
                    <span className="font-semibold text-slate-800">{log.subjectName || 'General'}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Fecha Actividad</span>
                    <span className="font-semibold text-slate-800">{log.activityDate || '—'}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Tipo / Calificación</span>
                    <span className="font-bold text-indigo-700">
                      {log.gradeType ? `${log.gradeType.toUpperCase()} : ` : ''}
                      {log.score !== undefined ? `${log.score}` : (log.newValue || '—')}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Registrado por</span>
                    <span className="font-semibold text-slate-800 flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-400" />
                      {log.author} ({log.origin === 'official' ? 'Oficial' : log.origin === 'verified' ? 'Verificado' : 'Estudiante'})
                    </span>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredLogs.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-500">
              No hay registros que coincidan con la búsqueda o filtro.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
