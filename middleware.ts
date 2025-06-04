import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, NextRequest } from "next/server";

// const isbookingFormPath = pathname.includes("/booking-form");
// const isCauseFormPath = pathname.includes("/cause-form");
// const isReportPath = pathname === "/report";
// const isHPath = pathname.includes("/h");
// const isArrestDeclarationPath = pathname.includes("/arrest-declaration");
// const isAdminPath = pathname.includes("/admin");
const isProtectedRoute = createRouteMatcher([
  "/booking-form(.*)",
  "/cause-form(.*)",
  "/report(.*)",
  "/h(.*)",
  "/arrest-declaration(.*)",
  "/admin(.*)",
  "/reports(.*)",
  "/settings",
  "/incident-reports(.*)",
]);
export default clerkMiddleware(async (auth, req) => {
  const { userId, redirectToSignIn } = await auth();

  if (!userId && isProtectedRoute(req)) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
