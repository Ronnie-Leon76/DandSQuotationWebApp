import { client } from "@/lib/prisma";
import { NextResponse } from "next/server";



export  async function POST(request:Request){
    try {
        const { userId } = await request.json();
        console.log("Request userId: ", userId);
    
        const user = await client.user.findUnique({
          where: { clerkId: userId },
        });
        if (!user) {
          return NextResponse.json(
            {
              success: false,
              error: "User not found",
            },
            { status: 404 }
          );
        }
    
        const quotations = await client.quotation.findMany({
          where: { userId: user.id },
          select:{
            id: true,
            name:true,
            location:true,
            subtotal:true,
            vat:true,
            grand_total:true,
            createdAt:true,
            updatedAt:true,
            options:{
                select:{
                    id:true,
                    subtotal:true,
                    grand_total:true
                }
            }
          }
         
        });
        console
        return NextResponse.json({
          success: true,
          quotations,
        });
    }catch(error){
      return  NextResponse.json(
        {
          success: false,
          error: error,
        },
        { status: 500 }
      )
    }
}