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
  { name: "Reports", href: "/reports", icon: FiBarChart2 }];


  return (
    <header className="bg-white shadow-sm sticky top-0 z-10" data-path="frontend/src/components/layout/Header.tsx" data-page="frontend/src/app/page.tsx" id="el_8836a104">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" data-path="frontend/src/components/layout/Header.tsx" data-page="frontend/src/app/page.tsx" id="el_45715002">
        <div className="flex justify-between h-16 items-center" data-path="frontend/src/components/layout/Header.tsx" data-page="frontend/src/app/page.tsx" id="el_24ef0402">
          <div className="flex-shrink-0 flex items-center" data-path="frontend/src/components/layout/Header.tsx" data-page="frontend/src/app/page.tsx" id="el_e994adc1">
            <div className="flex items-center space-x-3" data-path="frontend/src/components/layout/Header.tsx" data-page="frontend/src/app/page.tsx" id="el_4b239867">
              <Image
                src={`${API_URL}/assets/default/craftapp-logo.svg`}
                alt="EduAdmin Logo"
                width={32}
                height={32}
                className="h-8 w-8"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }} data-path="frontend/src/components/layout/Header.tsx" data-page="frontend/src/app/page.tsx" id="el_2813205b" />

              <Link
                href="/"
                className="text-xl font-bold text-primary-600 hover:text-primary-500 transition" data-path="frontend/src/components/layout/Header.tsx" data-page="frontend/src/app/page.tsx" id="el_13f9bb64">

                EduAdmin
              </Link>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-1" data-path="frontend/src/components/layout/Header.tsx" data-page="frontend/src/app/page.tsx" id="el_7b56cb10">
            {navigationItems.map((item) =>
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition" data-path="frontend/src/components/layout/Header.tsx" data-page="frontend/src/app/page.tsx">

                <item.icon className="mr-1" data-path="frontend/src/components/layout/Header.tsx" data-page="frontend/src/app/page.tsx" />
                {item.name}
              </Link>
            )}
          </nav>

          <div className="flex items-center space-x-4" data-path="frontend/src/components/layout/Header.tsx" data-page="frontend/src/app/page.tsx" id="el_60b09d91">
            {isAuthenticated ?
            <>
                <div className="flex items-center" data-path="frontend/src/components/layout/Header.tsx" data-page="frontend/src/app/page.tsx" id="el_eada4b3a">
                  <FiUser className="mr-1 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700" data-path="frontend/src/components/layout/Header.tsx" data-page="frontend/src/app/page.tsx" id="el_7f144710">
                    {user?.name || "User"}
                  </span>
                </div>
                <button
                onClick={logout}
                className="flex items-center text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition" data-path="frontend/src/components/layout/Header.tsx" data-page="frontend/src/app/page.tsx" id="el_0d8758ed">

                  <FiLogOut className="mr-1" />
                  Logout
                </button>
              </> :

            <>
                <Link
                href="/login"
                className="flex items-center text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition" data-path="frontend/src/components/layout/Header.tsx" data-page="frontend/src/app/page.tsx" id="el_78b39659">

                  <FiLogIn className="mr-1" />
                  Login
                </Link>
                <Link
                href="/register"
                className="flex items-center bg-primary-600 text-white hover:bg-primary-700 px-4 py-2 rounded-md text-sm font-medium transition" data-path="frontend/src/components/layout/Header.tsx" data-page="frontend/src/app/page.tsx" id="el_50f15462">

                  <FiUserPlus className="mr-1" />
                  Register
                </Link>
              </>
            }
          </div>
        </div>
      </div>
    </header>);

};

export default Header;