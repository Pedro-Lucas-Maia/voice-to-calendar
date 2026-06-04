'use server';

import { mockDelay } from '@/lib/utils';
import { z } from 'zod';
import { verifyPassword, createSession } from '@/lib/auth';

const SigninSchema = z.object({
  senha: z.string().min(8, 'A senha deve ter pelo menos 6 caracteres'),
});

export type SignInData = z.infer<typeof SigninSchema>;

export type ActionResponse = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
  error?: string;
};

export async function SignIn(formData: FormData): Promise<ActionResponse> {
  try {
    await mockDelay(700);

    //Extract data form
    const data = {
      senha: formData.get('senha') as string,
    };

    //Validate with zod
    const validationResult = SigninSchema.safeParse(data);
    if (!validationResult.success) {
      return {
        success: false,
        message: 'Verificação falhou',
        errors: validationResult.error.flatten().fieldErrors,
      };
    }

    //Verify password
    const isPasswordValid = await verifyPassword(data.senha);
    if (!isPasswordValid) {
      return {
        success: false,
        message: 'Senha incorreta',
        errors: {
          password: ['Senha incorreta'],
        },
      };
    }

    await createSession(data.senha);

    return {
      success: true,
      message: 'Login bem sucessido',
    };
  } catch (e) {
    console.error('Sign in error:', e);
    return {
      success: false,
      message: 'An error occurred while signing in',
      error: 'Failed to sign in',
    };
  }
}
