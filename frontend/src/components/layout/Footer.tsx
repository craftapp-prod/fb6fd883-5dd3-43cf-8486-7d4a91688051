"use client";

import Link from "next/link";
import { FiGithub, FiMail, FiFacebook, FiTwitter, FiInstagram, FiLinkedin, FiPhone, FiMapPin } from "react-icons/fi";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Courses", href: "/courses" },
    { name: "Staff", href: "/staff" },
    { name: "Contact", href: "/contact" },
  ];

  const resources = [
    { name: "Student Portal", href: "/student-portal" },
    { name: "Parent Portal", href: "/parent-portal" },
    { name: "Teacher Resources", href: "/teacher-resources" },
    { name: "School Calendar", href: "/calendar" },
    { name: "Documents", href: "/documents" },
  ];

  const contactInfo = [
    { icon: FiMapPin, text: "123 Education Lane, Learning City, EC 12345" },
    { icon: FiPhone, text: "(123) 456-7890" },
    { icon: FiMail, text: "info@eduadmin.com" },
  ];

  return (
    <footer className="bg-gray-100 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">EduAdmin</h3>
            <p className="text-sm text-gray-600">
              Comprehensive school management system designed to streamline administrative tasks and enhance communication in educational institutions.
            </p>
            <div className="flex space-x-4">
              <a href="https://facebook.com" className="text-gray-500 hover:text-primary-600 transition">
                <FiFacebook className="h-5 w-5" />
              </a>
              <a href="https://twitter.com" className="text-gray-500 hover:text-primary-600 transition">
                <FiTwitter className="h-5 w-5" />
              </a>
              <a href="https://instagram.com" className="text-gray-500 hover:text-primary-600 transition">
                <FiInstagram className="h-5 w-5" />
              </a>
              <a href="https://linkedin.com" className="text-gray-500 hover:text-primary-600 transition">
                <FiLinkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-primary-600 transition"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Resources</h4>
            <ul className="space-y-2">
              {resources.map((resource) => (
                <li key={resource.name}>
                  <Link
                    href={resource.href}
                    className="text-sm text-gray-600 hover:text-primary-600 transition"
                  >
                    {resource.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Contact Us</h4>
            <ul className="space-y-2">
              {contactInfo.map((info, index) => (
                <li key={index} className="flex items-center">
                  <info.icon className="mr-2 text-gray-500" />
                  <span className="text-sm text-gray-600">{info.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-12 pt-8 text-center">
          <p className="text-sm text-gray-500">
            &copy; {currentYear} EduAdmin. All rights reserved.
          </p>
          <div className="mt-4 flex justify-center space-x-6">
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
            <Link
              href="/sitemap"
              className="text-sm text-gray-500 hover:text-primary-600 transition"
            >
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;