import { useState, useRef, useEffect, Dispatch, SetStateAction } from 'react';
import { CalendarData } from '@/components/RecordForm';

import { IconeLoading, IconeMicrofone } from '@/components/icons/Icons';

export default function RecordButton({
  setCalendarData,
}: {
  setCalendarData?: Dispatch<SetStateAction<CalendarData | null>>;
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

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
            if (setCalendarData === undefined) {
              console.error('Algo deu errado com a transcrição do audio');
              alert('Falha ao transcrever o áudio.');
              throw new Error('Algo deu errado com a transcrição do audio');
            }
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

  return (
    <>
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
            <IconeLoading className="w-10 h-10 text-zinc-400 animate-spin" />
          ) : (
            <IconeMicrofone />
          )}
        </button>
      </div>
    </>
  );
}
