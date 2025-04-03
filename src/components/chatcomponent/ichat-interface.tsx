"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "../ui/button";
import { Send } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

const ChatInterface = ({
  userId,
  isLoading,
  setIsLoading,
}: {
  userId: string;
  isLoading: boolean; 
  setIsLoading: (loading: boolean) => void; 
}) => {
  const [chatContent, setChatContent] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [chatId, setChatId] = useState<string | null>(null);
  const [sentText, setSentText] = useState<string>("");
  const messageEndRef = useRef<HTMLDivElement>(null);

  const router = useRouter()

  useEffect(() => {
    const createChat = async () => {
      const response = await fetch("/api/create-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();
      if (data.success) {
        // toast.success("Chat created successfully");
        // console.log("Setting Chat Id Successful");
        setChatId(data.chatId);
      }else{
        toast.error("Unable to create chat");
      }
    };

    createChat();
  }, [userId]);

  useEffect(() => {
    const fetchChatContent = async () => {
      if (chatId) {
        const response = await fetch(`/api/get-messages?chatId=${chatId}`);
        const data = await response.json();
        if (data.success) {
          setChatContent(data.messages);
        }
        else{
          toast.error("Unable to fetch chat content");
        }
      }
    };

    fetchChatContent();
  }, [chatId]);

  const sendMessage = async () => {
    toast.success("Message Sent");
    if (chatId && inputText) {
      setIsLoading(true);

      const newMessage = {
        id: Date.now().toString(),
        content: inputText,
      };
      setChatContent((prevChatContent) => [...prevChatContent, newMessage]);

      const sentInputText = inputText;
      setSentText(sentInputText); 
      try {
        const refineQuote = process.env.NEXT_PUBLIC_AI_REFINEMENT_ENDPOINT;
        const refineResponse = await axios.post(
          `${refineQuote}?refinement_query=${encodeURIComponent(inputText)}`,
          {},
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (refineResponse.status === 200) {
          sessionStorage.setItem("quoteData", JSON.stringify(null));
          const quoteData = refineResponse.data;
          sessionStorage.setItem("quoteData", JSON.stringify(quoteData));
          setInputText("");
          router.refresh()
          toast.success("Quote Regenerated Successfully");
        } else {
          setInputText(sentInputText);
          toast.error(`Server Error: Please try again.${refineResponse.status}`);
          console.error(`Unexpected status code: ${refineResponse.status}`);
        }
          const saveMessageResponse = await fetch("/api/add-message", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              chatId,
              content: inputText,
            }),
          });

          const saveMessageData = await saveMessageResponse.json();
          if (saveMessageData.success) {
         
          }else{
            toast.error(`[SAVEMESSAGETODB] ${saveMessageData.error}`);
          }
      } catch (error) {
        setInputText(sentInputText);
        toast.error(`Unable to Send Request: Please try again. ${error}`);
        console.error("Error occurred:", error);
      } finally {
        setIsLoading(false);
       
      }
    }
  };
  return (
      <div className="flex flex-col bg-white border rounded p-4 h-full">
      <div className="flex-1 overflow-y-auto mb-2">
        {chatContent.map((msg, index) => (
          <div key={index} className="bg-gray-300 p-2 my-1 rounded shadow">
            {msg.content}
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>
      <div className="flex mb-10">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 p-2 border rounded-l"
          disabled={isLoading}
        />
        <Button
          onClick={sendMessage}
          className="rounded-r"
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Send"} <Send />
        </Button>
      </div>
    </div>
  );
};

export default ChatInterface;
