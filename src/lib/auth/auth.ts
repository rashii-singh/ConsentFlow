import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: 'Demo Account Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
      },
      async authorize(credentials) {
        const email = credentials?.email as string;

        if (!email) return null;

        const normalizedEmail = email.toLowerCase().trim();

        // Deterministic role mapping for demo accounts
        let role: UserRole = UserRole.CONSUMER;
        let name = 'Demo User';

        if (normalizedEmail === 'consumer@demo.com') {
          role = UserRole.CONSUMER;
          name = 'Ananya Sharma';
        } else if (normalizedEmail === 'business@demo.com') {
          role = UserRole.BUSINESS;
          name = 'Vikram Mehta';
        } else if (normalizedEmail === 'regulator@demo.com') {
          role = UserRole.REGULATOR;
          name = 'Data Protection Authority Officer';
        } else {
          return null; // Only demo accounts allowed for hackathon
        }

        try {
          // Attempt DB lookup
          const dbUser = await prisma.user.findUnique({
            where: { email: normalizedEmail },
            include: { business: true },
          });

          if (dbUser) {
            return {
              id: dbUser.id,
              email: dbUser.email,
              name: dbUser.name,
              role: dbUser.role,
              preferredLang: dbUser.preferredLang,
              businessId: dbUser.business?.id || null,
            };
          }
        } catch (error) {
          console.warn('DB lookup failed during auth, falling back to deterministic demo user:', error);
        }

        // Fallback deterministic user
        return {
          id: `demo_${normalizedEmail.split('@')[0]}`,
          email: normalizedEmail,
          name: name,
          role: role,
          preferredLang: 'en',
          businessId: role === UserRole.BUSINESS ? 'biz_01' : null,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'consentflow_v2_hackathon_demo_secret_key_123',
});
