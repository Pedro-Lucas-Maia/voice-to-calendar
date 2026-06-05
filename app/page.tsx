'use client';

import { useActionState } from 'react';
import Header from '@/components/Header';
import {
  Form,
  FormGroup,
  FormLabel,
  FormError,
  FormInput,
} from '@/components/ui/Form';
import { SignIn, ActionResponse } from '@/actions/auth';
import { useRouter } from 'next/navigation';

const initialState: ActionResponse = {
  success: false,
  message: '',
  errors: undefined,
};

export default function Home() {
  const router = useRouter();

  // Use useActionState hook for the form submission action
  const [state, formAction, isPending] = useActionState<
    ActionResponse,
    FormData
  >(async (prevState: ActionResponse, formData: FormData) => {
    try {
      const result = await SignIn(formData);

      // Handle successful submission
      if (result.success) {
        router.push('/record');
        router.refresh();
      }

      return result;
    } catch (err) {
      return {
        success: false,
        message: (err as Error).message || 'An error occurred',
        errors: undefined,
      };
    }
  }, initialState);

  return (
    <>
      <Header />
      <main className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <h2 className="mt-2 text-center text-2xl font-bold text-white">
          Coloque a senha para iniciar o aplicativo
        </h2>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-[#1A1A1A] py-8 px-4 shadow sm:rounded-lg sm:px-10 border ">
            <Form action={formAction} className="space-y-6">
              {state?.message && !state.success && (
                <FormError>{state.message}</FormError>
              )}

              <FormGroup>
                <FormLabel htmlFor="password">Senha</FormLabel>
                <FormInput
                  id="senha"
                  name="senha"
                  type="password"
                  required
                  disabled={isPending}
                  aria-describedby="erro de senha"
                  className={state?.errors?.senha ? 'border-red-500' : ''}
                />
                {state?.errors?.senha && (
                  <p id="error-senha" className="text-sm text-red-500">
                    {state.errors.senha[0]}
                  </p>
                )}
              </FormGroup>
            </Form>
          </div>
        </div>
      </main>
    </>
  );
}
