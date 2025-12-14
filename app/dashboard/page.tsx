"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import AuthGuard from "../components/AuthGuard";
import { getUserFromToken } from "../utils/auth";

type Sweet = {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
};

export default function Dashboard() {
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [priceRange, setPriceRange] = useState<number>(500);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;
      const user = getUserFromToken();
      const isAdmin = user?.role === "admin";

  // 🔹 Fetch all sweets
  const fetchSweets = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/sweets", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSweets(res.data.sweets);
    } catch (error) {
      console.error("Failed to fetch sweets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSweets();
  }, []);

  // 🔹 Backend search using range
  const handleSearch = async () => {
    try {
      const res = await axios.get(
        "http://localhost:3000/api/sweets/search",
        {
          params: {
            name,
            category,
            priceLow: 0,
            priceHigh: priceRange,
          },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSweets(res.data.sweets);
    } catch (error) {
      console.error("Search failed");
    }
  };

  // 🔹 Purchase sweet (FIXED)
  const handlePurchase = async (id: number) => {
    try {
      const res = await axios.post(
        `http://localhost:3000/api/sweets/${id}/purchase`,
        { quantity: 1 },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Sync quantity from backend response (best practice)
      setSweets((prev) =>
        prev.map((sweet) =>
          sweet.id === id ? res.data.sweet : sweet
        )
      );
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
          "Unable to purchase sweet"
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-800">
        Loading sweets...
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-100 px-4 py-6">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Sweet Shop Dashboard
        </h1>

        {isAdmin && (
    <a
      href="/admin"
      className="text-indigo-600 font-semibold hover:underline"
    >
      Admin Panel
    </a>
  )}

        {/* 🔍 SEARCH + FILTER */}
        <div className="max-w-4xl mx-auto mb-8 bg-white p-4 rounded-xl shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input
              type="text"
              placeholder="Search by sweet name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white placeholder-gray-400"
            />

            <input
              type="text"
              placeholder="Search by category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white placeholder-gray-400"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Price: ₹{priceRange}
            </label>
            <input
              type="range"
              min={0}
              max={1000}
              step={50}
              value={priceRange}
              onChange={(e) =>
                setPriceRange(Number(e.target.value))
              }
              className="w-full accent-indigo-600"
            />
          </div>

          <div className="text-center">
            <button
              onClick={handleSearch}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-semibold mr-3"
            >
              Apply Filters
            </button>

            <button
              onClick={() => {
                setName("");
                setCategory("");
                setPriceRange(500);
                fetchSweets();
              }}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 font-semibold"
            >
              Reset
            </button>
          </div>
        </div>

        {/* 🧁 SWEETS GRID */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {sweets.map((sweet) => (
            <div
              key={sweet.id}
              className="bg-white rounded-xl shadow-md p-4"
            >
              <h2 className="text-lg font-semibold text-gray-800 mb-1">
                {sweet.name}
              </h2>

              <p className="text-sm text-gray-700">
                Category:{" "}
                <span className="font-medium">
                  {sweet.category}
                </span>
              </p>

              <p className="text-sm font-medium text-gray-900">
                Price: ₹{sweet.price}
              </p>

              <p
                className={`text-sm font-semibold ${
                  sweet.quantity > 0
                    ? "text-green-600"
                    : "text-red-500"
                }`}
              >
                Stock: {sweet.quantity}
              </p>

              <button
                onClick={() => handlePurchase(sweet.id)}
                disabled={sweet.quantity === 0}
                className={`mt-4 w-full py-2 rounded-lg text-white font-semibold transition ${
                  sweet.quantity === 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-indigo-600 hover:bg-indigo-700"
                }`}
              >
                Purchase
              </button>
            </div>
          ))}
        </div>
      </div>
    </AuthGuard>
  );
}