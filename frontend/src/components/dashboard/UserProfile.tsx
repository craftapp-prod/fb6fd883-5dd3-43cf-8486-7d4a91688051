"use client";

import { FiUser, FiMail, FiCalendar, FiShield } from "react-icons/fi";
import { useAuth } from "@/hooks/useAuth";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

const UserProfile = () => {
  const { user } = useAuth();

  const createdAt = new Date();

  if (!user) {
    return (
      <div className="bg-white shadow rounded-lg p-8">
        <div className="text-center">
          <p className="text-gray-500">Loading profile information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-8 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
            <FiUser className="h-8 w-8 text-primary-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {user.email.split("@")[0]}
            </h2>
            <p className="text-sm text-gray-500">User #{user.id}</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Account Information
        </h3>

        <div className="space-y-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-1">
              <FiMail className="h-5 w-5 text-gray-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Email Address</p>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex-shrink-0 mt-1">
              <FiCalendar className="h-5 w-5 text-gray-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Member Since</p>
              <p className="text-sm text-gray-500">{formatDate(createdAt)}</p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex-shrink-0 mt-1">
              <FiShield className="h-5 w-5 text-gray-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                Account Status
              </p>
              <div className="mt-1 flex items-center">
                {user.is_active ? (
                  <>
                    <span className="flex-shrink-0 h-2 w-2 rounded-full bg-green-500" />
                    <span className="ml-2 text-sm text-green-600">Active</span>
                  </>
                ) : (
                  <>
                    <span className="flex-shrink-0 h-2 w-2 rounded-full bg-yellow-500" />
                    <span className="ml-2 text-sm text-yellow-600">
                      Pending Activation
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-end">
          <Link
            className="text-sm bg-primary-100 text-primary-700 px-4 py-2 rounded-md hover:bg-primary-200 transition"
            href="/dashboard/edit-profile"
          >
            Edit Profile
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
