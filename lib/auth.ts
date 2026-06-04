import { cookies } from 'next/headers';

export async function verifyPassword(password: string) {
  return password === process.env.SECRET_PASSWORD;
}

export async function createSession(password: string) {
  try {
    const cookieStore = await cookies();
    cookieStore.set({
      name: 'auth_token',
      value: password,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30, // 1 month
      path: '/',
      sameSite: 'lax',
    });
    return true;
  } catch (e) {
    console.error('Error creating session:', e);
    return false;
  }
}
