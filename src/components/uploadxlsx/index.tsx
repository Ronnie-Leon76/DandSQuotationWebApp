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
      setProgress(10);
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
    (document.getElementById("file-upload") as HTMLInputElement).value = "";
  };

  const handleRetry = () => {
    setRetryOpen(false);
    sendDataToServer();
  };

  const sendDataToServer = async () => {
    const formattedData = mapToRequiredFormat();
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
        setLoading(true);
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
          const quoteData = response.data;
          sessionStorage.setItem("quoteData", JSON.stringify(quoteData));
          router.push(`/quotation/${uniqueId}`);
        } else {
          setLoading(false);
          setRetryData(formattedData);
          setRetryOpen(true);
        }
      } catch (error) {
        toast.error(`Unable to Send Request: Please try again. ${error}`);
        setLoading(false);
        setRetryData(formattedData);
        setRetryOpen(true);
      }
    }
  };

  return (
    <div className="container p-8 max-w-2xl mx-auto">
      {/* Progress Bar */}
      {loading && (
        <div className="w-full mt-4">
          <Progress value={progress} className="h-3 rounded-full" />
        </div>
      )}

      {/* Loading and Retry Dialogs */}
      <LoadingDialog open={loading} />
      <RetryDialog
        open={retryOpen}
        formattedData={retryData}
        onRetry={handleRetry}
        onCancel={() => setRetryOpen(false)}
      />

      {/* Upload Card */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogTrigger asChild>
          <div className="mb-8 flex flex-col items-center">
            <label
              htmlFor="file-upload"
              className="w-full flex flex-col items-center justify-center border-2 border-dashed border-[#0082D6] text-[#0082D6] py-10 rounded-xl cursor-pointer hover:bg-sky-50 transition shadow-md"
              style={{ maxWidth: "420px" }}
            >
              <CloudUpload className="w-14 h-14 mb-3 text-[#0082D6]" />
              <p className="font-semibold text-lg">
                Upload a file or drag and drop
              </p>
              <p className="text-xs text-gray-500 mb-2">XLSX up to 10MB</p>
              <input
                id="file-upload"
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
                className="hidden"
              />
              <span className="text-xs text-gray-400 mt-2">
                Only Excel files are supported
              </span>
            </label>
          </div>
        </DialogTrigger>
        <DialogContent className="max-w-4xl rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-[#0082D6] text-xl font-bold">
              Extracted Excel Data
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <label className="block text-sm font-semibold text-[#0082D6] mb-1">
              Location
            </label>
            <input
              type="text"
              className="mt-1 p-2 border border-gray-300 rounded-md w-full focus:border-[#0082D6] focus:ring-2 focus:ring-[#0082D6]/20 transition"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter location"
            />
          </div>
          <div className="overflow-auto max-h-[400px] mt-6 rounded-lg border">
            <table className="table-auto border-collapse w-full text-sm">
              <thead>
                <tr>
                  {data[0]?.map((header: string, index: number) => (
                    <th
                      key={index}
                      className="border px-4 py-2 bg-[#f1f7fd] text-[#0082D6] font-semibold"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.slice(1).map((row: any[], rowIndex: number) => (
                  <tr key={rowIndex} className="hover:bg-sky-50 transition">
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
          <div className="mt-6 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={resetForm}
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
              type="button"
            >
              Cancel
            </Button>
            <Button
              onClick={sendDataToServer}
              className="bg-[#0082D6] hover:bg-[#006bb3] text-white px-6 py-2 rounded font-semibold shadow"
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
