// This file defines the root layout of the application.
// It includes the main HTML structure and the persistent sidebar navigation.
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Load the 'Inter' font for a clean, modern look.
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "HRMS Dashboard",
  description: "Human Resource Management System",
};

// A simple component for the navigation icons.
// In a real app, you might use an icon library like lucide-react.
const NavIcon = ({ icon }: { icon: string }) => (
  <span className="text-2xl">{icon}</span>
);

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex h-screen bg-gray-100">
          {/* Sidebar Navigation */}
          <aside className="w-64 flex-shrink-0 bg-white border-r border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-800">HRMS</h1>
              <p className="text-sm text-gray-500">Main Menu</p>
            </div>
            <nav className="mt-6">
              {/* Active Navigation Link */}
              <a
                href="#"
                className="flex items-center px-6 py-3 text-white bg-blue-600"
              >
                <NavIcon icon="👥" />
                <span className="ml-4 font-semibold">HR Module</span>
              </a>
              {/* Inactive Navigation Links */}
              <a
                href="#"
                className="flex items-center px-6 py-3 text-gray-600 hover:bg-gray-100"
              >
                <NavIcon icon="🧾" />
                <span className="ml-4">Accounting</span>
              </a>
              <a
                href="#"
                className="flex items-center px-6 py-3 text-gray-600 hover:bg-gray-100"
              >
                <NavIcon icon="📦" />
                <span className="ml-4">Inventory</span>
              </a>
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

