import type { NextAuthConfig } from 'next-auth';

export const authConfig: NextAuthConfig = {
  trustHost: true,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'cf_server_auth_secret_demo_2026',
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [], // Added in auth.ts with Credentials
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = (auth?.user?.role as string) || '';
      const path = nextUrl.pathname;

      const isConsumerRoute = path.startsWith('/consumer');
      const isBusinessRoute = path.startsWith('/business');
      const isRegulatorRoute = path.startsWith('/regulator');

      if (isConsumerRoute || isBusinessRoute || isRegulatorRoute) {
        if (!isLoggedIn) return false; // NextAuth redirects to /login

        // Role-based protection
        if (isConsumerRoute && role !== 'CONSUMER') {
          const target = role === 'BUSINESS' ? '/business' : '/regulator';
          return Response.redirect(new URL(target, nextUrl));
        }
        if (isBusinessRoute && role !== 'BUSINESS') {
          const target = role === 'CONSUMER' ? '/consumer' : '/regulator';
          return Response.redirect(new URL(target, nextUrl));
        }
        if (isRegulatorRoute && role !== 'REGULATOR') {
          const target = role === 'CONSUMER' ? '/consumer' : '/business';
          return Response.redirect(new URL(target, nextUrl));
        }

        return true;
      }

      // If logged in and trying to access /login, redirect to their role dashboard
      if (isLoggedIn && path === '/login') {
        const target =
          role === 'CONSUMER'
            ? '/consumer'
            : role === 'BUSINESS'
            ? '/business'
            : '/regulator';
        return Response.redirect(new URL(target, nextUrl));
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email!;
        token.name = user.name!;
        token.role = user.role;
        token.preferredLang = user.preferredLang;
        token.businessId = user.businessId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.role = token.role as any;
        session.user.preferredLang = (token.preferredLang as string) || 'en';
        session.user.businessId = (token.businessId as string | null) || null;
      }
      return session;
    },
  },
};
