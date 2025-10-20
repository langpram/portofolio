"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import HeroSection from "@/components/HeroSection";
import { Code2, Network, Server, Wrench } from "lucide-react";

export default function BerandaPage() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <main className="min-h-screen bg-gray-950 relative overflow-hidden">
      {/* Simplified Background - Static di mobile */}
      {!isMobile && (
        <div className="fixed inset-0 pointer-events-none">
          <motion.div
            className="absolute top-20 right-20 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute bottom-20 left-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"
            animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 0.3, 0.5] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      )}

      {/* Hero Section */}
      <HeroSection />

      {/* About Me Section */}
      <section className="relative px-4 py-16 md:py-24">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-5xl font-black text-white mb-3 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              About Me
            </h2>
            <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto"></div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <div className="relative bg-gray-900/60 backdrop-blur-xl rounded-3xl p-6 md:p-10 border border-gray-800/50 shadow-xl">
              <div className="space-y-5">
                <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                  Hi there! I'm an <span className="text-cyan-400 font-semibold">Informatics student</span> at Bina Sarana Informatika University with a background in <span className="text-purple-400 font-semibold">Computer Network Engineering</span>. This gives me a unique perspective - bridging software development with network infrastructure.
                </p>
                <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                  Currently grinding as <span className="text-blue-400 font-semibold">IT Support at PT Hernadhi Jaya Abadi</span>, I've developed practical skills in troubleshooting, network setup, and IT infrastructure maintenance. My expertise extends from building and managing websites with modern frameworks and WordPress, to configuring and optimizing network systems for reliability and performance.
                </p>
                <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                  My goal? Becoming a <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent font-bold">Network Engineer or Cloud Infrastructure specialist</span> who can automate all the things and build scalable solutions that actually make sense! 🚀
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* What I Do Section */}
      <section className="relative px-4 py-16 md:py-24">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-5xl font-black text-white mb-3 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              What I Do
            </h2>
            <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto"></div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: Code2,
                title: "Web Development",
                description: "Building modern, responsive web apps with Next.js, React & TypeScript",
                gradient: "from-blue-500 to-cyan-500",
                span: "md:col-span-2"
              },
              {
                icon: Network,
                title: "Network Infrastructure",
                description: "Cisco & MikroTik routing, switching & firewall configs",
                gradient: "from-purple-500 to-pink-500",
                span: ""
              },
              {
                icon: Server,
                title: "IT Support",
                description: "Technical support & system maintenance",
                gradient: "from-orange-500 to-red-500",
                span: ""
              },
              {
                icon: Wrench,
                title: "Automation",
                description: "Workflow automation using n8n, Zapier & scripting",
                gradient: "from-green-500 to-emerald-500",
                span: "md:col-span-2"
              }
            ].map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className={`group relative ${service.span}`}
              >
                <div className="relative bg-gray-900/80 backdrop-blur-xl rounded-2xl p-5 md:p-7 border border-gray-800 hover:border-gray-700 transition-all duration-300 h-full">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${service.gradient} flex items-center justify-center mb-4 shadow-lg transition-transform duration-300 ${!isMobile ? 'group-hover:scale-110' : ''}`}>
                    <service.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-white mb-2">{service.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{service.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Skills Section - OPTIMIZED */}
      <section className="relative px-4 py-16 md:py-24">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-5xl font-black text-white mb-3 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Skills & Tech Stack
            </h2>
            <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto"></div>
          </motion.div>

          {/* Development Skills - Slower & conditional animation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-12"
          >
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3 justify-center">
              <Code2 className="w-6 h-6 text-blue-400" />
              Development & Programming
            </h3>
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-950/30 via-gray-900/50 to-purple-950/30 backdrop-blur-xl rounded-2xl p-6 md:p-10 border border-blue-500/20 shadow-xl">
              {/* Fade edges - reduced */}
              <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-gray-900 to-transparent z-10 pointer-events-none"></div>
              <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-gray-900 to-transparent z-10 pointer-events-none"></div>

              <div className={`flex gap-5 md:gap-7 ${isMobile ? 'animate-scroll-dev-mobile' : 'animate-scroll-dev'}`}>
                {[...Array(2)].map((_, setIndex) => (
                  <React.Fragment key={setIndex}>
                    {[
                      { name: "Next.js", logo: "https://cdn.simpleicons.org/nextdotjs/white", color: "from-gray-700 to-gray-900" },
                      { name: "React", logo: "https://cdn.simpleicons.org/react/61DAFB", color: "from-blue-400 to-cyan-500" },
                      { name: "TypeScript", logo: "https://cdn.simpleicons.org/typescript/3178C6", color: "from-blue-500 to-blue-700" },
                      { name: "JavaScript", logo: "https://cdn.simpleicons.org/javascript/F7DF1E", color: "from-yellow-400 to-yellow-600" },
                      { name: "Python", logo: "https://cdn.simpleicons.org/python/3776AB", color: "from-blue-400 to-yellow-500" },
                      { name: "Node.js", logo: "https://cdn.simpleicons.org/nodedotjs/339933", color: "from-green-500 to-green-700" },
                      { name: "Tailwind", logo: "https://cdn.simpleicons.org/tailwindcss/06B6D4", color: "from-cyan-400 to-blue-500" },
                      { name: "HTML5", logo: "https://cdn.simpleicons.org/html5/E34F26", color: "from-orange-500 to-red-600" },
                      { name: "Git", logo: "https://cdn.simpleicons.org/git/F05032", color: "from-orange-600 to-red-600" },
                      { name: "Firebase", logo: "https://cdn.simpleicons.org/firebase/FFCA28", color: "from-yellow-500 to-orange-600" },
                      { name: "Vercel", logo: "https://cdn.simpleicons.org/vercel/white", color: "from-gray-700 to-gray-900" },
                      { name: "MySQL", logo: "https://cdn.simpleicons.org/mysql/4479A1", color: "from-blue-600 to-blue-800" },
                    ].map((tech, index) => (
                      <div
                        key={`${tech.name}-${setIndex}-${index}`}
                        className="flex-shrink-0 flex flex-col items-center gap-2 group cursor-pointer"
                      >
                        <div className={`relative w-20 h-20 md:w-24 md:h-24 flex items-center justify-center bg-gradient-to-br ${tech.color} rounded-2xl shadow-xl transition-transform duration-300 backdrop-blur-sm border border-white/10 ${!isMobile ? 'group-hover:scale-110' : ''}`}>
                          <img 
                            src={tech.logo} 
                            alt={tech.name} 
                            className="w-10 h-10 md:w-12 md:h-12 object-contain" 
                            loading="lazy"
                          />
                        </div>
                        <span className="text-gray-400 text-xs md:text-sm font-medium group-hover:text-white transition-colors">
                          {tech.name}
                        </span>
                      </div>
                    ))}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Network Skills - Slower & conditional animation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-12"
          >
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3 justify-center">
              <Network className="w-6 h-6 text-purple-400" />
              Network & Infrastructure
            </h3>
            <div className="relative overflow-hidden bg-gradient-to-br from-purple-950/30 via-gray-900/50 to-pink-950/30 backdrop-blur-xl rounded-2xl p-6 md:p-10 border border-purple-500/20 shadow-xl">
              {/* Fade edges - reduced */}
              <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-gray-900 to-transparent z-10 pointer-events-none"></div>
              <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-gray-900 to-transparent z-10 pointer-events-none"></div>

              <div className={`flex gap-5 md:gap-7 ${isMobile ? 'animate-scroll-network-mobile' : 'animate-scroll-network'}`}>
                {[...Array(3)].map((_, setIndex) => (
                  <React.Fragment key={setIndex}>
                    {[
                      { name: "Cisco", logo: "https://cdn.simpleicons.org/cisco/1BA0D7", color: "from-blue-500 to-cyan-600" },
                      { name: "MikroTik", logo: "https://cdn.simpleicons.org/mikrotik/293239", color: "from-red-500 to-orange-600" },
                      { name: "Ubuntu", logo: "https://cdn.simpleicons.org/ubuntu/E95420", color: "from-orange-500 to-red-500" },
                      { name: "Linux", logo: "https://cdn.simpleicons.org/linux/FCC624", color: "from-yellow-500 to-orange-500" },
                      { name: "pfSense", logo: "https://cdn.simpleicons.org/pfsense/212121", color: "from-gray-600 to-gray-800" },
                      { name: "Docker", logo: "https://cdn.simpleicons.org/docker/2496ED", color: "from-blue-400 to-blue-600" },
                    ].map((tech, index) => (
                      <div
                        key={`${tech.name}-${setIndex}-${index}`}
                        className="flex-shrink-0 flex flex-col items-center gap-2 group cursor-pointer"
                      >
                        <div className={`relative w-20 h-20 md:w-24 md:h-24 flex items-center justify-center bg-gradient-to-br ${tech.color} rounded-2xl shadow-xl transition-transform duration-300 backdrop-blur-sm border border-white/10 ${!isMobile ? 'group-hover:scale-110' : ''}`}>
                          <img 
                            src={tech.logo} 
                            alt={tech.name} 
                            className="w-10 h-10 md:w-12 md:h-12 object-contain" 
                            loading="lazy"
                          />
                        </div>
                        <span className="text-gray-400 text-xs md:text-sm font-medium group-hover:text-white transition-colors">
                          {tech.name}
                        </span>
                      </div>
                    ))}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Skills Tags */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
          >
            <div className="bg-blue-950/20 backdrop-blur-xl rounded-2xl p-5 border border-blue-500/20">
              <h4 className="text-base font-bold text-blue-400 mb-3 flex items-center gap-2">
                <Code2 className="w-4 h-4" />
                Development Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {["Web Development", "API Development", "Database Design", "Responsive Design", "Performance Optimization"].map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-200 text-xs font-medium hover:bg-blue-500/20 hover:border-blue-400/50 transition-all duration-300 cursor-default"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div className="bg-purple-950/20 backdrop-blur-xl rounded-2xl p-5 border border-purple-500/20">
              <h4 className="text-base font-bold text-purple-400 mb-3 flex items-center gap-2">
                <Network className="w-4 h-4" />
                Network & Infrastructure
              </h4>
              <div className="flex flex-wrap gap-2">
                {["Routing & Switching", "Subnetting", "Network Firewall", "Network Troubleshooting", "System Administration"].map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/30 rounded-lg text-purple-200 text-xs font-medium hover:bg-purple-500/20 hover:border-purple-400/50 transition-all duration-300 cursor-default"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <style jsx>{`
        @keyframes scroll-dev {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-100% / 2)); }
        }
        @keyframes scroll-network {
          0% { transform: translateX(calc(-100% / 3)); }
          100% { transform: translateX(0); }
        }
        
        .animate-scroll-dev {
          animation: scroll-dev 80s linear infinite;
          width: fit-content;
        }
        .animate-scroll-network {
          animation: scroll-network 70s linear infinite;
          width: fit-content;
        }
        
        /* Mobile - SLOWER animations */
        .animate-scroll-dev-mobile {
          animation: scroll-dev 50s linear infinite;
          width: fit-content;
        }
        .animate-scroll-network-mobile {
          animation: scroll-network 45s linear infinite;
          width: fit-content;
        }
        
        .animate-scroll-dev:hover,
        .animate-scroll-network:hover,
        .animate-scroll-dev-mobile:hover,
        .animate-scroll-network-mobile:hover {
          animation-play-state: paused;
        }
      `}</style>
    </main>
  );
}