"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { FiUser, FiLogOut, FiLogIn, FiUserPlus, FiHome, FiCalendar, FiBook, FiUsers, FiFileText, FiMessageSquare, FiDollarSign, FiBarChart2 } from "react-icons/fi";
import Image from "next/image";
import { API_URL } from "@/utils/env";

const Header = () => {
  const { isAuthenticated, logout, user } = useAuth();

  const navigationItems = [
    { name: "Home", href: "/", icon: FiHome },
    { name: "Calendar", href: "/calendar", icon: FiCalendar },
    { name: "Courses", href: "/courses", icon: FiBook },
    { name: "Staff", href: "/staff", icon: FiUsers },
    { name: "Documents", href: "/documents", icon: FiFileText },
    { name: "Messages", href: "/messages", icon: FiMessageSquare },
    { name: "Finance", href: "/finance", icon: FiDollarSign },
    { name: "Reports", href: "/reports", icon: FiBarChart2 },
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <div className="flex items-center space-x-3">
              <Image
                src={`${API_URL}/assets/default/craftapp-logo.svg`}
                alt="EduAdmin Logo"
                width={32}
                height={32}
                className="h-8 w-8"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              <Link
                href="/"
                className="text-xl font-bold text-primary-600 hover:text-primary-500 transition"
              >
                EduAdmin
              </Link>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition"
              >
                <item.icon className="mr-1" />
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <div className="flex items-center">
                  <FiUser className="mr-1 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {user?.name || "User"}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  <FiLogOut className="mr-1" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="flex items-center text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  <FiLogIn className="mr-1" />
                  Login
                </Link>
                <Link
                  href="/register"
                  className="flex items-center bg-primary-600 text-white hover:bg-primary-700 px-4 py-2 rounded-md text-sm font-medium transition"
                >
                  <FiUserPlus className="mr-1" />
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;