"use client";

import React, { useState } from "react";
import { Button } from "../ui/button";
import { Plus, Check } from "lucide-react";
import { Input } from "../ui/input";

type Device = {
  name: string;
  wattage: string;
  hours: string;
  quantity: string;
};

const QuotationButton = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [form, setForm] = useState<Device>({
    name: "",
    wattage: "",
    hours: "",
    quantity: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Prevent values less than 1 for number fields
    if (["wattage", "hours", "quantity"].includes(name)) {
      if (value === "" || Number(value) < 1) {
        setForm({ ...form, [name]: "" });
        return;
      }
    }
    setForm({ ...form, [name]: value });
  };

  const addDevice = () => {
    // Ensure all fields are filled and number fields are >= 1
    if (
      form.name &&
      Number(form.wattage) >= 1 &&
      Number(form.hours) >= 1 &&
      Number(form.quantity) >= 1
    ) {
      setDevices([...devices, form]);
      setForm({ name: "", wattage: "", hours: "", quantity: "" });
    }
  };

  const removeDevice = (idx: number) => {
    setDevices(devices.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Submit logic here
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 bg-white rounded-xl shadow-lg p-8">
      {/* Step Indicator and Title */}
      <div className="flex items-center mb-6">
        <span className="bg-blue-600 text-white rounded-full px-3 py-1 mr-3 font-bold">
          02
        </span>
        <h2 className="text-blue-700 font-semibold text-lg">
          Which Devices do you have ?
        </h2>
      </div>
      {/* Inline Form */}
      <form onSubmit={handleSubmit}>
        <div className="flex gap-4 mb-2">
          <div className="flex flex-col flex-1">
        <label className="text-xs font-semibold text-blue-700 mb-1">
          Name
        </label>
        <Input
          className="border rounded px-3 py-2"
          placeholder="Enter Device Name"
          name="name"
          value={form.name}
          onChange={handleChange}
        />
          </div>
          <div className="flex flex-col flex-1">
        <label className="text-xs font-semibold text-blue-700 mb-1">
          Wattage
        </label>
        <Input
          className="border rounded px-3 py-2"
          placeholder="Enter Wattage"
          name="wattage"
          value={form.wattage}
          onChange={handleChange}
          type="number"
          min={1}
        />
          </div>
          <div className="flex flex-col flex-1">
        <label className="text-xs font-semibold text-blue-700 mb-1">
          Hours Used
        </label>
        <Input
          className="border rounded px-3 py-2"
          placeholder="Enter Hours Used"
          name="hours"
          value={form.hours}
          onChange={handleChange}
          type="number"
          min={1}
        />
          </div>
          <div className="flex flex-col flex-1">
        <label className="text-xs font-semibold text-blue-700 mb-1">
          Quantity
        </label>
        <Input
          className="border rounded px-3 py-2"
          placeholder="Enter Quantity"
          name="quantity"
          value={form.quantity}
          onChange={handleChange}
          type="number"
          min={1}
        />
          </div>
        </div>
        <div className="flex gap-4 mb-6">
          <Button
        type="button"
        onClick={addDevice}
        className="flex items-center bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 transition"
          >
        <Plus className="mr-2" size={18} /> Add Device
          </Button>
          <Button
        type="submit"
        className="flex items-center bg-black text-white px-4 py-2 rounded font-semibold hover:bg-gray-800 transition"
          >
        <Check className="mr-2" size={18} /> Submit Form
          </Button>
        </div>
      </form>
      {/* Devices Table */}
      <div>
        <h3 className="font-semibold mb-2 text-sm text-blue-700">My Devices</h3>
        <table className="w-full text-left border-t">
          <thead>
        <tr className="text-gray-500 text-xs">
          <th className="py-2">DEVICE NAME</th>
          <th>WATTAGE</th>
          <th>HOURS USED</th>
          <th>QUANTITY</th>
          <th></th>
        </tr>
          </thead>
          <tbody>
        {devices.map((d, idx) => (
          <tr key={idx} className="border-t">
            <td className="py-2">{(d as any).name}</td>
            <td>{(d as any).wattage}</td>
            <td>{(d as any).hours}</td>
            <td>{(d as any).quantity}</td>
            <td>
          <button
            className="text-red-500 hover:underline text-xs"
            onClick={() => removeDevice(idx)}
          >
            Delete
          </button>
            </td>
          </tr>
        ))}
        {devices.length === 0 && (
          <tr>
            <td colSpan={5} className="text-gray-400 py-4 text-center text-xs">
          No devices added yet.
            </td>
          </tr>
        )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QuotationButton;
