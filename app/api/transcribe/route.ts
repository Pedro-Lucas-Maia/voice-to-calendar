import { GoogleGenAI } from '@google/genai';
import { cookies } from 'next/headers';

const ai = new GoogleGenAI({});


export async function POST(request: Request) {
  const cookieStore = await cookies();
  const authToken = cookieStore.get('auth_token');

  if (!authToken || authToken.value !== process.env.SECRET_PASSWORD) {
    return Response.json({ erro: 'Não autorizado' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;

    const arrayBuffer = await audioFile.arrayBuffer();
    const audioBuffer = Buffer.from(arrayBuffer);

    const base64Audio = audioBuffer.toString('base64');

    const audioParaGemini = {
      inlineData: {
        data: base64Audio,
        mimeType: audioFile.type,
      },
    };

    const hoje = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    const promptDinamico = `Ouça este áudio de voz. É uma anotação pessoal. A data e hora atual do usuário é: ${hoje}. Extraia as informações e me devolva ESTRITAMENTE um JSON (sem markdown de formatação) com a seguinte estrutura:
{
  "tipo": "evento" ou "tarefa",
  "titulo": "Título da tarefa ou evento",
  "descricao": "Detalhes ou descrição, se houver. Senão deixe nulo",
  "data": "Data no formato YYYY-MM-DD. Baseie-se na data atual (${hoje}) se o áudio mencionar 'hoje', 'amanhã', dias da semana, etc. Se não houver, deixe nulo.",
  "hora": "Hora de início no formato HH:MM. Se não houver, deixe nulo.",
  "diaInteiro": booleano (true se for o dia todo ou sem hora definida)
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [promptDinamico, audioParaGemini],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const textoDaIA = response.text;
    return Response.json({ resultado: textoDaIA });
  } catch (e) {
    console.error('Não foi possivel fazer a transcrição do audio:', e);
    return Response.json({ erro: 'Falha na transcrição' }, { status: 500 });
  }
}
