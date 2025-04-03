import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_KEY,
});

export async function POST(request: Request) {
  const { optionName, grandTotal } = await request.json();

  if (!optionName || !grandTotal) {
    return NextResponse.json({
      success: false,
      error: "optionName and grandTotal are required",
    });
  }

  const knowledge = `
    Lead-Acid batteries generally have an efficiency of 70-80% and a lifespan of around 5 years.
    Lithium-Ion batteries have a higher efficiency of 85-90% and typically last for around 10 years.
    Inverter solutions tend to have an efficiency of 90-95% and also have a lifespan of around 10 years.
  `;

  const prompt = `
    You are an expert in solar power systems. I have a solar solution called "${optionName}" with a grand total cost of ${grandTotal}.
    Use the following knowledge when generating the analysis for this solution:

    ${knowledge}

    Please provide the following detail in the exact format:
    Efficiency: [percentage value without the % symbol]
    Lifespan: [estimated years]
    Recommendation: [Provide 3-5 short bullet points, each no more than 1-2 sentences, focusing on key aspects like efficiency, lifespan, and overall value of the solar solution.]
  `;

  // OPENAI API CALL
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 300,
    temperature: 0.5,
  });

  const responseText =
    response?.choices[0]?.message?.content?.trim().split("\n") || [];

  if (!responseText) {
    return NextResponse.json({
      success: false,
      error: "Failed to generate analysis",
    });
  }

  const efficiencyLine = responseText.find(line => line.startsWith("Efficiency:"));
  const lifespanLine = responseText.find(line => line.startsWith("Lifespan:"));
  const recommendationLineIndex = responseText.findIndex(line => line.startsWith("Recommendation:"));
  const recommendation = responseText.slice(recommendationLineIndex).join(" ").replace("Recommendation:", "").trim();

  const efficiency = efficiencyLine ? parseFloat(efficiencyLine.replace(/[^\d.]/g, '')) : null;
  const lifespan = lifespanLine ? parseFloat(lifespanLine.replace(/[^\d.]/g, '')) : null;


  return NextResponse.json({
    success: true,
    data: {
      name: optionName,
      grandTotal: grandTotal,
      efficiency: efficiency || 0, 
      lifespan: lifespan || 0,   
      recommendation: recommendation || "No recommendation provided",
    },
  });
}
