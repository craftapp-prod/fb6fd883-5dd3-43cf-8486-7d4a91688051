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
  { name: "Contact", href: "/contact" }];


  const resources = [
  { name: "Student Portal", href: "/student-portal" },
  { name: "Parent Portal", href: "/parent-portal" },
  { name: "Teacher Resources", href: "/teacher-resources" },
  { name: "School Calendar", href: "/calendar" },
  { name: "Documents", href: "/documents" }];


  const contactInfo = [
  { icon: FiMapPin, text: "123 Education Lane, Learning City, EC 12345" },
  { icon: FiPhone, text: "(123) 456-7890" },
  { icon: FiMail, text: "info@eduadmin.com" }];


  return (
    <footer className="bg-gray-100 border-t border-gray-200" data-path="frontend/src/components/layout/Footer.tsx" data-page="frontend/src/app/page.tsx" id="el_97f9a322">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" data-path="frontend/src/components/layout/Footer.tsx" data-page="frontend/src/app/page.tsx" id="el_0bd75b8e">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8" data-path="frontend/src/components/layout/Footer.tsx" data-page="frontend/src/app/page.tsx" id="el_5b096ef9">
          <div className="space-y-4" data-path="frontend/src/components/layout/Footer.tsx" data-page="frontend/src/app/page.tsx" id="el_7b096a2f">
            <h3 className="text-lg font-semibold text-gray-900" data-path="frontend/src/components/layout/Footer.tsx" data-page="frontend/src/app/page.tsx" id="el_5e98d1c3">EduAdmin</h3>
            <p className="text-sm text-gray-600" data-path="frontend/src/components/layout/Footer.tsx" data-page="frontend/src/app/page.tsx" id="el_7bbbf35b">
              Comprehensive school management system designed to streamline administrative tasks and enhance communication in educational institutions.
            </p>
            <div className="flex space-x-4" data-path="frontend/src/components/layout/Footer.tsx" data-page="frontend/src/app/page.tsx" id="el_41bda2fe">
              <a href="https://facebook.com" className="text-gray-500 hover:text-primary-600 transition" data-path="frontend/src/components/layout/Footer.tsx" data-page="frontend/src/app/page.tsx" id="el_7679a578">
                <FiFacebook className="h-5 w-5" />
              </a>
              <a href="https://twitter.com" className="text-gray-500 hover:text-primary-600 transition" data-path="frontend/src/components/layout/Footer.tsx" data-page="frontend/src/app/page.tsx" id="el_19686db7">
                <FiTwitter className="h-5 w-5" />
              </a>
              <a href="https://instagram.com" className="text-gray-500 hover:text-primary-600 transition" data-path="frontend/src/components/layout/Footer.tsx" data-page="frontend/src/app/page.tsx" id="el_b7d3e541">
                <FiInstagram className="h-5 w-5" />
              </a>
              <a href="https://linkedin.com" className="text-gray-500 hover:text-primary-600 transition" data-path="frontend/src/components/layout/Footer.tsx" data-page="frontend/src/app/page.tsx" id="el_a2bf0d34">
                <FiLinkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div data-path="frontend/src/components/layout/Footer.tsx" data-page="frontend/src/app/page.tsx" id="el_7ff03ce5">
            <h4 className="text-lg font-semibold text-gray-900 mb-4" data-path="frontend/src/components/layout/Footer.tsx" data-page="frontend/src/app/page.tsx" id="el_cce6a159">Quick Links</h4>
            <ul className="space-y-2" data-path="frontend/src/components/layout/Footer.tsx" data-page="frontend/src/app/page.tsx" id="el_4e56dec5">
              {quickLinks.map((link) =>
              <li key={link.name} data-path="frontend/src/components/layout/Footer.tsx" data-page="frontend/src/app/page.tsx">
                  <Link
                  href={link.href}
                  className="text-sm text-gray-600 hover:text-primary-600 transition" data-path="frontend/src/components/layout/Footer.tsx" data-page="frontend/src/app/page.tsx">

                    {link.name}
                  </Link>
                </li>
              )}
            </ul>
          </div>

          <div data-path="frontend/src/components/layout/Footer.tsx" data-page="frontend/src/app/page.tsx" id="el_97fd7cff">
            <h4 className="text-lg font-semibold text-gray-900 mb-4" data-path="frontend/src/components/layout/Footer.tsx" data-page="frontend/src/app/page.tsx" id="el_d151c546">Resources</h4>
            <ul className="space-y-2" data-path="frontend/src/components/layout/Footer.tsx" data-page="frontend/src/app/page.tsx" id="el_7aa4ac78">
              {resources.map((resource) =>
              <li key={resource.name} data-path="frontend/src/components/layout/Footer.tsx" data-page="frontend/src/app/page.tsx">
                  <Link
                  href={resource.href}
                  className="text-sm text-gray-600 hover:text-primary-600 transition" data-path="frontend/src/components/layout/Footer.tsx" data-page="frontend/src/app/page.tsx">

                    {resource.name}
                  </Link>
                </li>
              )}
            </ul>
          </div>

          <div data-path="frontend/src/components/layout/Footer.tsx" data-page="frontend/src/app/page.tsx" id="el_5bf748d0">
            <h4 className="text-lg font-semibold text-gray-900 mb-4" data-path="frontend/src/components/layout/Footer.tsx" data-page="frontend/src/app/page.tsx" id="el_42a11f52">Contact Us</h4>
            <ul className="space-y-2" data-path="frontend/src/components/layout/Footer.tsx" data-page="frontend/src/app/page.tsx" id="el_747c349e">
              {contactInfo.map((info, index) =>
              <li key={index} className="flex items-center" data-path="frontend/src/components/layout/Footer.tsx" data-page="frontend/src/app/page.tsx">
                  <info.icon className="mr-2 text-gray-500" data-path="frontend/src/components/layout/Footer.tsx" data-page="frontend/src/app/page.tsx" />
                  <span className="text-sm text-gray-600" data-path="frontend/src/components/layout/Footer.tsx" data-page="frontend/src/app/page.tsx">{info.text}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-12 pt-8 text-center" data-path="frontend/src/components/layout/Footer.tsx" data-page="frontend/src/app/page.tsx" id="el_b355ad86">
          <p className="text-sm text-gray-500" data-path="frontend/src/components/layout/Footer.tsx" data-page="frontend/src/app/page.tsx" id="el_0ea2f61a">
            &copy; {currentYear} EduAdmin. All rights reserved.
          </p>
          <div className="mt-4 flex justify-center space-x-6" data-path="frontend/src/components/layout/Footer.tsx" data-page="frontend/src/app/page.tsx" id="el_c6ca8eab">
            <Link
              href="/privacy-policy"
              className="text-sm text-gray-500 hover:text-primary-600 transition" data-path="frontend/src/components/layout/Footer.tsx" data-page="frontend/src/app/page.tsx" id="el_45291162">

              Privacy Policy
            </Link>
            <Link
              href="/terms-of-service"
              className="text-sm text-gray-500 hover:text-primary-600 transition" data-path="frontend/src/components/layout/Footer.tsx" data-page="frontend/src/app/page.tsx" id="el_d5fd5753">

              Terms of Service
            </Link>
            <Link
              href="/sitemap"
              className="text-sm text-gray-500 hover:text-primary-600 transition" data-path="frontend/src/components/layout/Footer.tsx" data-page="frontend/src/app/page.tsx" id="el_75e64641">

              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>);

};

export default Footer;