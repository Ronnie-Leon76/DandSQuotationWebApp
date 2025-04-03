import React, { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {  RotateCcw } from "lucide-react";

interface RetryDialogProps {
  open: boolean;
  formattedData: any;  
  onRetry: () => void;  
  onCancel: () => void;
}


const RetryDialog: React.FC<RetryDialogProps> = ({ open, formattedData, onRetry, onCancel }) => {
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (open) {
      setCountdown(10);  

      const countdownInterval = setInterval(() => {
        setCountdown((prevCountdown) => {
          if (prevCountdown === 1) {
            clearInterval(countdownInterval);
            onRetry(); 
            return 0;
          }
          return prevCountdown - 1;
        });
      }, 1000);

      
      return () => clearInterval(countdownInterval);
    }
  }, [open, onRetry]);

  return (
    <Dialog open={open} modal>
      <DialogContent
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        className="sm:max-w-[600px] sm:min-w-[400px] sm:min-h-[300px] z-50"
      >
        <DialogHeader>
          <DialogTitle>Request Failed</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <p className="text-gray-700">
            The request to send your quotation failed. The system will retry in{" "}
            <span className="font-bold">{countdown}</span> seconds.
          </p>
          <div className="mt-4">
            <pre className="p-2 bg-gray-100 rounded-lg text-sm">
              {JSON.stringify(formattedData, null, 2)}
            </pre>
          </div>
        </div>
        <DialogFooter className="flex justify-between">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="default" onClick={onRetry}>
            <RotateCcw/>
            {countdown > 0 ? `Retry (${countdown})` : "Retry Now"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RetryDialog;
