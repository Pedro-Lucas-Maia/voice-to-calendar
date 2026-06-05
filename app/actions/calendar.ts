'use server';

import { google, calendar_v3, tasks_v1 } from 'googleapis';

type CalendarData = {
  tipo: 'evento' | 'tarefa';
  titulo: string;
  descricao?: string | null;
  data?: string | null;
  hora?: string | null;
  diaInteiro?: boolean | null;
};

const oauth2client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET, // corrigido de CLIENTE_SECRET para CLIENT_SECRET
);

oauth2client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const calendarClient = google.calendar({ version: 'v3', auth: oauth2client });
const tasksClient = google.tasks({ version: 'v1', auth: oauth2client });

export async function saveToGoogle(data: CalendarData) {
  try {
    if (data.tipo === 'evento') {
      const eventData: calendar_v3.Schema$Event = {
        summary: data.titulo,
        description: data.descricao || undefined,
      };

      if (data.diaInteiro) {
        // Evento de dia inteiro precisa apenas do "date"
        const dateStr = data.data || new Date().toISOString().split('T')[0];
        eventData.start = { date: dateStr };
        eventData.end = { date: dateStr };
      } else {
        // Evento com horário específico
        const dateStr = data.data || new Date().toISOString().split('T')[0];
        const timeStr = data.hora || '12:00';
        
        // Define o datetime considerando o fuso de Brasília (-03:00)
        const startDateTime = new Date(`${dateStr}T${timeStr}:00-03:00`);
        
        // Define o término para 1 hora depois por padrão
        const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000);

        eventData.start = { 
          dateTime: startDateTime.toISOString(), 
          timeZone: 'America/Sao_Paulo' 
        };
        eventData.end = { 
          dateTime: endDateTime.toISOString(), 
          timeZone: 'America/Sao_Paulo' 
        };
      }

      await calendarClient.events.insert({
        calendarId: 'primary',
        requestBody: eventData,
      });

      return { success: true, message: 'Evento salvo com sucesso na Agenda!' };

    } else {
      // É uma Tarefa
      const taskData: tasks_v1.Schema$Task = {
        title: data.titulo,
        notes: data.descricao || undefined,
      };

      if (data.data) {
        // Google Tasks espera o RFC3339 no formato de data zerada (ex: 2026-06-05T00:00:00.000Z)
        taskData.due = new Date(`${data.data}T00:00:00.000Z`).toISOString();
      }

      await tasksClient.tasks.insert({
        tasklist: '@default',
        requestBody: taskData,
      });

      return { success: true, message: 'Tarefa salva com sucesso no Google Tasks!' };
    }
  } catch (error: any) {
    console.error('Erro na API do Google:', error);
    return { 
      success: false, 
      message: error.message || 'Erro de comunicação com o Google. Verifique seus tokens.' 
    };
  }
}
