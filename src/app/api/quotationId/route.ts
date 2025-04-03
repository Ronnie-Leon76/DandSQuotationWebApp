import { client } from "@/lib/prisma";
import { NextResponse } from "next/server";


export async function POST(request:Request){
    const {quotationId} = await request.json();
    if(!quotationId){
        return NextResponse.json({success:false,error:"quotationId is required"})
    }
    try{
     const singleQuotation = await client.quotation.findUnique({
         where:{
            id:quotationId,
         },
         select:{
            id:true,
            name:true,
            options:{
                select:{
                    name:true,
                    grand_total:true
                }
            }
         }
     })
     return NextResponse.json({success:true,data:singleQuotation})
    }catch(error){
        console.error("Failed to fetch quotation:", error);
        return NextResponse.json({success:false,error:error})
    }   
}