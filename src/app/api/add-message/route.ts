import { client } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { chatId, content } = await request.json();

    if (!chatId || !content) {
      return NextResponse.json({
        success: false,
        error: "Chat ID and content are required",
      });
    }

    const newMessage = await client.message.create({
      data: {
        chatId,
        content,
      },
    });

    return NextResponse.json({
      success: true,
      messageId: newMessage.id,
    });
  } catch (error) {
    console.error("Error saving message:", error);
    return NextResponse.json({
      success: false,
      error: `[SAVING MESSAGE]: ${error}`,
    });
  }
}
