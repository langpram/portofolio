import type { Metadata } from "next";
import "./globals.css";
import LeftSidebar from "@/components/LeftSidebar";


export const metadata: Metadata = {
  title: "Bambang LP | Portfolio",
  description: "Portfolio website",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-950"> {/* Tambahin background */}
        <LeftSidebar />
        <div className="lg:ml-72"> {/* Pake div wrapper dulu */}
          <main className="w-full min-h-screen p-4 md:p-10">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}