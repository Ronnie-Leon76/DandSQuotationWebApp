import { client } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const {pdfUrl, quoteData, clerkId } = await request.json();


    const user = await client.user.findUnique({
      where: { clerkId: clerkId },
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

   
    const quotationData = normalizeData(quoteData);

    const quotation = await client.quotation.create({
      data: {
        name: quotationData.name,
        location: quotationData.location,
        subtotal: quotationData.subtotal,
        vat: quotationData.vat,
        grand_total: quotationData.grand_total,
        explanation: quotationData.explanation,
        additional_notes: quotationData.additional_notes || null,
        pdfUrl: pdfUrl || null, 
        userId: user.id,
        options: {
          create: quotationData.options.map((option: any) => ({
            name: option.name,
            subtotal: option.subtotal,
            vat: option.vat,
            grand_total: option.grand_total,
            explanation: option.explanation,
            additional_notes: option.additional_notes || null,
            components: {
              create: option.components.map((component: any) => ({
                product_model: component.product_model,
                item_category_code: component.item_category_code,
                description: component.description,
                quantity: component.quantity,
                unit_price: component.unit_price,
                gross_price: component.gross_price,
              })),
            },
          })),
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Quotation saved successfully",
      quotation,
    });
  } catch (error) {
    console.error("Error saving quotation:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to save quotation",
    });
  }
}

// Normalize the data based on the structure
function normalizeData(quoteData: any) {
  const validOptions = Object.values(quoteData)
    .filter(isOption)
    .filter((option: any) => option.name && option.subtotal && option.vat && option.grand_total);

  return {
    name: "Quotation", 
    location: quoteData.location || "",
    subtotal: calculateTotal(quoteData, "subtotal"),
    vat: calculateTotal(quoteData, "vat"),
    grand_total: calculateTotal(quoteData, "grand_total"),
    explanation: "", 
    additional_notes: "", 
    options: validOptions.map((option: any) => ({
      name: option.name,
      subtotal: option.subtotal,
      vat: option.vat,
      grand_total: option.grand_total,
      explanation: option.explanation || "",
      additional_notes: option.additional_notes || null,
      components: [
        ...(option.battery?.components || []),
        ...(option.solar_panel?.components || []),
        ...(option.inverter?.components || []),
        ...(option.other_components || []),
      ].map((component: any) => ({
        product_model: component.product_model,
        item_category_code: component.item_category_code,
        description: component.description,
        quantity: component.quantity,
        unit_price: component.unit_price,
        gross_price: component.gross_price,
      })),
    })),
  };
}


// Helper function to check if it's an option
function isOption(option: any) {
  return option && typeof option === "object" && !option.location;
}


function calculateTotal(quoteData: any, field: string) {
  return Object.values(quoteData)
    .filter(isOption)
    .reduce((acc: number, option: any) => acc + (option[field] || 0), 0);
}
