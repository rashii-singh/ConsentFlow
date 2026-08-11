import type { NextAuthConfig } from 'next-auth';

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/login',
  },
  providers: [], // Added in auth.ts with Credentials
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = auth?.user?.role;
      const path = nextUrl.pathname;

      const isConsumerRoute = path.startsWith('/consumer');
      const isBusinessRoute = path.startsWith('/business');
      const isRegulatorRoute = path.startsWith('/regulator');

      if (isConsumerRoute || isBusinessRoute || isRegulatorRoute) {
        if (!isLoggedIn) return false; // Redirect to /login

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
        const target = role === 'CONSUMER' ? '/consumer' : role === 'BUSINESS' ? '/business' : '/regulator';
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
        session.user.preferredLang = token.preferredLang as string;
        session.user.businessId = token.businessId as string | null;
      }
      return session;
    },
  },
};
