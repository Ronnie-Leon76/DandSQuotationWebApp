import { NextResponse } from 'next/server';

export async function POST() {
  // Simulate a server error (status code 500)
  const simulatedErrorResponse = {
    message: "Simulated server error",
    errorCode: 500,
  };

  // Respond with an error
  return NextResponse.json(simulatedErrorResponse, { status: 500 });
}