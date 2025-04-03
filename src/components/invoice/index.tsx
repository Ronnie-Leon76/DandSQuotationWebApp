"use client";

import { Items, QuoteData } from "@/constants/quote-response";
import React, { useEffect, useState } from "react";

interface Component {
  product_model: string;
  no: string;
  description: string;
  quantity: number;
  unit_price: number;
  gross_price: number;
}

type Props = {
  quoteData: QuoteData; 
};

const InvoiceTemplate: React.FC<Props> = ({ quoteData }) => {
  const [initialItems, setInitialItems] = useState<Items[] | null>(null);
  const [initialLocation, setInitialLocation] = useState<string>("");

  // Helper function to save to localStorage
  const saveToLocalStorage = (key: string, value: any) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, JSON.stringify(value));
    }
  };

  // Helper function to get from localStorage
  const getFromLocalStorage = (key: string) => {
    if (typeof window !== "undefined") {
      const storedValue = localStorage.getItem(key);
      return storedValue ? JSON.parse(storedValue) : null;
    }
    return null;
  };

  useEffect(() => {
    
    const storedItems = getFromLocalStorage("items");
    const storedLocation = getFromLocalStorage("location");

    if (storedItems) {
      setInitialItems(storedItems);
    }

    if (storedLocation) {
      setInitialLocation(storedLocation);
    }

   
    if (quoteData.items && !storedItems) {
      const items = Array.isArray(quoteData.items) ? quoteData.items : [quoteData.items];
      setInitialItems(items);
      saveToLocalStorage("items", items);
    }

    if (quoteData.location && !storedLocation) {
      setInitialLocation(quoteData.location);
      saveToLocalStorage("location", quoteData.location);
    }
  }, [quoteData]);

  const options = [
    ...(Array.isArray(quoteData.option1) ? quoteData.option1 : quoteData.option1 ? [quoteData.option1] : []),
    ...(Array.isArray(quoteData.option2) ? quoteData.option2 : quoteData.option2 ? [quoteData.option2] : []),
    ...(quoteData.option3 ? (Array.isArray(quoteData.option3) ? quoteData.option3 : [quoteData.option3]) : [])
  ];

  const renderItems = (items: Items[]) => {
    const itemList = Array.isArray(items) ? items : [items];

    const totalEnergyDemand = itemList.reduce((total, item) => total + item.energy_demand, 0);

    return (
      <>
        <div className="grid grid-cols-5 border-b font-bold bg-gray-200">
          <div className="p-2 border-r">Item Model</div>
          <div className="p-2 border-r">Quantity</div>
          <div className="p-2 border-r">Running Hours</div>
          <div className="p-2 border-r">Wattage(Watts)</div>
          <div className="p-2">Energy Demand(Watts)</div>
        </div>

        {itemList.map((item, i) => (
          <div key={i} className={`grid grid-cols-5 border-b mb-5 ${i % 2 === 0 ? "bg-gray-50" : ""}`}>
            <div className="p-2 border-r">{item.item_model}</div>
            <div className="p-2 border-r">{item.quantity}</div>
            <div className="p-2 border-r">{item.running_hours}</div>
            <div className="p-2 border-r">{item.wattage.toLocaleString()}</div>
            <div className="p-2">{item.energy_demand.toLocaleString()}</div>
          </div>
        ))}

        <div className="mt-4 font-bold text-xl mb-2">
          {itemList.length === 1 ? (
            <p>Total energy demand for product: {totalEnergyDemand.toLocaleString()}Watts</p>
          ) : (
            <p>Total energy demand for the items: {totalEnergyDemand.toLocaleString()} Watts</p>
          )}
        </div>
      </>
    );
  };

  const renderComponents = (components: Component[]) =>
    components.map((component, i) => (
      <div key={i} className={`grid grid-cols-[1fr,1fr,2fr,1fr,1fr,1fr] border-b ${i % 2 === 0 ? "bg-gray-50" : ""}`}>
        <div className="p-2 border-r">{component.no}</div>
        <div className="p-2 border-r">{component.product_model}</div>
        <div className="p-2 border-r">{component.description}</div>
        <div className="p-2 border-r">{component.quantity}</div>
        <div className="p-2 border-r">{component.unit_price.toLocaleString()}</div>
        <div className="p-2">{component.gross_price.toLocaleString()}</div>
      </div>
    ));

  const renderOption = (option: any, index: number) => (
    <div key={index} className="mb-8">
      <h2 className="text-xl font-bold text-gray-700 mb-4">{option.name}</h2>
      <div className="mb-4">
        <div className="grid grid-cols-[1fr,1fr,2fr,1fr,1fr,1fr] bg-gray-100 font-semibold border-b">
          <div className="p-2 border-r">Product No.</div>
          <div className="p-2 border-r">Product</div>
          <div className="p-2 border-r">Description</div>
          <div className="p-2 border-r">Quantity</div>
          <div className="p-2 border-r">Unit Price</div>
          <div className="p-2">Gross Price</div>
        </div>
        {option.battery && renderComponents(option.battery.components)}
        {option.solar_panel && renderComponents(option.solar_panel.components)}
        {option.inverter && renderComponents(option.inverter.components)}
        {option.other_components.length > 0 && renderComponents(option.other_components)}
      </div>
      <div className="flex flex-col mb-1">
        <span className="font-bold">Explanation:</span>
        <span className="italic">{option.explanation}</span>
      </div>
      <div className="flex justify-between mb-2">
        <span className="font-bold">Subtotal:</span>
        <span>{option.subtotal.toLocaleString()}</span>
      </div>
      <div className="flex justify-between mb-2">
        <span className="font-bold">VAT:</span>
        <span>{option.vat.toLocaleString()}</span>
      </div>
      <div className="flex justify-between mb-2">
        <span className="font-bold">Grand Total:</span>
        <span>{option.grand_total.toLocaleString()}</span>
      </div>
    </div>
  );

  return (
    <div className="p-8 max-w-[210mm] mx-auto bg-white shadow-md">
      <div className="flex justify-between mb-12">
        <img src="/dayliffquote.png" alt="Company Logo" className="w-64 h-auto" />
        <div className="text-right">
          <h1 className="text-3xl font-bold">Proposal Quotation</h1>
          <p>Davis and ShirtLiff</p>
          <p>41762-00100, Nairobi, Kenya</p>
          <p>sales@dayliff.com</p>
          <p>Phone: +254 712 345 678</p>
        </div>
      </div>

      {initialItems ? renderItems(initialItems) : <p>No items available.</p>}

      {options.map((option, index) => renderOption(option, index))}

      <div className="text-center mt-12">
        <h3 className="text-lg font-semibold">Location:</h3>
        <p>{initialLocation || "No location available."}</p>
      </div>
    </div>
  );
};

export default InvoiceTemplate;
