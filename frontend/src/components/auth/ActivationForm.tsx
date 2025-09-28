"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiCheck, FiLoader, FiAlertCircle, FiMail } from "react-icons/fi";
import { useAuth } from "@/hooks/useAuth";
import { ActivationData } from "@/types";

interface ActivationFormProps {
  email?: string;
}

const ActivationForm = ({ email = "" }: ActivationFormProps) => {
  const router = useRouter();
  const { activate, error, isLoading } = useAuth();

  const [formData, setFormData] = useState<ActivationData>({
    email: email,
    activation_code: "",
  });

  const [formErrors, setFormErrors] = useState({
    activation_code: "",
  });

  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (email) {
      setFormData((prev) => ({ ...prev, email }));
    }
  }, [email]);

  const validateForm = (): boolean => {
    let valid = true;
    const errors = {
      activation_code: "",
    };

    if (!formData.activation_code) {
      errors.activation_code = "Activation code is required";
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

    const success = await activate(formData);

    if (success) {
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <FiCheck className="h-6 w-6 text-green-600" />
          </div>
          <h1 className="mt-3 text-xl font-medium text-gray-900">
            Account activated!
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Your account has been successfully activated.
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600">Redirecting to login page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary-100">
          <FiMail className="h-6 w-6 text-primary-600" />
        </div>
        <h1 className="mt-3 text-2xl font-bold text-gray-900">
          Activate your account
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Enter the activation code sent to your email
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
            htmlFor="activation_code"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Activation Code
          </label>
          <input
            id="activation_code"
            name="activation_code"
            type="text"
            value={formData.activation_code}
            onChange={handleChange}
            className="block w-full text-center py-3 px-4 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-lg tracking-widest"
            placeholder="XXXXXX"
            maxLength={6}
          />
          {formErrors.activation_code && (
            <p className="mt-1 text-sm text-red-600">
              {formErrors.activation_code}
            </p>
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
                Activating...
              </>
            ) : (
              "Activate Account"
            )}
          </button>
        </div>
      </form>

      <div className="text-center mt-4">
        <p className="text-sm text-gray-600">
          Didnt receive the code?{" "}
          <button
            className="font-medium text-primary-600 hover:text-primary-500"
            onClick={() =>
              alert("Resend functionality would be implemented here")
            }
          >
            Resend
          </button>
        </p>
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-600">
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

export default ActivationForm;
