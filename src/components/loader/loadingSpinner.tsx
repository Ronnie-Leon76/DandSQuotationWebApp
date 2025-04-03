import React, { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

// Array of dynamic messages to show while loading
const loadingMessages = [
  "Fetching the best quote for you...",
  "Crunching the numbers...",
  "Cross-referencing databases...",
  "Almost there, hang tight...",
  "Applying the final touches to your quote...",
];

const LoadingDialog: React.FC<{ open: boolean }> = ({ open }) => {
  const [progress, setProgress] = useState(0);
  const [currentMessage, setCurrentMessage] = useState(loadingMessages[0]);

  useEffect(() => {
    // Simulate progress bar increasing
    if (open) {
      const progressInterval = setInterval(() => {
        setProgress((prev) => (prev < 100 ? prev + 1 : 100));
      }, 500); // Adjust this interval for how fast the bar fills up

      // Cycle through dynamic messages every 10 seconds
      const messageInterval = setInterval(() => {
        setCurrentMessage((prevMessage) => {
          const currentIndex = loadingMessages.indexOf(prevMessage);
          return loadingMessages[(currentIndex + 1) % loadingMessages.length];
        });
      }, 10000); // Change message every 10 seconds

      return () => {
        clearInterval(progressInterval);
        clearInterval(messageInterval);
      };
    }
  }, [open]);

  return (
    <Dialog open={open} modal>
      <DialogContent
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        className=" sm:max-w-[800px] sm:min-w-[600px] sm:min-h-[400px] z-50"
      >
        <div className="mt-10 flex flex-col items-center">
          {/* Dynamic Pulsing Icon */}
          <div className="relative mb-4">
            <div className="animate-pulse rounded-full h-32 w-32 bg-blue-500 opacity-70"></div>
            <div className="absolute inset-0 flex justify-center items-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-700"></div>
            </div>
          </div>

          {/* Fake Progress Bar */}
          <div className="w-full bg-gray-300 rounded-full h-4 mb-4 max-w-md">
            <div
              className="bg-blue-500 h-4 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          {/* Dynamic Loading Message */}
          <p className="text-blue-700 text-lg text-center">
            {currentMessage}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LoadingDialog;
