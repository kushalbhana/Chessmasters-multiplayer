import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/auth/login",  // Redirect to this page if not authenticated
  },
});

// Apply this middleware only to certain routes
export const config = {
  matcher: [
    "/play/:path*",  // Example: protect all routes under /play
  ],
};
