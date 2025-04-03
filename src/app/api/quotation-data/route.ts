import { client } from "@/lib/prisma";
import { NextResponse } from "next/server";


export async function POST(request:Request){
    const { minValue, maxValue, businessUnit, location } = await request.json()
    try {
        const quotations = await client.quotation.findMany({
          where: {
            AND: [
              {
                grand_total: {
                  gte: Number(minValue),
                  lte: Number(maxValue),
                },
              },
              businessUnit !== 'All' ? { businessUnit: String(businessUnit) } : {},
              location !== 'All' ? { location: String(location) } : {},
            ],
          },
          include: {
            user: true,  // Include user details if needed
          },
        });
        const cleanQuotations = quotations.map((quote) => ({
          ...quote,
          businessUnit: quote.businessUnit || 'Unknown', // Fallback for empty businessUnit
          location: quote.location || 'Unknown', // Fallback for empty location
        }));
    
    
        return NextResponse.json({status: 200, data: cleanQuotations});
      } catch (error) {
        console.error(error);
      return NextResponse.json({status: 500, message: 'Internal Server Error'});
      }
}