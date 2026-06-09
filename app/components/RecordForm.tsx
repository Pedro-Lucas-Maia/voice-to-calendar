import { useState, Dispatch, SetStateAction } from 'react';
import { Form, FormGroup, FormLabel, FormInput } from '@/components/ui/Form';
import { saveToGoogle } from '@/actions/calendar';
import { IconeLoading, IconeSetaParaBaixo } from '@/components/icons/Icons';

export type CalendarData = {
  tipo: 'evento' | 'tarefa';
  titulo: string;
  descricao?: string | null;
  data?: string | null;
  hora?: string | null;
  diaInteiro?: boolean | null;
};

export default function RecordForm({
  calendarData,
  setCalendarData,
}: {
  calendarData: CalendarData;
  setCalendarData: Dispatch<SetStateAction<CalendarData | null>>;
}) {
  const [isSaving, setIsSaving] = useState(false);

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

  const handleSubmit = async (e: React.SubmitEvent) => {
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
            <IconeSetaParaBaixo />
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
          <span className="text-zinc-500 font-normal">(Opcional)</span>
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
            <span className="text-zinc-500 font-normal">(Opcional)</span>
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
              <IconeLoading className="w-4 h-4 animate-spin" />
              Salvando...
            </>
          ) : (
            'Salvar'
          )}
        </button>
      </div>
    </Form>
  );
}
