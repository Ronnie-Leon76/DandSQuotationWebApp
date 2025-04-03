"use client";
import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { FileText, Download, Eye, RefreshCw } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@clerk/nextjs";

type Option = {
  id: string;
  subtotal: number;
  grand_total: number;
};

type Quotation = {
  id: string;
  name: string;
  location: string;
  subtotal: number;
  vat: number;
  grand_total: number;
  createdAt: string;
  updatedAt: string;
  options: Option[];
};
export default function QuotationDisplay() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSubtotals, setShowSubtotals] = useState<{
    [key: string]: boolean;
  }>({});
  const { user } = useUser();

  const fetchQuotations = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/get-quotation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.id,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setQuotations(data.quotations);
      }
    } catch (error) {
      console.error("Error fetching quotations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if(user?.id){
      fetchQuotations();
    }
  }, [user?.id]);
  const toggleShowSubtotal = (optionId: string) => {
    setShowSubtotals((prevState) => ({
      ...prevState,
      [optionId]: !prevState[optionId],
    }));
  };
  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Quotation Dashboard</h1>
        <Button variant="outline" onClick={fetchQuotations}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Skeleton Loader  */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quotations.slice(0, 3).map((quote) => (
            <Card key={quote.id} className="w-full">
              <CardHeader>
                <CardTitle>{quote.name}</CardTitle>
                <CardDescription>{quote.location}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Badge variant="outline" className="mb-2">
                    ID: {quote.id}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Quotation Total
                  </p>
                  <p className="text-2xl font-bold">
                    Ksh{quote.grand_total.toLocaleString()}
                  </p>
                </div>
                {quote.options.map((option: Option, index) => (
                  <div key={option.id} className="mt-2">
                    <div className="flex justify-between">
                      <p className="font-semibold">
                        Option {index + 1}: Ksh{" "}
                        {showSubtotals[option.id]
                          ? option.subtotal.toLocaleString()
                          : option.grand_total.toLocaleString()}
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleShowSubtotal(option.id)}
                      >
                        {showSubtotals[option.id]
                          ? "Show Total"
                          : "Show Subtotal"}
                      </Button>
                    </div>
                  </div>
                ))}
                <div className="mt-4 h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={quote.options.map((option, index) => ({
                        name: `Option ${index + 1}`, 
                        value: option.grand_total,
                      }))}
                    >
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#0082D6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" size="sm">
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Recent Quotations Table */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Quotations</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading
                    ? [...Array(3)].map((_, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <Skeleton className="h-6 w-48" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-6 w-32" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-6 w-32" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-6 w-32" />
                          </TableCell>
                        </TableRow>
                      ))
                    : quotations.map((quote) => (
                        <TableRow key={quote.id}>
                          <TableCell>{quote.id}</TableCell>
                          <TableCell>{quote.location}</TableCell>
                          <TableCell>
                            {new Date(quote.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            Ksh{quote.grand_total.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
