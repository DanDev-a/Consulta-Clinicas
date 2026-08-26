import { useState } from 'react';
import { supabase } from '../../../config/supabaseClient';
import { groq, GROQ_MODEL } from '../config/groqClient';
import type { DiagnosticoResultado, DiagnosticoIA } from '../types/ai';
import { validateDiagnosticoResultado } from '../types/ai';

const SYSTEM_PROMPT = `Sos un asistente médico de la Clinica Proyecto. Analizá los síntomas del paciente y devolvé un JSON con:
{
  "diagnosticos": [
    {
      "nombre": "Nombre del diagnóstico",
      "cie10": "X00.0",
      "probabilidad": 85.5,
      "descripcion": "Breve descripción"
    }
  ],
  "estudios_sugeridos": ["Estudio 1", "Estudio 2"],
  "tratamiento_sugerido": {
    "medicamentos": [{"nombre": "Medicamento", "dosis": "500mg", "frecuencia": "cada 8 horas", "duracion": "7 días"}],
    "indicaciones": "Indicaciones generales"
  },
  "urgencia": "baja|media|alta|critica"
}
Respondé SIEMPRE en JSON válido. No incluyas texto fuera del JSON.`;

export function useDiagnosticoIA(userId: string | undefined) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<DiagnosticoResultado | null>(null);
  const [historial, setHistorial] = useState<DiagnosticoIA[]>([]);

  const analizarSintomas = async (
    sintomas: string,
    expedienteId: number,
    pacienteId: string
  ): Promise<DiagnosticoResultado | null> => {
    setLoading(true);
    setError(null);
    setResultado(null);

    try {
      let sessionId: number | undefined;
      const sessionResult = await supabase
        .from('ai_session')
        .insert({
          id_doctor: userId,
          id_paciente: pacienteId,
          modelo: GROQ_MODEL,
        })
        .select('id')
        .single();

      if (sessionResult.error) {
        console.warn('Failed to create AI session:', sessionResult.error.message);
      } else {
        sessionId = sessionResult.data?.id;
      }

      const completion = await groq.chat.completions.create({
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `Síntomas del paciente:\n${sintomas}` },
        ],
        model: GROQ_MODEL,
        temperature: 0.3,
        max_completion_tokens: 2048,
        response_format: { type: 'json_object' },
      });

      const content = completion.choices[0]?.message?.content ?? '{}';
      let parsed: DiagnosticoResultado;
      try {
        parsed = validateDiagnosticoResultado(JSON.parse(content));
      } catch {
        throw new Error('La respuesta de IA no tiene el formato esperado. Intentá de nuevo.');
      }

      const tokensInput = completion.usage?.prompt_tokens ?? 0;
      const tokensOutput = completion.usage?.completion_tokens ?? 0;

      if (sessionId) {
        await supabase
          .from('ai_session')
          .update({
            tokens_input: tokensInput,
            tokens_output: tokensOutput,
            ended_at: new Date().toISOString(),
          })
          .eq('id', sessionId);
      }

      const probabilidadPromedio = parsed.diagnosticos.length > 0
        ? parsed.diagnosticos.reduce((sum, d) => sum + d.probabilidad, 0) / parsed.diagnosticos.length
        : 0;

      const cie10Code = parsed.diagnosticos[0]?.cie10;
      let cie10Id: number | null = null;
      if (cie10Code && cie10Code !== 'S/D') {
        const { data: cie10Data } = await supabase
          .from('diagnosticos_cie10')
          .select('id')
          .eq('clave', cie10Code)
          .maybeSingle();
        cie10Id = cie10Data?.id ?? null;
      }

      const { data: diagIA, error: insertError } = await supabase
        .from('diagnostico_ia')
        .insert({
          id_expediente: expedienteId,
          id_cie10_sugerido: cie10Id,
          analisis_ia: JSON.stringify(parsed),
          probabilidad: probabilidadPromedio,
          receta_sugerida: parsed.tratamiento_sugerido ?? null,
          estado_validacion: 'PENDIENTE',
        })
        .select('id_diagnostico_ia')
        .single();

      if (insertError) {
        console.error('Failed to save diagnostico_ia:', insertError.message);
      }

      if (diagIA && sessionId) {
        await supabase.from('ai_memory').insert({
          id_doctor: userId,
          id_paciente: pacienteId,
          session_id: String(sessionId),
          content: `Análisis IA: ${parsed.diagnosticos.map(d => d.nombre).join(', ')}. Urgencia: ${parsed.urgencia}`,
          metadata: { diagnostico_ia_id: diagIA.id_diagnostico_ia, sintomas },
        });
      }

      const result: DiagnosticoResultado = {
        ...parsed,
        id_diagnostico_ia: diagIA?.id_diagnostico_ia,
      };
      setResultado(result);
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al analizar síntomas';
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const aceptarDiagnostico = async (idDiagnosticoIA: number, expedienteId: number, doctorId: string): Promise<boolean> => {
    try {
      const { data: diagIA, error: fetchErr } = await supabase
        .from('diagnostico_ia')
        .select('analisis_ia, receta_sugerida, id_cie10_sugerido')
        .eq('id_diagnostico_ia', idDiagnosticoIA)
        .single();

      if (fetchErr || !diagIA) throw new Error('Diagnóstico IA no encontrado');

      const { data: diag, error: diagErr } = await supabase
        .from('diagnostico')
        .insert({
          id_expediente: expedienteId,
          id_doctor: doctorId,
          id_cie10: diagIA.id_cie10_sugerido,
          descripcion: diagIA.analisis_ia,
        })
        .select('id_diagnostico')
        .single();

      if (diagErr) throw diagErr;

      if (diag && diagIA.receta_sugerida) {
        const receta = diagIA.receta_sugerida as {
          medicamentos?: Array<{ nombre: string; dosis: string; frecuencia: string; duracion: string }>;
          indicaciones?: string;
          duracion_dias?: number;
        };

        const { data: recetaCreada } = await supabase
          .from('receta')
          .insert({
            id_diagnostico: diag.id_diagnostico,
            id_doctor: doctorId,
            descripcion: receta.indicaciones ?? 'Tratamiento sugerido por IA',
            fecha_vencimiento: new Date(Date.now() + (receta.duracion_dias ?? 30) * 86400000).toISOString().split('T')[0],
          })
          .select('id_receta')
          .single();

        if (recetaCreada && receta.medicamentos && receta.medicamentos.length > 0) {
          const detalles = receta.medicamentos.map(med => ({
            id_receta: recetaCreada.id_receta,
            medicamento_texto: med.nombre,
            dosis: med.dosis,
            frecuencia: med.frecuencia,
            duracion: med.duracion,
          }));
          await supabase.from('receta_detalle').insert(detalles);
        }
      }

      const { error: updateErr } = await supabase
        .from('diagnostico_ia')
        .update({
          estado_validacion: 'ACEPTADO',
          id_doctor_validador: doctorId,
          id_diagnostico: diag?.id_diagnostico ?? null,
          fecha_validacion: new Date().toISOString(),
        })
        .eq('id_diagnostico_ia', idDiagnosticoIA);

      if (updateErr) throw updateErr;
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al aceptar diagnóstico');
      return false;
    }
  };

  const rechazarDiagnostico = async (idDiagnosticoIA: number, doctorId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('diagnostico_ia')
        .update({
          estado_validacion: 'RECHAZADO',
          id_doctor_validador: doctorId,
          fecha_validacion: new Date().toISOString(),
        })
        .eq('id_diagnostico_ia', idDiagnosticoIA);
      if (error) throw error;
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al rechazar diagnóstico');
      return false;
    }
  };

  const fetchHistorial = async (pacienteId?: string) => {
    try {
      if (!pacienteId) { setHistorial([]); return; }

      const { data: expedientes } = await supabase
        .from('expediente')
        .select('id_expediente')
        .eq('id_paciente', pacienteId);

      const expIds = (expedientes ?? []).map((e: any) => e.id_expediente);
      if (expIds.length === 0) { setHistorial([]); return; }

      const { data } = await supabase
        .from('diagnostico_ia')
        .select('id_diagnostico_ia, id_expediente, id_diagnostico, id_cie10_sugerido, analisis_ia, probabilidad, receta_sugerida, fecha_generacion, estado_validacion, id_doctor_validador, fecha_validacion')
        .in('id_expediente', expIds)
        .order('fecha_generacion', { ascending: false });

      setHistorial((data ?? []) as DiagnosticoIA[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar historial');
    }
  };

  return {
    loading, error, resultado, historial,
    analizarSintomas, aceptarDiagnostico, rechazarDiagnostico, fetchHistorial,
  };
}
