'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import RecordForm from '@/components/RecordForm';
import { CalendarData } from '@/components/RecordForm';
import RecordButton from '@/components/RecordButton';

export default function Record() {
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);

  return (
    <>
      <Header />
      <main className="min-h-dvh flex flex-col pt-16 bg-zinc-950">
        {!calendarData ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 animate-fade-in">
            <div className="w-full max-w-md flex flex-col items-center space-y-12">
              <RecordButton setCalendarData={setCalendarData} />
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
                <RecordForm
                  calendarData={calendarData}
                  setCalendarData={setCalendarData}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
