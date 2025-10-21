"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home,
  Briefcase,
  Award,
  Mail,
  Github,
  Linkedin,
  Instagram,
  Menu,
  X,
  Sparkles,
  Music,
} from "lucide-react";

export default function ModernNavbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Memoize static arrays untuk avoid re-create tiap render
  const navItems = useMemo(
    () => [
      { href: "/", label: "Home", icon: Home },
      { href: "/projects", label: "Projects", icon: Briefcase },
      { href: "/certificates", label: "Certificates", icon: Award },
      { href: "/contact", label: "Contact", icon: Mail },
      { href: "/playlist", label: "Playlist", icon: Music },
    ],
    []
  );

  const socialLinks = useMemo(
    () => [
      { href: "https://github.com/langpram", icon: Github, label: "GitHub" },
      {
        href: "https://www.linkedin.com/in/bambang-lang-prihambodo-b4b697313",
        icon: Linkedin,
        label: "LinkedIn",
      },
      {
        href: "https://www.instagram.com/langpram_",
        icon: Instagram,
        label: "Instagram",
      },
    ],
    []
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-full w-72 bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 border-r border-gray-800/50 backdrop-blur-xl flex-col z-50">
        {/* Simplified Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/8 rounded-full blur-3xl" />
        </div>

        <div className="relative p-6 flex flex-col h-full">
          {/* Profile Section */}
          <div className="mb-8">
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden mb-4 group cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 opacity-75 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute inset-[2px] rounded-[14px] overflow-hidden bg-gray-900">
                <Image
                  src="/assets/pfp.jpg"
                  alt="Profile"
                  width={80}
                  height={80}
                  className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                  priority
                />
              </div>
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full border-2 border-gray-900" />
            </div>

            <div className="space-y-1">
              <h1 className="text-white text-xl font-black bg-gradient-to-r from-white via-blue-200 to-purple-300 bg-clip-text text-transparent">
                Bambang Lang
              </h1>
              <div className="flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-yellow-400" />
                <p className="text-xs text-gray-400 font-semibold">
                  Informatics • Network • Cloud
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-2 flex-grow">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative py-3.5 px-4 rounded-xl text-sm font-bold transition-all duration-300 flex items-center gap-3 group overflow-hidden ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30"
                      : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                  }`}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600" />
                  )}
                  <div className="relative flex items-center gap-3 z-10">
                    <Icon
                      className={`w-5 h-5 ${
                        isActive ? "" : "group-hover:scale-110"
                      } transition-transform duration-200`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {!isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 to-purple-600/0 group-hover:from-blue-600/10 group-hover:to-purple-600/10 transition-opacity duration-300" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Social Links */}
          <div className="mb-4">
            <p className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">
              Connect
            </p>
            <div className="flex gap-2">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl bg-gray-800/50 hover:bg-gradient-to-br hover:from-blue-600 hover:to-purple-600 border border-gray-700/50 hover:border-transparent flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200 hover:scale-110"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-gray-800/50">
            <p className="text-xs font-bold text-gray-500">
              © {new Date().getFullYear()}{" "}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                langpram
              </span>
            </p>
            <p className="text-[10px] text-gray-600 mt-1">Built with 💜 & ☕</p>
          </div>
        </div>
      </aside>

      {/* Mobile Header - UPDATED */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-gray-900/95 backdrop-blur-xl border-b border-gray-800/50 z-50">
        <div className="h-full px-4 flex items-center justify-between">
          {/* Toggle Button - PINDAH KE KIRI */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-10 h-10 rounded-xl bg-gray-800/50 hover:bg-gradient-to-br hover:from-blue-600 hover:to-purple-600 border border-gray-700/50 hover:border-transparent flex items-center justify-center text-gray-300 hover:text-white transition-all duration-200 active:scale-95"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Title - DI TENGAH */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <h1 className="text-white text-sm font-black bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              Bambang Lang
            </h1>
            <p className="text-[10px] text-gray-500 font-semibold text-center">
              Portfolio
            </p>
          </div>

          {/* Spacer - BIAR LAYOUT BALANCE & GA NABRAK GEMBOK */}
          <div className="w-10"></div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={() => setIsOpen(false)}
            style={{ animation: "fadeIn 0.2s ease-out" }}
          />
          <div
            className="lg:hidden fixed top-16 right-0 bottom-0 w-72 bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 border-l border-gray-800/50 z-50"
            style={{ animation: "slideIn 0.3s ease-out" }}
          >
            <div className="h-full p-6 flex flex-col overflow-y-auto">
              {/* Profile Info */}
              <div className="mb-6 pb-6 border-b border-gray-800/50">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                  <p className="text-xs text-gray-400 font-semibold">
                    Informatics • Network • Cloud
                  </p>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex flex-col gap-2 mb-6">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`relative py-3.5 px-4 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-3 active:scale-95 ${
                        isActive
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/30"
                          : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>

              {/* Social Links */}
              <div className="mt-auto">
                <p className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">
                  Connect
                </p>
                <div className="flex gap-2">
                  {socialLinks.map((social) => {
                    const Icon = social.icon;
                    return (
                      <a
                        key={social.label}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-xl bg-gray-800/50 hover:bg-gradient-to-br hover:from-blue-600 hover:to-purple-600 border border-gray-700/50 hover:border-transparent flex items-center justify-center text-gray-400 hover:text-white transition-all duration-200 active:scale-95"
                      >
                        <Icon className="w-4 h-4" />
                      </a>
                    );
                  })}
                </div>

                {/* Footer */}
                <div className="mt-6 pt-4 border-t border-gray-800/50">
                  <p className="text-xs font-bold text-gray-500">
                    © {new Date().getFullYear()}{" "}
                    <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      langpram
                    </span>
                  </p>
                  <p className="text-[10px] text-gray-600 mt-1">
                    Built with heartbreak and ambition
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Inline CSS untuk animasi mobile menu */}
          <style jsx>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes slideIn {
              from { transform: translateX(100%); }
              to { transform: translateX(0); }
            }
          `}</style>
        </>
      )}
    </>
  );
}