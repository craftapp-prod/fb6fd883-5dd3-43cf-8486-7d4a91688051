"use client";

import UserProfile from "@/components/dashboard/UserProfile";

export default function DashboardPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>
      <UserProfile />
    </div>
  );
}
