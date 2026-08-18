import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
      },
      async authorize(credentials) {
        const rawEmail = credentials?.email as string | undefined;
        if (!rawEmail || typeof rawEmail !== 'string') {
          return null;
        }

        const normalizedEmail = rawEmail.toLowerCase().trim();
        if (!normalizedEmail || !normalizedEmail.includes('@')) {
          return null;
        }

        try {
          // 1. Query database for existing user
          let dbUser = await prisma.user.findUnique({
            where: { email: normalizedEmail },
            include: { business: true },
          });

          // 2. Auto-initialize recognized demo users if not yet in database
          if (!dbUser) {
            if (normalizedEmail === 'consumer@demo.com') {
              dbUser = await prisma.user.create({
                data: {
                  email: 'consumer@demo.com',
                  name: 'Ananya Sharma',
                  role: UserRole.CONSUMER,
                  preferredLang: 'hi',
                },
                include: { business: true },
              });
            } else if (normalizedEmail === 'business@demo.com') {
              dbUser = await prisma.user.create({
                data: {
                  email: 'business@demo.com',
                  name: 'Vikram Mehta',
                  role: UserRole.BUSINESS,
                  preferredLang: 'en',
                },
                include: { business: true },
              });
            } else if (normalizedEmail === 'regulator@demo.com') {
              dbUser = await prisma.user.create({
                data: {
                  email: 'regulator@demo.com',
                  name: 'Data Protection Authority Officer',
                  role: UserRole.REGULATOR,
                  preferredLang: 'en',
                },
                include: { business: true },
              });
            } else {
              // Non-demo unregistered email -> reject authentication
              return null;
            }
          }

          return {
            id: dbUser.id,
            email: dbUser.email,
            name: dbUser.name,
            role: dbUser.role,
            preferredLang: dbUser.preferredLang,
            businessId: dbUser.business?.id || null,
          };
        } catch (error) {
          console.warn('Database error during authorize, checking demo accounts fallback:', error);

          // Resilient fallback for recognized demo accounts if DB is unavailable
          if (normalizedEmail === 'consumer@demo.com') {
            return {
              id: 'demo_consumer',
              email: 'consumer@demo.com',
              name: 'Ananya Sharma',
              role: UserRole.CONSUMER,
              preferredLang: 'hi',
              businessId: null,
            };
          } else if (normalizedEmail === 'business@demo.com') {
            return {
              id: 'demo_business',
              email: 'business@demo.com',
              name: 'Vikram Mehta',
              role: UserRole.BUSINESS,
              preferredLang: 'en',
              businessId: 'biz_01',
            };
          } else if (normalizedEmail === 'regulator@demo.com') {
            return {
              id: 'demo_regulator',
              email: 'regulator@demo.com',
              name: 'Data Protection Authority Officer',
              role: UserRole.REGULATOR,
              preferredLang: 'en',
              businessId: null,
            };
          }

          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'cf_server_auth_secret_demo_2026',
});
