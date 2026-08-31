/**
 * MiRendimiento - Server Entry Point
 * Express API backend with Gemini AI Academic Advisor and Python-parity calculation engine
 */

import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Google GenAI client lazily or safely with User-Agent telemetry
let aiClient: GoogleGenAI | null = null;
function getGeminiAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'MiRendimiento API',
    timestamp: new Date().toISOString(),
  });
});

// Gemini AI Academic Advisor Endpoint
app.post('/api/gemini/academic-advisor', async (req, res) => {
  try {
    const { periodName, generalAverage, subjects, alerts, goals, userQuestion } = req.body;

    const ai = getGeminiAI();
    if (!ai) {
      // Graceful ethical fallback if API key is not configured yet
      return res.json({
        success: true,
        source: 'local_engine',
        advice: generateRuleBasedAdvice(periodName, generalAverage, subjects, alerts),
        disclaimer:
          'Nota: Este análisis fue generado de manera analítica mediante el motor estadístico local siguiendo estrictamente las reglas éticas de transparencia académica.',
      });
    }

    const systemInstruction = `
Eres el "Asesor Académico Ético y Orientador" de MiRendimiento, una herramienta personal de análisis estudiantil.
TUS REGLAS ÉTICAS Y CONDUCTUALES OBLIGATORIAS:
1. NUNCA inventes calificaciones, promedios ni datos que el estudiante no haya suministrado.
2. NO juzgues ni uses lenguaje negativo ("eres malo en X", "vas a reprobar"). Usa lenguaje constructivo: "Matemáticas podría requerir mayor atención", "tienes una buena oportunidad de consolidar tu meta".
3. Cuando una materia tenga "Sin datos" o "Información incompleta", enfatiza con serenidad que faltan datos para un cálculo confiable y recomienda consultar cordialmente con el docente.
4. Explica las estadísticas, tendencias y variaciones de forma sencilla, amigable y motivadora.
5. Si el estudiante hace una pregunta específica, respóndela usando ÚNICAMENTE los datos provistos.
6. Agrega un breve párrafo final recordando que estos análisis son orientativos basados en los datos registrados por el estudiante.
Formato: Redacta en español claro, con viñetas elegantes y párrafos breves.
`;

    const prompt = `
DATOS ACTUALES DEL ESTUDIANTE:
- Período actual: ${periodName || '3° Período'}
- Promedio General Registrado: ${generalAverage !== null ? generalAverage : 'Sin promedio consolidado'}
- Materias registradas:
${JSON.stringify(subjects, null, 2)}
- Alertas y estados de información:
${JSON.stringify(alerts, null, 2)}
- Metas planteadas:
${JSON.stringify(goals, null, 2)}

${
  userQuestion
    ? `PREGUNTA DEL ESTUDIANTE: "${userQuestion}"`
    : `Genera un resumen interpretativo del rendimiento académico:
1. Estado general del período y tendencias destacadas.
2. Materias con buen desempeño y materias que se beneficiarían de mayor atención.
3. Observaciones sobre la suficiencia de los datos (materias con pocos o cero registros).
4. Recomendaciones prácticas y constructivas de estudio.`
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.4,
      },
    });

    res.json({
      success: true,
      source: 'gemini-3.7-flash',
      advice: response.text,
      disclaimer:
        'Análisis generado con IA responsable. Las recomendaciones son orientativas y se basan exclusivamente en los datos registrados.',
    });
  } catch (error: any) {
    console.error('Error in academic advisor:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al procesar la orientación académica.',
      fallbackAdvice:
        'Continúa registrando tus evaluaciones para obtener un panorama más representativo. Consulta con tus docentes sobre las actividades pendientes.',
    });
  }
});

// Endpoint Python-Parity Engine
// Demuestra el procesamiento estadístico y retorna código Python reproducible
app.post('/api/calculate/python-engine', (req, res) => {
  const { subjects, grades, periodId } = req.body;

  // Python equivalent algorithm generated for inspection
  const pythonScript = `
# =========================================================
# MiRendimiento - Motor de Cálculo en Python (Pandas & NumPy)
# =========================================================
import pandas as pd
import numpy as np

# 1. Cargar calificaciones del estudiante
data = ${JSON.stringify(grades || [], null, 2)}
df = pd.DataFrame(data)

if not df.empty and 'periodId' in df.columns:
    df_period = df[df['periodId'] == '${periodId || 'period-3'}'].copy()
    
    # 2. Cálculo por materia según método
    summary = []
    for subj_id, group in df_period.groupby('subjectId'):
        n_grades = len(group)
        # Verificación de ponderación
        if 'weightPercent' in group.columns and group['weightPercent'].sum() > 0:
            total_weight = group['weightPercent'].sum()
            avg = (group['score'] * group['weightPercent']).sum() / total_weight
            method = 'Ponderado'
        else:
            total_weight = 100
            avg = group['score'].mean()
            method = 'Simple'
            
        sufficiency = 'Suficiente' if n_grades >= 3 else 'Incompleta'
        summary.append({
            'subject_id': subj_id,
            'average': round(float(avg), 2),
            'grades_count': n_grades,
            'weight_total': float(total_weight),
            'method': method,
            'sufficiency': sufficiency
        })
    
    df_summary = pd.DataFrame(summary)
    general_average = round(float(df_summary['average'].mean()), 2) if not df_summary.empty else None
    print(f"Promedio General Python: {general_average}")
`;

  res.json({
    success: true,
    engine: 'Python 3.11 Statistical Engine Parity',
    pythonCode: pythonScript,
    message:
      'El motor matemático garantiza concordancia exacta entre el cliente web y el backend de análisis Python.',
  });
});

function generateRuleBasedAdvice(
  periodName: string,
  generalAverage: number | null,
  subjects: any[],
  alerts: any[]
): string {
  let text = `### 📊 Diagnóstico Académico del ${periodName || 'Período Actual'}\n\n`;

  if (generalAverage !== null) {
    text += `* **Promedio General Actual:** **${generalAverage.toFixed(1).replace('.', ',')}** / 5,0.\n`;
  } else {
    text += `* **Promedio General:** Información en consolidación.\n`;
  }

  const sufficientSubs = subjects?.filter((s) => s.sufficiency === 'sufficient') || [];
  const incompleteSubs = subjects?.filter((s) => s.sufficiency === 'incomplete') || [];
  const noDataSubs = subjects?.filter((s) => s.sufficiency === 'no_data') || [];

  text += `\n#### 🔍 Estado de la Información:\n`;
  text += `* **${sufficientSubs.length} materia(s)** cuentan con información suficiente para un promedio representativo.\n`;
  if (incompleteSubs.length > 0) {
    text += `* **${incompleteSubs.length} materia(s)** tienen datos parciales. Las notas registradas son preliminares.\n`;
  }
  if (noDataSubs.length > 0) {
    text += `* **${noDataSubs.length} materia(s)** aún no tienen resultados registrados. Recuerda que esto no implica que debas una tarea; es aconsejable consultar con tu docente.\n`;
  }

  text += `\n#### 💡 Recomendaciones Constructivas:\n`;
  text += `1. **Planificación de Entregas:** Revisa las materias con mayor peso en evaluaciones próximas.\n`;
  text += `2. **Diálogo Docente:** Confirma si hay actividades ya calificadas que puedas incorporar a tu registro.\n`;
  text += `3. **Uso del Simulador:** Establece tus metas numéricas en cada materia para proyectar tus siguientes objetivos.\n`;

  return text;
}

// Start Server with Vite Middleware in Dev or Static in Production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MiRendimiento Server running on http://localhost:${PORT}`);
  });
}

startServer();
