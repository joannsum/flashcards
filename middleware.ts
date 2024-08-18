import { clerkMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export default clerkMiddleware((auth, req, evt) => {
  const publicRoutes = ["/api/auth/firebase-token"];
  
  if (publicRoutes.some(route => req.nextUrl.pathname.startsWith(route))) {
    return NextResponse.next();
  }
  // Continue with default behavior for protected routes
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};