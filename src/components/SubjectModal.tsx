import React, { useState, useEffect } from 'react';
import { Subject } from '../types';
import { BookOpen, Plus, Check } from 'lucide-react';

interface SubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (subject: Partial<Subject>) => void;
  initialSubject?: Subject | null;
}

export const SubjectModal: React.FC<SubjectModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialSubject,
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [professorName, setProfessorName] = useState('');
  const [calculationMethod, setCalculationMethod] = useState<'simple' | 'weighted'>('weighted');
  const [targetGradeStr, setTargetGradeStr] = useState('4.0');
  const [colorTag, setColorTag] = useState('indigo');
  const [observations, setObservations] = useState('');

  useEffect(() => {
    if (initialSubject) {
      setName(initialSubject.name);
      setCode(initialSubject.code || '');
      setProfessorName(initialSubject.professorName || '');
      setCalculationMethod(initialSubject.calculationMethod);
      setTargetGradeStr(initialSubject.targetGrade ? initialSubject.targetGrade.toString() : '4.0');
      setColorTag(initialSubject.colorTag || 'indigo');
      setObservations(initialSubject.observations || '');
    } else {
      setName('');
      setCode('');
      setProfessorName('');
      setCalculationMethod('weighted');
      setTargetGradeStr('4.0');
      setColorTag('indigo');
      setObservations('');
    }
  }, [initialSubject, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      id: initialSubject ? initialSubject.id : undefined,
      name: name.trim(),
      code: code.trim() || undefined,
      professorName: professorName.trim() || undefined,
      calculationMethod,
      targetGrade: parseFloat(targetGradeStr) || 4.0,
      colorTag,
      observations: observations.trim() || undefined,
      isCustom: true,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 my-8 space-y-5">
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-display">
              {initialSubject ? 'Editar Materia' : 'Crear Nueva Materia'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Personaliza el nombre, docente y método de cálculo de la asignatura.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Nombre de la Materia</label>
            <input
              type="text"
              placeholder="Ej. Filosofía, Robótica, Educación Artística..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Código Opcional</label>
              <input
                type="text"
                placeholder="Ej. FIL-101"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Meta Deseada (1,0 - 5,0)</label>
              <input
                type="number"
                step="0.1"
                min="1.0"
                max="5.0"
                value={targetGradeStr}
                onChange={(e) => setTargetGradeStr(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-bold focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Nombre del Docente</label>
            <input
              type="text"
              placeholder="Ej. Lic. Fernando Ramírez"
              value={professorName}
              onChange={(e) => setProfessorName(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Método de Cálculo</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCalculationMethod('weighted')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  calculationMethod === 'weighted'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold'
                    : 'border-slate-200 bg-slate-50 text-slate-600'
                }`}
              >
                <div className="font-semibold">Ponderado (%)</div>
                <div className="text-[10px] opacity-80 mt-0.5">Cada nota tiene un porcentaje de peso.</div>
              </button>

              <button
                type="button"
                onClick={() => setCalculationMethod('simple')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  calculationMethod === 'simple'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-bold'
                    : 'border-slate-200 bg-slate-50 text-slate-600'
                }`}
              >
                <div className="font-semibold">Simple (Aritmético)</div>
                <div className="text-[10px] opacity-80 mt-0.5">Todas las notas tienen el mismo peso.</div>
              </button>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Observaciones Iniciales</label>
            <textarea
              rows={2}
              placeholder="Notas generales sobre el temario o criterios..."
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:bg-white resize-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-all"
            >
              {initialSubject ? 'Actualizar' : 'Crear Materia'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
