'use server';

import { signIn, signOut } from '@/lib/auth/auth';
import { AuthError } from 'next-auth';

export async function authenticate(email: string, redirectTo?: string) {
  try {
    const trimmed = email.toLowerCase().trim();
    await signIn('credentials', {
      email: trimmed,
      redirectTo: redirectTo || '/consumer',
    });
    return { success: true };
  } catch (error: any) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return {
            success: false,
            error: 'Authentication failed: Account not found. Please register an account below or select a demo persona.',
          };
        default:
          return { success: false, error: 'Authentication failed. Please try again.' };
      }
    }
    // Next.js redirection works via throwing NEXT_REDIRECT - rethrow it so Next.js handles navigation
    if (error?.digest?.startsWith('NEXT_REDIRECT') || error?.message === 'NEXT_REDIRECT') {
      throw error;
    }
    return {
      success: false,
      error: error?.message || 'Authentication error occurred',
    };
  }
}

export async function handleSignOut() {
  try {
    await signOut({ redirectTo: '/login' });
  } catch (error: any) {
    if (error?.digest?.startsWith('NEXT_REDIRECT') || error?.message === 'NEXT_REDIRECT') {
      throw error;
    }
    throw error;
  }
}
