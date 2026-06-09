import { useActionState } from 'react';
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

export default function AuthForm() {
  const router = useRouter();

  const [state, formAction, isPending] = useActionState<
    ActionResponse,
    FormData
  >(async (prevState: ActionResponse, formData: FormData) => {
    try {
      const result = await SignIn(formData);
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
    <Form action={formAction} className="space-y-5">
      {state?.message && !state.success && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <FormError className="text-red-400 text-center">
            {state.message}
          </FormError>
        </div>
      )}

      <FormGroup>
        <FormLabel htmlFor="senha" className="text-zinc-300">
          Senha
        </FormLabel>
        <FormInput
          id="senha"
          name="senha"
          type="password"
          required
          disabled={isPending}
          className={`bg-zinc-950 border-zinc-800 text-zinc-100 focus:border-zinc-500 focus:ring-zinc-500 transition-colors ${state?.errors?.senha ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
          placeholder="••••••••"
        />
        {state?.errors?.senha && (
          <p id="error-senha" className="text-sm text-red-400 mt-1.5">
            {state.errors.senha[0]}
          </p>
        )}
      </FormGroup>

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-2.5 px-4 bg-zinc-100 text-zinc-900 hover:bg-white rounded-xl text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? 'Verificando...' : 'Entrar'}
      </button>
    </Form>
  );
}
