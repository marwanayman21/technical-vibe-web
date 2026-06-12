import { NextResponse } from 'next/server';
import { withAuth } from "next-auth/middleware";
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

const authMiddleware = withAuth(
  function onSuccess(req: any) {
    console.log(`[Proxy Auth] onSuccess for ${req.nextUrl.pathname}`);
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }: { token: any }) => {
        console.log(`[Proxy Auth] checking token, has token:`, !!token);
        return token != null;
      },
    },
    pages: {
      signIn: "/admin/login",
    },
  }
);

export function proxy(req: any, event: any) {
  const pathname = req.nextUrl.pathname;
  console.log(`[Proxy] request pathname: ${pathname}`);
  
  // Check if it is an admin route
  const isAdminPage = pathname.startsWith('/admin');
  
  if (isAdminPage) {
    const isLoginPage = pathname === '/admin/login';
    if (isLoginPage) {
      console.log(`[Proxy] public admin login page, bypass auth`);
      return NextResponse.next();
    }
    console.log(`[Proxy] protected admin page, executing authMiddleware`);
    return (authMiddleware as any)(req, event);
  } else {
    console.log(`[Proxy] non-admin page, executing intlMiddleware`);
    return intlMiddleware(req);
  }
}

export default proxy;

export const config = {
  matcher: ['/', '/(ar|en)/:path*', '/admin/:path*']
};
