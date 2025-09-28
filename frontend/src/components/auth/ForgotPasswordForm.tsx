"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiMail, FiLoader, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import { api } from "@/lib/api";
import { isValidEmail } from "@/lib/utils";

interface ForgotPasswordData {
  email: string;
}

const ForgotPasswordForm = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<ForgotPasswordData>({
    email: "",
  });

  const [formErrors, setFormErrors] = useState({
    email: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validateForm = (): boolean => {
    let valid = true;
    const errors = {
      email: "",
    };

    if (!formData.email) {
      errors.email = "Email is required";
      valid = false;
    } else if (!isValidEmail(formData.email)) {
      errors.email = "Please enter a valid email address";
      valid = false;
    }

    setFormErrors(errors);
    return valid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.forgotPassword(formData);

      if (response.data) {
        setSuccess(true);
        setTimeout(() => {
          router.push(
            `/reset-password?email=${encodeURIComponent(formData.email)}`
          );
        }, 2000);
      } else {
        setError(response.error || "Failed to process your request");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <FiCheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <h1 className="mt-3 text-xl font-medium text-gray-900">
            Check your email
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            If your email is registered with us, we've sent a password reset
            code.
          </p>
          <p className="mt-2 text-sm text-gray-600">
            Redirecting to reset password page...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Forgot password?</h1>
        <p className="mt-2 text-sm text-gray-600">
          Enter your email and we'll send you a reset code
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-md flex items-center">
          <FiAlertCircle className="mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiMail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
              placeholder="you@example.com"
            />
          </div>
          {formErrors.email && (
            <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
          )}
        </div>

        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition disabled:opacity-75"
          >
            {isLoading ? (
              <>
                <FiLoader className="animate-spin mr-2" />
                Sending...
              </>
            ) : (
              "Send reset code"
            )}
          </button>
        </div>
      </form>

      <div className="text-center mt-4">
        <p className="text-sm text-gray-600">
          Remembered your password?{" "}
          <Link
            href="/login"
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
