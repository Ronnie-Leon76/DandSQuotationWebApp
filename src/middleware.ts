import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: [
    "/",
    "/auth(.*)",
    "/images(.*)",
    "/api/uploadthing",
    "/api/solar-analysis",
    "/api/quotationId",
    "/.well-known/appspecific/com.chrome.devtools.json", // Add this route
  ],
  ignoredRoutes: ["/davislogo.svg"],
});

export const config = {
  matcher: [
    "/((?!.+.[w]+$|_next).*)",
     "/",
      "/(api|trpc)(.*)"],
};
