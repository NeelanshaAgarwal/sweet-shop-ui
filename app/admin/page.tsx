"use client";

import { useEffect, useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import AuthGuard from "../components/AuthGuard";

type Sweet = {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
};

export default function AdminDashboard() {
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    quantity: "",
  });

  const [restockQty, setRestockQty] = useState<{ [key: number]: string }>({});

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  // 🔹 Fetch sweets
  const fetchSweets = async () => {
    const res = await axios.get("http://localhost:3000/api/sweets", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setSweets(res.data.sweets);
  };

  useEffect(() => {
    fetchSweets();
  }, []);

  // Handle input (add/update form)
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Add / Update sweet
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        await axios.put(
          `http://localhost:3000/api/sweets/${editingId}`,
          {
            ...formData,
            price: Number(formData.price),
            quantity: Number(formData.quantity),
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        await axios.post(
          "http://localhost:3000/api/sweets",
          {
            ...formData,
            price: Number(formData.price),
            quantity: Number(formData.quantity),
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }

      setFormData({ name: "", category: "", price: "", quantity: "" });
      setEditingId(null);
      fetchSweets();
    } catch {
      alert("Action failed");
    }
  };

  // Edit sweet
  const handleEdit = (sweet: Sweet) => {
    setEditingId(sweet.id);
    setFormData({
      name: sweet.name,
      category: sweet.category,
      price: String(sweet.price),
      quantity: String(sweet.quantity),
    });
  };

  // Delete sweet (USES YOUR API)
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this sweet?")) return;

    try {
      await axios.delete(`http://localhost:3000/api/sweets/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      fetchSweets();
    } catch (error: any) {
      alert(error.response?.data?.message || "Delete failed");
    }
  };

  // Restock sweet (USES YOUR API)
  const handleRestock = async (id: number) => {
    if (!restockQty[id] || Number(restockQty[id]) <= 0) {
      alert("Enter valid quantity");
      return;
    }

    try {
      await axios.post(
        `http://localhost:3000/api/sweets/${id}/restock`,
        { quantity: restockQty[id] },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRestockQty((prev) => ({ ...prev, [id]: "" }));
      fetchSweets();
    } catch (error: any) {
      alert(error.response?.data?.message || "Restock failed");
    }
  };

  return (
    <AuthGuard>
    <div className="min-h-screen bg-gray-100 px-4 py-6">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
        Admin Sweet Management
      </h1>

      {/* ADD / UPDATE FORM */}
      <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow-md mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          {editingId ? "Update Sweet" : "Add New Sweet"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Sweet name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg text-gray-900 bg-white"
            required
          />

          <input
            type="text"
            name="category"
            placeholder="Category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg text-gray-900 bg-white"
            required
          />

          <input
            type="number"
            name="price"
            placeholder="Price"
            value={formData.price}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg text-gray-900 bg-white"
            required
          />

          <input
            type="number"
            name="quantity"
            placeholder="Initial Quantity"
            value={formData.quantity}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg text-gray-900 bg-white"
            required
          />

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 font-semibold"
          >
            {editingId ? "Update Sweet" : "Add Sweet"}
          </button>
        </form>
      </div>

      {/* SWEETS LIST */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {sweets.map((sweet) => (
          <div
            key={sweet.id}
            className="bg-white p-4 rounded-xl shadow-md"
          >
            <h3 className="text-lg font-semibold text-gray-800">
              {sweet.name}
            </h3>

            <p className="text-sm text-gray-700">
              Category: {sweet.category}
            </p>

            <p className="text-sm text-gray-900">
              Price: ₹{sweet.price}
            </p>

            <p className="text-sm font-medium text-gray-700">
              Stock: {sweet.quantity}
            </p>

            {/* RESTOCK */}
            <div className="mt-3 flex gap-2">
              <input
                type="number"
                placeholder="Restock qty"
                value={restockQty[sweet.id] || ""}
                onChange={(e) =>
                  setRestockQty({
                    ...restockQty,
                    [sweet.id]: e.target.value,
                  })
                }
                className="flex-1 px-3 py-2 border rounded-lg text-gray-900 bg-white"
              />
              <button
                onClick={() => handleRestock(sweet.id)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-semibold"
              >
                Restock
              </button>
            </div>

            {/* ACTIONS */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => handleEdit(sweet)}
                className="flex-1 bg-yellow-500 text-white py-2 rounded-lg hover:bg-yellow-600 font-semibold"
              >
                Edit
              </button>

              <button
                onClick={() => handleDelete(sweet.id)}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
    </AuthGuard>
  );
}