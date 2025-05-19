"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";

interface OptionProps {
  name: string;
  grand_total: number;
}

interface AnalysisData {
  name: string;
  grandTotal: number;
  efficiency: string;
  lifespan: number;
  recommendation: string;
}

interface Quotation {
  name: string;
  location: string;
  options: OptionProps[];
}

interface OptionStatus {
  name: string;
  status: "loading" | "success" | "error";
}

async function fetchQuotation(quotationId: string) {
  try {
    const res = await fetch("/api/quotationId", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quotationId }),
    });
    const data = await res.json();
    if (data.success) {
      return data.data;
    } else {
      throw new Error(data.error || "Failed to fetch quotation");
    }
  } catch (error) {
    toast.error(`Error fetching quotation: ${error}`);
    console.error("Error fetching quotation:", error);
    return null;
  }
}

async function fetchSolarAnalysis(optionName: string, grandTotal: number) {
  const res = await fetch(`/api/solar-analysis`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ optionName, grandTotal }),
  });
  return await res.json();
}

// Example product recommendations (replace with real data)
const recommendations = [
  {
    name: "Solar Home Kit 500W",
    price: "KES 25,000",
    image: "/images/solar-kit.jpg",
    link: "https://shop.example.com/solar-kit-500w",
  },
  {
    name: "Inverter 1kVA",
    price: "KES 15,000",
    image: "/images/inverter.jpg",
    link: "https://shop.example.com/inverter-1kva",
  },
  {
    name: "Deep Cycle Battery 200Ah",
    price: "KES 18,000",
    image: "/images/battery.jpg",
    link: "https://shop.example.com/battery-200ah",
  },
];

export default function SolarQuotationVisualizer() {
  const router = useRouter();
  const { id: quotationId } = useParams<{ id: string }>();
  const [quotation, setQuotation] = useState<Quotation | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisData[]>([]);
  const [optionStatuses, setOptionStatuses] = useState<OptionStatus[]>([]);
  const [loadingComplete, setLoadingComplete] = useState(false);

  useEffect(() => {
    if (!quotationId) return;

    async function loadQuotationAndAnalysis() {
      const fetchedQuotation = await fetchQuotation(quotationId);
      if (fetchedQuotation) {
        setQuotation(fetchedQuotation);

        const initialStatuses = fetchedQuotation.options.map((option: OptionProps) => ({
          name: option.name,
          status: "loading",
        }));
        setOptionStatuses(initialStatuses);

        const analysisPromises = fetchedQuotation.options.map(async (option: OptionProps, index: number) => {
          try {
            const analysis = await fetchSolarAnalysis(option.name, option.grand_total);
            console.log("analysis", analysis);

            // Update analysisData progressively
            setAnalysisData((prevData) => [
              ...prevData.filter((data) => data.name !== option.name),
              {
                name: option.name,
                grandTotal: option.grand_total,
                efficiency: analysis.data.efficiency.toString(),
                lifespan: parseFloat(analysis.data.lifespan),
                recommendation: analysis.data.recommendation,
              },
            ]);

            setOptionStatuses((prevStatuses) =>
              prevStatuses.map((status, idx) =>
                idx === index ? { ...status, status: "success" } : status
              )
            );
          } catch (error) {
            console.error(`Error fetching analysis for ${option.name}:`, error);

            setOptionStatuses((prevStatuses) =>
              prevStatuses.map((status, idx) =>
                idx === index ? { ...status, status: "error" } : status
              )
            );
          }
        });

        await Promise.all(analysisPromises);
        setLoadingComplete(true); // Set to true when all promises resolve
      }
    }

    loadQuotationAndAnalysis();
  }, [quotationId]);

  useEffect(() => {
    if (loadingComplete) {
      router.refresh();
    }
  }, [loadingComplete, router]);

  if (!quotation) return <div>Loading...</div>;

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Quotation: More Information on the Quotation</h1>
      <h2 className="text-xl">Cost Analysis and Efficiency</h2>

      {/* Comparison Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Solar Power Backup Solution Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="80%" height={300}>
            <BarChart
              data={analysisData.map((item) => ({
                name: item.name,
                "Initial Cost": item.grandTotal,
                "Cost per Year": item.grandTotal / (item.lifespan ?? 1),
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Initial Cost" fill="#8884d8" />
              <Bar dataKey="Cost per Year" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Comparison Table */}
      {quotation.options.map((option) => {
        const status = optionStatuses.find((s) => s.name === option.name)?.status;
        const analysis = analysisData.find((a) => a.name === option.name);

        return (
          <div key={option.name} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Detailed Comparison for {option.name}</CardTitle>
              </CardHeader>
              <CardContent>
                {status === "loading" ? (
                  <p>Loading analysis for {option.name}...</p>
                ) : status === "error" ? (
                  <p>Error fetching analysis for {option.name}.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Solution</TableHead>
                        <TableHead>Initial Cost</TableHead>
                        <TableHead>Efficiency</TableHead>
                        <TableHead>Lifespan (years)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>{option.name}</TableCell>
                        <TableCell>{analysis?.grandTotal.toLocaleString()}</TableCell>
                        <TableCell>{analysis?.efficiency}%</TableCell>
                        <TableCell>{analysis?.lifespan}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            {status === "success" && (
              <Card>
                <CardHeader>
                  <CardTitle>Recommendation for {option.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{analysis?.recommendation}</p>
                </CardContent>
              </Card>
            )}
          </div>
        );
      })}

      {/* Product Recommendations Section */}
      <div className="mt-12">
        <h2 className="text-xl font-bold mb-6">Recommended Products for You</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {recommendations.map((item, idx) => (
            <Card
              key={idx}
              className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition p-6 flex flex-col items-center"
            >
              <img
                src={item.image}
                alt={item.name}
                className="w-40 h-40 object-contain mb-4 rounded"
              />
              <CardHeader className="p-0 mb-2">
                <CardTitle className="text-lg font-semibold text-gray-800 text-center">
                  {item.name}
                </CardTitle>
              </CardHeader>
              <div className="text-blue-600 font-bold text-xl mb-4">{item.price}</div>
              <CardContent className="p-0 w-full">
                <Button
                  asChild
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded"
                >
                  <a href={item.link} target="_blank" rel="noopener noreferrer">
                    View in Shop
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
