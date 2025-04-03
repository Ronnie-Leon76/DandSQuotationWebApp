'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, CheckCircle } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { UploadButton, UploadDropzone } from '@/lib/uploadthing';
import toast from 'react-hot-toast';

export default function QuotationUpload() {
  const handleExtractData =async(appUrl:string) =>{
    try{
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileUrl: appUrl }),
      });

      const data = await response.json();
      if (response.ok) {
        toast.success("Data extracted successfully");
        console.log('Extracted Data:', data);
      } else {
        toast.error(`Extraction failed: ${data.error}`);
        console.error('Error during extraction:', data.error);
      }

    }catch(error:any){
      toast.error(`Error: ${error.message}`)
      console.error('Error sending file for Extraction:', error)
    }
  }

  return (
  
    <div className="w-full max-w-md mx-auto">
    <UploadDropzone
      endpoint="pdfUploader"
      onClientUploadComplete={(res) => {
        let appUrl: string | undefined;
        if(res && res.length > 0){
         appUrl = res[0].appUrl
          console.log("Uploaded File Url:", appUrl);
        }
        toast.success("Files Uploaded Successfully")
        if (appUrl) {
          handleExtractData(appUrl);
        }
       
      }}
      onUploadError={(error: Error) => {
        // Do something with the error.
        toast.error(`[UPLOAD ERROR]${error.message}`);
      }}
    />
  </div>
  );
}
