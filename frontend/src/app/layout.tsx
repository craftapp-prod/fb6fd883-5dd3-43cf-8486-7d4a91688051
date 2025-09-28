import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/hooks/useAuth";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { API_URL } from "@/utils/env";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EduAdmin | Comprehensive School Management System",
  description: "EduAdmin is a comprehensive school management system designed to streamline administrative tasks, enhance communication, and improve overall efficiency in educational institutions.",
  icons: {
    icon: `${API_URL}/assets/default/favicon.ico`,
    shortcut: `${API_URL}/assets/default/favicon.ico`
  }
};

export default function RootLayout({
  children


}: {children: React.ReactNode;}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} flex flex-col min-h-screen bg-gray-50`}>

        <AuthProvider>
          <Header />
          <main className="flex-grow py-8" data-path="frontend/src/app/layout.tsx" id="el_6b38b523">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" data-path="frontend/src/app/layout.tsx" id="el_776c0265">
              {children}
            </div>
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>);

}