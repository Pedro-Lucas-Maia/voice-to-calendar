'use client';

import AuthForm from '@/components/AuthForm';
import { IconeCadeado } from '@/components/icons/Icons';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 bg-zinc-950">
      <div className="w-full max-w-sm space-y-8 animate-slide-up">
        <div className="text-center space-y-2 flex flex-col items-center">
          <div className="h-12 w-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4 shadow-sm">
            <IconeCadeado />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
            Acesso Restrito
          </h1>
          <p className="text-sm text-zinc-400">
            Insira sua credencial para acessar.
          </p>
        </div>

        <div className="bg-zinc-900/50 backdrop-blur-xl p-6 rounded-2xl border border-zinc-800/50 shadow-xl">
          <AuthForm />
        </div>
      </div>
    </main>
  );
}
