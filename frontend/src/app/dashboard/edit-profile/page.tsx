"use client";

import EditProfileForm from "@/components/dashboard/EditProfileForm";

export default function EditProfilePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h1>
      <EditProfileForm />
    </div>
  );
}
