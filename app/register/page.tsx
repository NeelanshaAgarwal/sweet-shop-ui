"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

type FormErrors = Partial<FormData>;

export default function Register() {
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState<string>("");

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const validate = (): FormErrors => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } 
    

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    return newErrors;
  };

  

const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  const validationErrors = validate();

  if (Object.keys(validationErrors).length > 0) {
    setErrors(validationErrors);
    return;
  }

  try {
    const response = await axios.post(
      "http://localhost:3000/api/auth/register",
      {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
      }
    );

    setSuccess("Registration successful!");

    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    });
  } catch (error: any) {
    if (error.response?.data?.message) {
      setErrors({ email: error.response.data.message });
    } else {
      setErrors({ email: "Something went wrong. Please try again." });
    }
  }
};


  return (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-xl">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Create Account
      </h2>

      {success && (
        <p className="text-center text-green-600 mb-4 font-medium">
          {success}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {["firstName", "lastName", "email", "password"].map((field) => (
          <div key={field}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {field === "firstName"
                ? "First Name"
                : field === "lastName"
                ? "Last Name"
                : field.charAt(0).toUpperCase() + field.slice(1)}
            </label>

            <input
              type={field === "password" ? "password" : "text"}
              name={field}
              value={formData[field as keyof FormData]}
              onChange={handleChange}
              placeholder={`Enter ${
                field === "firstName"
                  ? "first name"
                  : field === "lastName"
                  ? "last name"
                  : field
              }`}
              className={`w-full px-4 py-2 border ${
                errors[field as keyof FormErrors]
                  ? "border-red-500"
                  : "border-gray-300"
              } text-gray-900 bg-white placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
            />

            {errors[field as keyof FormErrors] && (
              <p className="text-sm text-red-500 mt-1">
                {errors[field as keyof FormErrors]}
              </p>
            )}
          </div>
        ))}

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition font-semibold"
        >
          Register
        </button>
      </form>
    </div>
  </div>
);
}