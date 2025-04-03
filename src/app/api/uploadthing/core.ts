import { auth } from "@clerk/nextjs";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";


const f = createUploadthing();
const handleAuth = () => {
  const { userId } = auth();
  if (!userId) throw new UploadThingError("Unauthorized");
  return { userId };
};

export const ourFileRouter = {
  // Route to upload PDF files
  pdfUploader:f({ pdf: { maxFileSize: "16MB", maxFileCount: 1 } })
    .middleware(() => handleAuth()) // Ensure authentication
    .onUploadComplete(({ metadata }) => {
      console.log("Upload complete for:", metadata);
      // You can perform additional logic here after the upload is complete.
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;