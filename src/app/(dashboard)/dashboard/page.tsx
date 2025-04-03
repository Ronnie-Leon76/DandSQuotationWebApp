"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { formatDistanceToNow } from "date-fns";
import { QuotationTable } from "@/components/quotationtable/quote-table";
import QuotationButton from "@/components/create-quotation/quotationButton";
import ExcelPage from "@/components/uploadxlsx";
// Define the interface for Quotation data
interface Quotation {
  id: string;
  name: string;
  location: string;
  businessUnit?: string;
  subtotal: number;
  vat: number;
  grand_total: number;
  explanation: string;
  additional_notes?: string;
  pdfUrl?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

// API call to fetch quotations based on filters
const fetchQuotations = async (
  minValue: number,
  maxValue: number,
  businessUnit: string,
  location: string
): Promise<Quotation[]> => {
  const response = await fetch("/api/quotation-data", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ minValue, maxValue, businessUnit, location }),
  });
  const data = await response.json();
  console.log("Data:", data);
  return data.data;
};

export default function QuotationDashboard() {
  const [minValue, setMinValue] = useState(0);
  const [maxValue, setMaxValue] = useState(10000000);
  const [selectedBusinessUnit, setSelectedBusinessUnit] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [data, setData] = useState<Quotation[]>([]);

  useEffect(() => {
    async function getData() {
      const quotations = await fetchQuotations(
        minValue,
        maxValue,
        selectedBusinessUnit,
        selectedLocation
      );
      setData(quotations);
    }
    getData();
  }, [minValue, maxValue, selectedBusinessUnit, selectedLocation]);

  // Filtered data based on slider and dropdown selections
  const formattedData = useMemo(() => {
    return data.map((item) => ({
      ...item,
      createdAt: formatDistanceToNow(new Date(item.createdAt), {
        addSuffix: true,
      }), // Converts createdAt to relative time (e.g., '3 hours ago')
    }));
  }, [data]);
  const filteredData = useMemo(() => {
    return formattedData.filter(
      (item) =>
        item.grand_total >= minValue &&
        item.grand_total <= maxValue &&
        (selectedBusinessUnit === "All" ||
          item.businessUnit === selectedBusinessUnit) &&
        (selectedLocation === "All" || item.location === selectedLocation)
    );
  }, [data, minValue, maxValue, selectedBusinessUnit, selectedLocation]);

  const businessUnitData = useMemo(() => {
    const dataMap: { [key: string]: number } = {};
    filteredData.forEach((item) => {
      if (item.businessUnit) {
        dataMap[item.businessUnit] =
          (dataMap[item.businessUnit] || 0) + item.grand_total;
      }
    });
    return Object.entries(dataMap).map(([name, value]) => ({ name, value }));
  }, [filteredData]);

  const locationData = useMemo(() => {
    const dataMap: { [key: string]: number } = {};
    filteredData.forEach((item) => {
      dataMap[item.location] = (dataMap[item.location] || 0) + item.grand_total;
    });
    return Object.entries(dataMap).map(([name, value]) => ({ name, value }));
  }, [filteredData]);

  const branchWithMostQuotations = useMemo(() => {
    return businessUnitData.reduce(
      (max, item) => (item.value > max.value ? item : max),
      { name: "N/A", value: 0 }
    );
  }, [businessUnitData]);
  // Render filtered quotation data as bar and line charts
  return (
    <div className="p-4 space-y-4">
      <div className="flex flex-row justify-between items-center">
        <h1 className="text-2xl font-bold">Quotation Dashboard</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Quotation Value Range Slider */}
        <Card>
          <CardHeader>
            <CardTitle>Quotation Value Range</CardTitle>
          </CardHeader>
          <CardContent>
            <Slider
              min={0}
              max={10000000}
              step={1000}
              value={[minValue, maxValue]}
              onValueChange={([min, max]) => {
                setMinValue(min);
                setMaxValue(max);
              }}
            />
            <div className="flex justify-between mt-2">
              <span>Ksh{minValue}</span>
              <span>Ksh{maxValue}</span>
            </div>
          </CardContent>
        </Card>

        {/* Location Select */}
        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={selectedLocation}
              onValueChange={setSelectedLocation}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem> 
                {data.length >0?
                Array.from(new Set(data.map((item) => item.location))).map(
                  (location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  )
                ): null}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Business Unit Select */}
        <Card>
          <CardHeader>
            <CardTitle>Branches</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={selectedBusinessUnit}
              onValueChange={setSelectedBusinessUnit}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Business Unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                {data.length > 0 ? 
                Array.from(
                  new Set(data.map((item) => item.businessUnit ||"Unknown"))
                )
                .filter((unit) => unit && unit !== "Unknown")
                .map((unit) => (
                  <SelectItem key={unit} value={unit}>
                    {unit}
                  </SelectItem>
                )):null}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>
      <div className="flex flex-row justify between">
        <QuotationButton/>
        <ExcelPage/>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Bar Chart for Quotation by Business Unit */}
        <Card>
          <CardHeader>
            <CardTitle>Quotations by Branches</CardTitle>
          </CardHeader>
          <CardContent>
          {businessUnitData.length > 0 ? (
            <ResponsiveContainer width="60%" height={300}>
              <BarChart data={businessUnitData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#0ea5e9" /> {/* Blue color */}
              </BarChart>
            </ResponsiveContainer>
            ): (
              <p>No data available for business units</p>
            )}
          </CardContent>
        </Card>
        {/* Bar Chart for Quotation by Location */}
        <Card>
          <CardHeader>
            <CardTitle>Quotations by Location</CardTitle>
          </CardHeader>
          <CardContent>
          {locationData.length > 0 ? (
            <ResponsiveContainer width="70%" height={300}>
              <BarChart data={locationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#007FFF" />
              </BarChart>
            </ResponsiveContainer>
            ) : (
              <p>No data available for locations</p>
            )}
          </CardContent>
        </Card>
        {/* Line Chart for Quotation Trends Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Quotation Trends Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="createdAt" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="grand_total"
                  stroke="#0ea5e9"
                />{" "}
                {/* Blue color for trend */}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        {/* Card for Branch with the Most Quotations */}
        <Card>
          <CardHeader>
            <CardTitle>Branch with Most Quotations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <h3 className="text-xl font-semibold">
                {branchWithMostQuotations.name}
              </h3>
              <p className="text-3xl font-bold mt-2">
                Ksh {branchWithMostQuotations.value.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      <div>
        <QuotationTable />
      </div>
    </div>
  );
}
