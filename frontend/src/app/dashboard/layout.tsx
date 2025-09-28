"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { FiUser, FiEdit, FiLoader } from "react-icons/fi";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-16rem)]">
        <div className="flex flex-col items-center space-y-4">
          <FiLoader className="h-8 w-8 text-primary-600 animate-spin" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="mb-8 border-b border-gray-200">
          <nav className="flex space-x-8">
            <Link
              href="/dashboard"
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                pathname === "/dashboard"
                  ? "border-primary-600 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <FiUser className="mr-3 h-5 w-5" />
              Profile
            </Link>
            <Link
              href="/dashboard/edit-profile"
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                pathname === "/dashboard/edit-profile"
                  ? "border-primary-600 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <FiEdit className="mr-3 h-5 w-5" />
              Edit Profile
            </Link>
          </nav>
        </div>
        <main>{children}</main>
      </div>
    </div>
  );
}
