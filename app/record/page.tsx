'use client';

import { useState, useRef } from 'react';
import { Form, FormGroup, FormLabel, FormInput, FormError } from '@/components/ui/Form';
import { saveToGoogle } from '@/actions/calendar';

export type CalendarData = {
  tipo: 'evento' | 'tarefa';
  titulo: string;
  descricao?: string | null;
  data?: string | null;
  hora?: string | null;
  diaInteiro?: boolean | null;
};

export default function Record() {
  const [isRecording, setIsRecording] = useState(false);
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (evento) => {
      if (evento.data.size > 0) {
        audioChunksRef.current.push(evento.data);
      }
    };

    recorder.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, {
        type: 'audio/webm',
      });
      audioChunksRef.current = [];

      const formData = new FormData();

      formData.append('audio', audioBlob, 'gravacao.webm');
      try {
        const resposta = await fetch('/api/transcribe', {
          method: 'POST',
          body: formData,
        });
        if (resposta.ok) {
          const dadosDaApi = await resposta.json();
          
          let jsonString = dadosDaApi.resultado;
          // Clean up markdown block if the AI returns it
          if (jsonString.startsWith('```json')) {
            jsonString = jsonString.replace(/```json\n?/, '').replace(/\n?```/, '');
          }
          const objetoDoEvento = JSON.parse(jsonString);

          setCalendarData(objetoDoEvento);

          console.log('A IA montou isso aqui:', objetoDoEvento);
        } else {
          console.error('Algo deu errado com a transcrição do audio');
        }
      } catch (e) {
        console.error('Erro na hora de enviar:', e);
      }
    };

    recorder.start();
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    
    setCalendarData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [name]: isCheckbox ? (e.target as HTMLInputElement).checked : value,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!calendarData) return;

    // Atualiza botão pra estado de carregando se quiser, mas aqui vou ser prático
    console.log('Enviando para o Google...', calendarData);
    
    const resposta = await saveToGoogle(calendarData);
    
    if (resposta.success) {
      alert(resposta.message); // Ex: 'Tarefa salva com sucesso!'
      setCalendarData(null); // Volta a tela para o botão de gravar
    } else {
      alert(`Erro: ${resposta.message}`);
    }
  };

  if (calendarData === null) {
    return (
      <main className="min-h-screen flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8">
        <h2 className="mt-2 mb-8 text-center text-3xl font-bold text-white">
          Gravar Áudio
        </h2>
        <button
          type="button"
          className={`text-center max-w-xl py-10 px-10 rounded-full justify-center transition-colors shadow-lg shadow-black/50 ${isRecording ? 'bg-red-600 text-white animate-pulse' : 'bg-[#1A1A1A] border border-gray-800 text-white hover:bg-gray-800'}`}
          onClick={() => {
            if (isRecording) {
              stopRecording();
            } else {
              startRecording();
            }
            setIsRecording(!isRecording);
          }}
        >
          {isRecording ? (
            <span className="flex items-center gap-2 text-xl font-medium">
              <span className="h-4 w-4 rounded-full bg-white"></span>
              Parar e Processar...
            </span>
          ) : (
            <span className="text-xl font-medium">🎤 Toque para Falar</span>
          )}
        </button>
      </main>
    );
  } else {
    return (
      <main className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <h2 className="mt-2 text-center text-2xl font-bold text-white">
          Confirme os Dados
        </h2>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md w-full px-4">
          <div className="bg-[#1A1A1A] py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-800">
            <Form onSubmit={handleSubmit} className="space-y-6">
              <FormGroup>
                <FormLabel htmlFor="tipo">Tipo</FormLabel>
                <select
                  id="tipo"
                  name="tipo"
                  value={calendarData.tipo}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-800 dark:border-dark-border-medium dark:bg-[#222222] dark:text-gray-100"
                >
                  <option value="evento">Evento no Calendário</option>
                  <option value="tarefa">Tarefa (Task)</option>
                </select>
              </FormGroup>

              <FormGroup>
                <FormLabel htmlFor="titulo">Título</FormLabel>
                <FormInput
                  id="titulo"
                  name="titulo"
                  value={calendarData.titulo || ''}
                  onChange={handleChange}
                  required
                />
              </FormGroup>

              <FormGroup>
                <FormLabel htmlFor="descricao">Descrição (Opcional)</FormLabel>
                <FormInput
                  id="descricao"
                  name="descricao"
                  value={calendarData.descricao || ''}
                  onChange={handleChange}
                />
              </FormGroup>

              {calendarData.tipo === 'evento' && (
                <>
                  <FormGroup className="flex flex-row items-center space-x-3 space-y-0">
                    <input
                      type="checkbox"
                      id="diaInteiro"
                      name="diaInteiro"
                      checked={!!calendarData.diaInteiro}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600 dark:border-gray-600 dark:bg-[#222222]"
                    />
                    <FormLabel htmlFor="diaInteiro" className="m-0">
                      Dia Inteiro?
                    </FormLabel>
                  </FormGroup>

                  <FormGroup>
                    <FormLabel htmlFor="data">Data de Início</FormLabel>
                    <FormInput
                      id="data"
                      name="data"
                      type="date"
                      value={calendarData.data || ''}
                      onChange={handleChange}
                      required
                    />
                  </FormGroup>

                  {!calendarData.diaInteiro && (
                    <FormGroup>
                      <FormLabel htmlFor="hora">Hora de Início</FormLabel>
                      <FormInput
                        id="hora"
                        name="hora"
                        type="time"
                        value={calendarData.hora || ''}
                        onChange={handleChange}
                        required
                      />
                    </FormGroup>
                  )}
                </>
              )}

              {calendarData.tipo === 'tarefa' && (
                <FormGroup>
                  <FormLabel htmlFor="data">Data de Vencimento (Opcional)</FormLabel>
                  <FormInput
                    id="data"
                    name="data"
                    type="date"
                    value={calendarData.data || ''}
                    onChange={handleChange}
                  />
                </FormGroup>
              )}

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setCalendarData(null)}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Confirmar e Salvar
                </button>
              </div>
            </Form>
          </div>
        </div>
      </main>
    );
  }
}
