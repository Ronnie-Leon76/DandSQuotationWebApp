import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
  publicRoutes: ["/", "/auth(.*)", "/images(.*)","/api/uploadthing","/api/solar-analysis","/api/quotationId"],
  ignoredRoutes: ["",],
});

export const config = {
  matcher: [
    "/((?!.+.[w]+$|_next).*)",
     "/",
      "/(api|trpc)(.*)"],
};
