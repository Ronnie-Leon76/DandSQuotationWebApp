import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

// Create an API handler for UploadThing
export const { GET, POST } = createRouteHandler({
    router: ourFileRouter,
  
  });
  
