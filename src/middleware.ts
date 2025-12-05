import createMiddleware from 'next-intl/middleware';
import { NextResponse, NextRequest } from 'next/server';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Allow public and API routes to bypass auth checks
    const isPublicAsset =
        pathname.startsWith('/_next') ||
        pathname.startsWith('/images') ||
        pathname.startsWith('/favicon.ico') ||
        pathname.startsWith('/public');
    const isApiRoute = pathname.startsWith('/api');

    // Determine if the path is a login page (with or without locale prefix)
    const isLogin =
        pathname === '/login' ||
        pathname.startsWith('/login') ||
        /^\/(en|zh-Hans)\/login/.test(pathname);
    const isOtp =
        pathname === '/otp' ||
        pathname.startsWith('/otp') ||
        /^\/(en|zh-Hans)\/otp/.test(pathname);
    const isRegister =
        pathname === '/register' ||
        pathname.startsWith('/register') ||
        /^\/(en|zh-Hans)\/register/.test(pathname);
    const isVerify =
        pathname === '/verify-email' ||
        pathname.startsWith('/verify-email') ||
        /^\/(en|zh-Hans)\/verify-email/.test(pathname);

    const hasSession = Boolean(request.cookies.get('session')?.value);

    if (!hasSession && !isLogin && !isOtp && !isRegister && !isVerify && !isApiRoute && !isPublicAsset) {
        // Figure out locale from path or default
        const pathLocale = pathname.split('/')[1];
        const locale = (routing.locales as readonly string[]).includes(pathLocale)
            ? pathLocale
            : routing.defaultLocale;
        return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }

    // Run next-intl middleware for locale handling
    return intlMiddleware(request);
}

export const config = {
    // Match only internationalized pathnames
    matcher: ['/', '/(zh-Hans|en)/:path*']
};
