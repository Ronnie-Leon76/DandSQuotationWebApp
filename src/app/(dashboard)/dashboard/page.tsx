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
  return data.data || [];
};

// Add a predefined list of counties in Kenya
const countiesInKenya = [
  "All",
  "Nairobi",
  "Mombasa",
  "Kisumu",
  "Nakuru",
  "Eldoret",
  "Thika",
  "Nyeri",
  "Meru",
  "Machakos",
  "Embu",
  "Kericho",
  "Kakamega",
  "Bungoma",
  "Narok",
  "Kajiado",
  "Kiambu",
  "Kilifi",
  "Kwale",
  "Taita Taveta",
  "Lamu",
  "Tana River",
  "Garissa",
  "Wajir",
  "Mandera",
  "Marsabit",
  "Isiolo",
  "Samburu",
  "Laikipia",
  "Baringo",
  "Turkana",
  "West Pokot",
  "Trans Nzoia",
  "Uasin Gishu",
  "Elgeyo Marakwet",
  "Nandi",
  "Bomet",
  "Nyandarua",
  "Murang'a",
  "Kirinyaga",
  "Homa Bay",
  "Migori",
  "Kisii",
  "Nyamira",
  "Siaya",
  "Busia",
  "Vihiga",
];

export default function QuotationDashboard() {
  const [minValue, setMinValue] = useState(0);
  const [maxValue, setMaxValue] = useState(10000000);
  const [selectedBusinessUnit, setSelectedBusinessUnit] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [data, setData] = useState<Quotation[]>([]);
  const [latitude, setLatitude] = useState<string | null>(null);
  const [longitude, setLongitude] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

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

  const formattedData = useMemo(() => {
    return data.map((item) => ({
      ...item,
      createdAt: formatDistanceToNow(new Date(item.createdAt), {
        addSuffix: true,
      }),
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
  }, [formattedData, minValue, maxValue, selectedBusinessUnit, selectedLocation]);

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

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude.toFixed(6));
          setLongitude(position.coords.longitude.toFixed(6));
          setLocationError(null);
        },
        (error) => {
          setLocationError("Unable to retrieve location. Please allow location access.");
        }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser.");
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center">
        <h1 className="text-2xl font-bold text-center">Quotation Dashboard</h1>
      </div>

      {/* Filters Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
            <div className="flex justify-between mt-2 text-sm">
              <span>Ksh {minValue.toLocaleString()}</span>
              <span>Ksh {maxValue.toLocaleString()}</span>
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
                {countiesInKenya.map((county) => (
                  <SelectItem key={county} value={county}>
                    {county}
                  </SelectItem>
                ))}
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
                {data.length > 0 &&
                  Array.from(
                    new Set(data.map((item) => item.businessUnit || "Unknown"))
                  )
                    .filter((unit) => unit && unit !== "Unknown")
                    .map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <QuotationButton />
        <ExcelPage />
      </div>

      {/* Location Section */}
      <Card>
        <CardHeader>
          <CardTitle>Set Your Location</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium">Latitude</label>
                <input
                  type="text"
                  value={latitude || ""}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="Enter latitude"
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium">Longitude</label>
                <input
                  type="text"
                  value={longitude || ""}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="Enter longitude"
                  className="w-full border rounded px-3 py-2"
                />
              </div>
            </div>
            <button
              onClick={handleGetLocation}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Detect My Location
            </button>
            {locationError && <p className="text-red-500 text-sm">{locationError}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart for Business Units */}
        <Card>
          <CardHeader>
            <CardTitle>Quotations by Branches</CardTitle>
          </CardHeader>
          <CardContent>
            {businessUnitData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={businessUnitData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#0ea5e9" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center">No data available for business units</p>
            )}
          </CardContent>
        </Card>

        {/* Bar Chart for Locations */}
        <Card>
          <CardHeader>
            <CardTitle>Quotations by Location</CardTitle>
          </CardHeader>
          <CardContent>
            {locationData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
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
              <p className="text-center">No data available for locations</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Line Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                <Line type="monotone" dataKey="grand_total" stroke="#0ea5e9" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Branch with Most Quotations */}
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

      {/* Quotation Table */}
      <div>
        <QuotationTable />
      </div>
    </div>
  );
}
