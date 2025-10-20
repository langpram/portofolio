"use client";
import { useState, useEffect, useRef } from 'react';
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function HeroSection() {
  const [isMobile, setIsMobile] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const photoRef = useRef<HTMLDivElement>(null);

  // Deteksi mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Mouse tracking HANYA di desktop
  useEffect(() => {
    if (isMobile) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (photoRef.current) {
        const rect = photoRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        setMousePosition({
          x: (e.clientX - centerX) / 30,
          y: (e.clientY - centerY) / 30
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isMobile]);

  return (
    <section
      id="home"
      className="relative flex items-center justify-center min-h-screen bg-gray-900 overflow-hidden rounded-3xl mx-2 sm:mx-4 mt-2 sm:mt-4 mb-2 sm:mb-4 py-8 sm:py-12 md:py-16 px-4 sm:px-6 md:px-8"
    >
      {/* Simplified Background - Hapus animasi di mobile */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-850 to-gray-900 rounded-3xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(168,85,247,0.15),transparent_50%)] rounded-3xl" />
        
        {/* Floating particles - HANYA di desktop */}
        {!isMobile && (
          <div className="absolute inset-0 overflow-hidden rounded-3xl">
            <motion.div
              className="absolute w-2 h-2 bg-purple-500/30 rounded-full"
              animate={{ x: [0, 100, 0], y: [0, -100, 0], opacity: [0, 1, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              style={{ top: "20%", left: "10%" }}
            />
            <motion.div
              className="absolute w-3 h-3 bg-pink-500/20 rounded-full"
              animate={{ x: [0, -80, 0], y: [0, 120, 0], opacity: [0, 1, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              style={{ top: "60%", right: "15%" }}
            />
            <motion.div
              className="absolute w-2 h-2 bg-blue-500/25 rounded-full"
              animate={{ x: [0, -60, 0], y: [0, -80, 0], opacity: [0, 1, 0] }}
              transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 4 }}
              style={{ bottom: "30%", left: "20%" }}
            />
          </div>
        )}
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-5xl flex flex-col md:flex-row items-center gap-8 md:gap-12">
        
        {/* Left Side - Photo (3D HANYA di desktop) */}
        <motion.div
          ref={photoRef}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="flex-shrink-0 relative"
          // 3D transform HANYA di desktop
          style={!isMobile ? {
            transform: `perspective(1000px) rotateX(${mousePosition.y * -0.5}deg) rotateY(${mousePosition.x * 0.5}deg)`,
            transition: 'transform 0.1s ease-out'
          } : {}}
        >
          <div className="relative w-56 h-72 sm:w-64 sm:h-80 md:w-72 md:h-96 group">
            {/* Simplified Border - Hapus blur di mobile */}
            <div className={`absolute -inset-0.5 bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 rounded-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-500 ${isMobile ? '' : 'blur-sm'}`} />
            
            {/* Glow - Hapus di mobile */}
            {!isMobile && (
              <div className="absolute -inset-4 bg-gradient-to-br from-blue-500 via-cyan-500 to-purple-500 opacity-20 blur-2xl group-hover:opacity-30 transition-opacity duration-500" />
            )}
            
            {/* Photo Container */}
            <div className="relative w-full h-full rounded-2xl overflow-hidden">
              <Image
                src="/assets/pro.png"
                alt="Bambang Lang Prihambodo"
                fill
                className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                priority
                // Optimasi image untuk mobile
                sizes="(max-width: 768px) 224px, 288px"
              />
              <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
            </div>

            {/* Floating Cards - Simplified di mobile */}
            <div
              className="absolute -bottom-3 -left-3 bg-gray-900/95 backdrop-blur-xl border border-cyan-500/50 rounded-xl px-3 py-2 shadow-2xl shadow-cyan-500/20"
              style={!isMobile ? {
                transform: `translate(${mousePosition.x * -1}px, ${mousePosition.y * -1}px)`,
                transition: 'transform 0.1s ease-out'
              } : {}}
            >
              <div className="text-cyan-400 text-xl font-bold">GOAT AURA</div>
              <div className="text-gray-400 text-xs">in Progress</div>
            </div>

            <div
              className="absolute -top-3 -right-3 bg-gray-900/95 backdrop-blur-xl border border-purple-500/50 rounded-xl px-3 py-2 shadow-2xl shadow-purple-500/20"
              style={!isMobile ? {
                transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
                transition: 'transform 0.1s ease-out'
              } : {}}
            >
              <div className="text-purple-400 text-xl font-bold">1+</div>
              <div className="text-gray-400 text-xs">Years</div>
            </div>

            {/* Online Badge - Simplified animation */}
            <motion.div
              className="absolute top-3 left-3 bg-gray-900/95 backdrop-blur-xl border border-green-500/50 rounded-full px-3 py-1.5 shadow-lg flex items-center gap-2"
              animate={!isMobile ? { y: [0, -5, 0] } : {}}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-green-400 text-xs font-medium">Available</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Right Side - Content */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col gap-4 sm:gap-5 md:gap-6 flex-1"
        >
          <div className="space-y-3 sm:space-y-4 md:space-y-5">
            <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold bg-gradient-to-r from-white via-gray-100 to-blue-200 bg-clip-text text-transparent leading-tight">
              Bambang Lang<br/>Prihambodo
            </h1>

            <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
              {[
                { label: "Informatics Student", color: "blue" },
                { label: "Network Engineer", color: "cyan" },
                { label: "Cloud Infrastructure", color: "purple" },
              ].map((role, index) => (
                <motion.span
                  key={role.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
                  className="px-2.5 py-1.5 sm:px-3 rounded-lg bg-gray-800/60 border border-gray-700/80 text-gray-300 backdrop-blur-sm hover:border-blue-500/50 hover:bg-gray-800 transition-all duration-300"
                >
                  {role.label}
                </motion.span>
              ))}
            </div>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-gray-400 text-sm sm:text-base leading-relaxed"
          >
            Passionate about programming and mastering network infrastructure & cloud engineering. 
            Building scalable solutions for modern IT infrastructure.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="flex flex-wrap gap-3"
          >
            <Link href="/projects">
              <motion.button
                className="px-5 py-2.5 sm:px-6 text-sm sm:text-base rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View Projects
              </motion.button>
            </Link>

            <Link href="/contact">
              <motion.button
                className="px-5 py-2.5 sm:px-6 text-sm sm:text-base rounded-lg bg-gray-800/80 border border-gray-700 text-white font-medium hover:bg-gray-800 hover:border-gray-600 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get in Touch
              </motion.button>
            </Link>
          </motion.div>

          {/* Social Media */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="flex gap-3"
          >
            <motion.a
              href="https://linkedin.com/in/bambang-lang-prihambodo-b4b697313"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-lg bg-[#0077B5] text-white hover:bg-[#006399] transition-all duration-300"
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              aria-label="LinkedIn"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </motion.a>

            <motion.a
              href="https://github.com/langpram"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-lg bg-[#181717] border border-gray-700 text-white hover:bg-[#24292e] hover:border-gray-600 transition-all duration-300"
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              aria-label="GitHub"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </motion.a>

            <motion.a
              href="https://instagram.com/langpram_"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-lg bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 text-white transition-all duration-300"
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Instagram"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </motion.a>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}