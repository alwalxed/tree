import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();

  // Log the incoming URL for debugging
  console.log('Middleware - Original URL:', url.pathname);

  // You can add URL normalization logic here if needed

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};