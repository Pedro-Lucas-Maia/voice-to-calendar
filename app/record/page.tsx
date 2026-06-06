'use client';

import { useState, useRef, useEffect } from 'react';
import { Form, FormGroup, FormLabel, FormInput } from '@/components/ui/Form';
import { saveToGoogle } from '@/actions/calendar';
import Header from '@/components/Header';

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        stream.getTracks().forEach((track) => track.stop());
      })
      .catch((err) => {
        console.error('Permissão de microfone negada ou erro:', err);
      });
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (evento) => {
        if (evento.data.size > 0) {
          audioChunksRef.current.push(evento.data);
        }
      };

      recorder.onstop = async () => {
        setIsProcessing(true);
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
            if (jsonString.startsWith('```json')) {
              jsonString = jsonString
                .replace(/```json\n?/, '')
                .replace(/\n?```/, '');
            }
            const objetoDoEvento = JSON.parse(jsonString);
            setCalendarData(objetoDoEvento);
          } else {
            console.error('Algo deu errado com a transcrição do audio');
            alert('Falha ao transcrever o áudio.');
          }
        } catch (e) {
          console.error('Erro na hora de enviar:', e);
          alert('Erro na conexão com o servidor.');
        } finally {
          setIsProcessing(false);
        }
      };

      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Erro ao acessar microfone:', err);
      alert('Não foi possível acessar o microfone.');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
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

    setIsSaving(true);
    const resposta = await saveToGoogle(calendarData);
    setIsSaving(false);

    if (resposta.success) {
      setCalendarData(null);
    } else {
      alert(`Erro: ${resposta.message}`);
    }
  };

  return (
    <>
      <Header />
      <main className="min-h-dvh flex flex-col pt-16 bg-zinc-950">
        {!calendarData ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 animate-fade-in">
            <div className="w-full max-w-md flex flex-col items-center space-y-12">
              <div className="text-center space-y-3">
                <h2 className="text-3xl font-semibold tracking-tight text-zinc-100">
                  {isRecording
                    ? 'Ouvindo...'
                    : isProcessing
                      ? 'Processando...'
                      : 'O que você tem em mente?'}
                </h2>
                <p className="text-zinc-400 text-sm">
                  {isRecording
                    ? 'Fale naturalmente sobre a sua tarefa ou evento.'
                    : isProcessing
                      ? 'Nossa IA está extraindo os detalhes.'
                      : 'Toque no botão e diga a sua próxima tarefa ou evento.'}
                </p>
              </div>

              <div className="relative flex items-center justify-center">
                {isRecording && (
                  <>
                    <div className="absolute w-40 h-40 bg-red-500/20 rounded-full animate-ping"></div>
                    <div className="absolute w-48 h-48 bg-red-500/10 rounded-full animate-pulse"></div>
                  </>
                )}
                <button
                  type="button"
                  disabled={isProcessing}
                  className={`relative z-10 w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl ${
                    isRecording
                      ? 'bg-red-500 shadow-red-500/20 scale-105'
                      : isProcessing
                        ? 'bg-zinc-800 cursor-not-allowed opacity-80'
                        : 'bg-zinc-100 hover:bg-white hover:scale-105 hover:shadow-zinc-100/20'
                  }`}
                  onClick={() => {
                    if (isRecording) {
                      stopRecording();
                    } else {
                      startRecording();
                    }
                  }}
                >
                  {isRecording ? (
                    <div className="w-10 h-10 bg-white rounded-md animate-pulse"></div>
                  ) : isProcessing ? (
                    <svg
                      className="w-10 h-10 text-zinc-400 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : (
                    <svg
                      className="w-12 h-12 text-zinc-950"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center p-6 pb-24 overflow-y-auto w-full">
            <div className="w-full max-w-md space-y-6 animate-slide-up">
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">
                  Confirme os detalhes
                </h2>
                <p className="text-zinc-400 text-sm">
                  Edite se necessário antes de salvar no calendário.
                </p>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl">
                <Form onSubmit={handleSubmit} className="space-y-5">
                  <FormGroup>
                    <FormLabel htmlFor="tipo" className="text-zinc-300">
                      Tipo de Registro
                    </FormLabel>
                    <div className="relative">
                      <select
                        id="tipo"
                        name="tipo"
                        value={calendarData.tipo}
                        onChange={handleChange}
                        className="w-full h-11 rounded-xl appearance-none border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:border-transparent transition-all"
                      >
                        <option value="evento">Evento</option>
                        <option value="tarefa">Tarefa</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-zinc-400">
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                          ></path>
                        </svg>
                      </div>
                    </div>
                  </FormGroup>

                  <FormGroup>
                    <FormLabel htmlFor="titulo" className="text-zinc-300">
                      Título
                    </FormLabel>
                    <FormInput
                      id="titulo"
                      name="titulo"
                      value={calendarData.titulo || ''}
                      onChange={handleChange}
                      required
                      className="bg-zinc-950 border-zinc-800 focus:ring-zinc-600"
                    />
                  </FormGroup>

                  <FormGroup>
                    <FormLabel htmlFor="descricao" className="text-zinc-300">
                      Descrição{' '}
                      <span className="text-zinc-500 font-normal">
                        (Opcional)
                      </span>
                    </FormLabel>
                    <textarea
                      id="descricao"
                      name="descricao"
                      value={calendarData.descricao || ''}
                      onChange={handleChange}
                      rows={3}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:border-transparent transition-all resize-none"
                    />
                  </FormGroup>

                  {calendarData.tipo === 'evento' && (
                    <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800/50 space-y-4">
                      <FormGroup className="flex flex-row items-center justify-between space-y-0">
                        <FormLabel
                          htmlFor="diaInteiro"
                          className="m-0 text-zinc-300 cursor-pointer"
                        >
                          Dia Inteiro
                        </FormLabel>
                        <div className="relative flex items-center">
                          <input
                            type="checkbox"
                            id="diaInteiro"
                            name="diaInteiro"
                            checked={!!calendarData.diaInteiro}
                            onChange={handleChange}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-zinc-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-zinc-950 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-zinc-400 after:border-zinc-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-zinc-100 peer-checked:after:bg-zinc-950"></div>
                        </div>
                      </FormGroup>

                      <div className="grid grid-cols-2 gap-4">
                        <FormGroup>
                          <FormLabel
                            htmlFor="data"
                            className="text-zinc-400 text-xs uppercase tracking-wider"
                          >
                            Data
                          </FormLabel>
                          <FormInput
                            id="data"
                            name="data"
                            type="date"
                            value={calendarData.data || ''}
                            onChange={handleChange}
                            required
                            className="bg-zinc-900 border-zinc-800 text-zinc-100 text-sm focus:ring-zinc-600 appearance-none"
                          />
                        </FormGroup>

                        {!calendarData.diaInteiro && (
                          <FormGroup>
                            <FormLabel
                              htmlFor="hora"
                              className="text-zinc-400 text-xs uppercase tracking-wider"
                            >
                              Hora
                            </FormLabel>
                            <FormInput
                              id="hora"
                              name="hora"
                              type="time"
                              value={calendarData.hora || ''}
                              onChange={handleChange}
                              required
                              className="bg-zinc-900 border-zinc-800 text-zinc-100 text-sm focus:ring-zinc-600 appearance-none"
                            />
                          </FormGroup>
                        )}
                      </div>
                    </div>
                  )}

                  {calendarData.tipo === 'tarefa' && (
                    <FormGroup>
                      <FormLabel htmlFor="data" className="text-zinc-300">
                        Data de Vencimento{' '}
                        <span className="text-zinc-500 font-normal">
                          (Opcional)
                        </span>
                      </FormLabel>
                      <FormInput
                        id="data"
                        name="data"
                        type="date"
                        value={calendarData.data || ''}
                        onChange={handleChange}
                        className="bg-zinc-950 border-zinc-800 focus:ring-zinc-600 appearance-none"
                      />
                    </FormGroup>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setCalendarData(null)}
                      className="flex-1 py-2.5 px-4 rounded-xl text-sm font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-600"
                    >
                      Descartar
                    </button>
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex-1 py-2.5 px-4 rounded-xl text-sm font-medium text-zinc-900 bg-zinc-100 hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-900 flex justify-center items-center gap-2 disabled:opacity-70"
                    >
                      {isSaving ? (
                        <>
                          <svg
                            className="w-4 h-4 animate-spin"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Salvando...
                        </>
                      ) : (
                        'Salvar'
                      )}
                    </button>
                  </div>
                </Form>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
