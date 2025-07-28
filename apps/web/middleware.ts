import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // Allow only if logged in
    },
    pages: {
      signIn: "/auth/login", // Redirect unauthenticated users here
    },
  }
);

export const config = {
  matcher: ["/play/:path*"], // Protect all /play routes
};
