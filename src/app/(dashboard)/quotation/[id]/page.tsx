"use client"

import { useEffect, useState, useRef } from "react";
import { useUser } from "@clerk/clerk-react";
import InvoiceTemplate from "@/components/invoice";
import { Button } from "@/components/ui/button";
import ChatInterface from "@/components/chatcomponent/ichat-interface";
import LoadingDialog from "@/components/loader/loadingSpinner";
import toast from "react-hot-toast";
import { useReactToPrint } from "react-to-print";
import html2pdf from "html2pdf.js";
import { UploadDropzone } from "@/lib/uploadthing";
import { QuoteData } from "@/constants/quote-response";

const InvoicePage: React.FC = () => {
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
  const { user } = useUser();
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedData = sessionStorage.getItem("quoteData");
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      if (Array.isArray(parsedData)) {
        setQuoteData(parsedData.length > 0 ? parsedData[0] : null);
      } else {
        setQuoteData(parsedData);
      }
      setIsLoading(false);
    }
    if (user) {
      setUserId(user.id);
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  }, [user]);

  // Function to save the quotation with the uploaded PDF URL
  const saveQuotationWithPdfUrl = async (pdfUrl: string) => {
    try {
      const response = await fetch("/api/save-quotation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfUrl, quoteData, clerkId: userId }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast.error(`Error saving quotation: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Generate PDF using html2pdf.js
  const generatePdf = async () => {
    if (invoiceRef.current) {
      const element = invoiceRef.current;

      // Options for html2pdf
      const options = {
        margin: 0.5,
        filename: 'quotation.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      };

      // Generate the PDF from the HTML content
      html2pdf().from(element).set(options).outputPdf('blob').then((pdfBlob:any) => {
        // Create a File object from the PDF Blob
        const file = new File([pdfBlob], "quotation.pdf", { type: "application/pdf" });

        // Manually trigger the dropzone upload
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);

        const fileList = dataTransfer.files;
        const uploadDropzoneInput = document.querySelector('input[type="file"]') as HTMLInputElement;
        if (uploadDropzoneInput) {
          uploadDropzoneInput.files = fileList;
          uploadDropzoneInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
    } else {
      toast.error("Invoice content is not available for PDF generation.");
    }
  };

  const handlePrint = useReactToPrint({
    content: () => invoiceRef.current,
    onAfterPrint: generatePdf, // After printing, generate the PDF and trigger upload
  });

  return (
    <div className="flex flex-col lg:flex-row max-h-screen mt-10 mb-10 space-x-0 lg:space-x-4 mr-4">
      {isLoading || isSaving ? (
        <LoadingDialog open={isLoading || isSaving} />
      ) : (
        <>
          <div className="w-full lg:w-1/2 bg-white p-4 shadow-lg overflow-y-auto h-screen">
            {quoteData && (
              <div ref={invoiceRef}>
                <InvoiceTemplate quoteData={quoteData} />
              </div>
            )}
          </div>
          <div className="w-full lg:w-1/2 bg-white p-4 shadow-lg flex flex-col justify-between">
            <Button className="mb-4" onClick={handlePrint}>
              {isSaving ? "Saving..." : "Save Quotation"}
            </Button>
            {pdfUrl && (
              <Button onClick={() => window.open(pdfUrl, "_blank")}>
                Download PDF
              </Button>
            )}
            <UploadDropzone
              endpoint="pdfUploader"
              onClientUploadComplete={(res) => {
                const uploadedPdfUrl = res?.[0]?.url;
                if (uploadedPdfUrl) {
                  setPdfUrl(uploadedPdfUrl);
                  saveQuotationWithPdfUrl(uploadedPdfUrl);
                  toast.success("PDF uploaded and quotation saved successfully!");
                }
              }}
              onUploadError={(error: Error) => {
                toast.error("Error during upload: " + error.message);
              }}
            />
            <div className="flex-grow border-l-4 border-l-slate-200 p-4">
              <ChatInterface
                userId={userId || ""}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default InvoicePage;
