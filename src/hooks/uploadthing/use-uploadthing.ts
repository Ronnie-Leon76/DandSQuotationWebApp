import { useState } from "react";

export const useCustomUploadThing = ({
  endpoint,
  onUploadComplete,
  onUploadError,
}: {
  endpoint: string;
  onUploadComplete?: (fileUrl: string) => Promise<void>;
  onUploadError?: (error: Error) => void;
}) => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    console.log("Sending request to:", `/api/uploadthing?${endpoint}`);

    try {
      const formData = new FormData();
      formData.append("file", file);  
      // Use the UploadThing API endpoint to upload the PDF
      const response = await fetch(`/api/uploadthing?${endpoint}`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      const result = await response.json();
      const fileUrl = result.url; // Assuming URL is returned by the server

      if (onUploadComplete) {
        await onUploadComplete(fileUrl); // Save URL in DB or handle further
      }

      setIsUploading(false);
      return fileUrl;
    } catch (error) {
      setIsUploading(false);
      if (onUploadError) {
        onUploadError(error as Error);
      }
    }
  };

  return {
    uploadFile,
    isUploading,
  };
};
