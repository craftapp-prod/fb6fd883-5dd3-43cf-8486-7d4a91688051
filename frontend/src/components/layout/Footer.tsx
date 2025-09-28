"use client";

import Link from "next/link";
import { FiGithub, FiMail } from "react-icons/fi";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-gray-500">
              &copy; {currentYear} Initial System. All rights reserved.
            </p>
          </div>

          <div className="flex space-x-6">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-primary-600 transition"
            >
              <span className="sr-only">GitHub</span>
              <FiGithub className="h-5 w-5" />
            </a>

            <a
              href="mailto:contact@example.com"
              className="text-gray-500 hover:text-primary-600 transition"
            >
              <span className="sr-only">Email</span>
              <FiMail className="h-5 w-5" />
            </a>
          </div>

          <div className="mt-4 md:mt-0">
            <nav className="flex space-x-4">
              <Link
                href="/privacy-policy"
                className="text-sm text-gray-500 hover:text-primary-600 transition"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms-of-service"
                className="text-sm text-gray-500 hover:text-primary-600 transition"
              >
                Terms of Service
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
