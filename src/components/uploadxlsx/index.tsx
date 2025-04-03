"use client";
import React, { useState } from "react";
import * as XLSX from "xlsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CloudUpload } from "lucide-react";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";
import LoadingDialog from "../loader/loadingSpinner";
import RetryDialog from "../create-quotation/retry-form";
import axios from "axios";
import { useRouter } from "next/navigation";
import { DialogTrigger } from "@radix-ui/react-dialog";

const ExcelPage = () => {
  const router = useRouter();
  const [data, setData] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [retryOpen, setRetryOpen] = useState(false);
  const [retryData, setRetryData] = useState<any>(null);
  const [location, setLocation] = useState<string>("");

  const handleFileUpload = (e: any) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onloadstart = () => {
      setLoading(true);
      setProgress(10); // Start progress
    };

    reader.onload = (event) => {
      const binaryStr = event.target?.result;
      const workbook = XLSX.read(binaryStr, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const parsedData = XLSX.utils.sheet_to_json<any[]>(worksheet, {
        header: 1,
      });

      setProgress(80);
      setData(parsedData);
      setLoading(false);
      setProgress(100);
      setOpenDialog(true);
    };

    reader.readAsBinaryString(file);
  };

  const mapToRequiredFormat = () => {
    if (data.length <= 1) return [];
    // Skip the first row (header row) and map the remaining rows
    return data
      .slice(1)
      .map((row: any[]) => ({
        item_name: row[0],
        item_model_name: row[1],
        item_quantity: row[2],
        running_hours: row[3],
        location: location || "Default Location",
      }))
      .filter(
        (item: any) =>
          item.item_name &&
          item.item_model_name &&
          item.item_quantity &&
          item.running_hours
      );
  };

  const resetForm = () => {
    setData([]);
    setLoading(false);
    setProgress(0);
    setOpenDialog(false);
    setLocation("");
    (document.getElementById("file-upload") as HTMLInputElement).value = ""; // Reset file input
  };

  const handleRetry = () => {
    setRetryOpen(false);
    sendDataToServer();
  };

  const sendDataToServer = async () => {
    const formattedData = mapToRequiredFormat();
    console.log("Formatted Data:", formattedData);
    if (formattedData.length > 0) {
      setOpenDialog(false);
      const uniqueId = uuidv4();
      const apiEndpoint = process.env.NEXT_PUBLIC_AI_QUOTATION_ENDPOINT;
      if (!apiEndpoint) {
        throw new Error(
          "API endpoint is not defined in the environment variables."
        );
      }
      try {
        setLoading(true)
        sessionStorage.setItem("quoteData", JSON.stringify(null));
        const response = await axios.post(
          apiEndpoint as string,
          formattedData,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 200) {
          setLoading(false);
          console.log("Response Data:", response.data);
          const quoteData = response.data;
          sessionStorage.setItem("quoteData", JSON.stringify(quoteData));
          router.push(`/quotation/${uniqueId}`);
        } else {
          console.log("I am Here in the Error");
          setLoading(false);
          setRetryData(formattedData);
          setRetryOpen(true);
        }
      } catch (error) {
        toast.error(`Unable to Send Request: Please try again. ${error}`);
        setLoading(false);
        setRetryData(formattedData);
        setRetryOpen(true);
        console.error("Error occurred:", error);
      }
    }
  };

  return (
    <div className="container  p-8">   
      {loading && (
        <div className="w-full mt-4">
          <Progress value={progress} className="h-4" />
        </div>
      )}

      {/* Data Dialog */}
      <LoadingDialog open={loading} />
      <RetryDialog
        open={retryOpen}
        formattedData={retryData}
        onRetry={handleRetry}
        onCancel={() => setRetryOpen(false)}
      />
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogTrigger>
        <div className="mb-4 flex flex-col items-center">
        <label
          htmlFor="file-upload"
          className="w-full flex flex-col items-center justify-center border-2 border-dashed border-[#0082D6] text-[#0082D6] py-10 rounded-lg cursor-pointer hover:bg-sky-50 transition"
          style={{ maxWidth: "400px" }}
        >
          <CloudUpload className="w-12 h-12 mb-2 text-[#0082D6]" />
          <p className="font-semibold">Upload a file or drag and drop</p>
          <p className="text-xs text-gray-500">XLSX up to 10MB</p>
          <input
            id="file-upload"
            type="file"
            accept=".xlsx, .xls"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

        </DialogTrigger>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>Extracted Excel Data</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">
              Location
            </label>
            <input
              type="text"
              className="mt-1 p-2 border border-gray-300 rounded-md w-full"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter location"
            />
          </div>
          <div className="overflow-auto max-h-[500px] mt-4">
            <table className="table-auto border-collapse w-full text-sm">
              <thead>
                <tr>
                  {data[0]?.map((header: string, index: number) => (
                    <th
                      key={index}
                      className="border px-4 py-2 bg-gray-100 text-left"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.slice(1).map((row: any[], rowIndex: number) => (
                  <tr key={rowIndex}>
                    {row.map((cell: any, cellIndex: number) => (
                      <td key={cellIndex} className="border px-4 py-2">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-6 flex justify-end">
            <Button
              onClick={sendDataToServer}
              className="bg-sky-700 text-white px-4 py-2 rounded"
            >
              Send Data to Server
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExcelPage;
