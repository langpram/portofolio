"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Github, Linkedin, Instagram, MessageCircle, Send, Star, Trash2, Check, X, Lock } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, orderBy, serverTimestamp, Timestamp } from "firebase/firestore";

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  approved: boolean;
  createdAt: Timestamp | null;
}

export default function ContactPage() {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [pendingReviews, setPendingReviews] = useState<Review[]>([]);
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [adminPassword, setAdminPassword] = useState<string>("");
  const [showAdminLogin, setShowAdminLogin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "";

  // Convert timestamp to relative time
  const getRelativeTime = (timestamp: Timestamp | null) => {
    if (!timestamp) return "Just now";
    
    const now = new Date();
    const date = timestamp.toDate();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  };

  // Fetch reviews from Firestore
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const reviewsCollection = collection(db, "reviews");
      
      // Get approved reviews
      const approvedQuery = query(
        reviewsCollection,
        where("approved", "==", true),
        orderBy("createdAt", "desc")
      );
      const approvedSnapshot = await getDocs(approvedQuery);
      const approvedData = approvedSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Review[];
      
      setReviews(approvedData);

      // Get pending reviews
      const pendingQuery = query(
        reviewsCollection,
        where("approved", "==", false),
        orderBy("createdAt", "desc")
      );
      const pendingSnapshot = await getDocs(pendingQuery);
      const pendingData = pendingSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Review[];
      
      setPendingReviews(pendingData);
      
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const contacts = [
    {
      name: "WhatsApp",
      icon: MessageCircle,
      href: "https://wa.me/6287762101910",
      color: "from-green-500 to-green-600",
      hoverColor: "hover:shadow-green-500/50",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/30"
    },
    {
      name: "Instagram",
      icon: Instagram,
      href: "https://instagram.com/langpram_",
      color: "from-pink-500 via-purple-500 to-orange-500",
      hoverColor: "hover:shadow-pink-500/50",
      bgColor: "bg-pink-500/10",
      borderColor: "border-pink-500/30"
    },
    {
      name: "GitHub",
      icon: Github,
      href: "https://github.com/langpram",
      color: "from-gray-700 to-gray-900",
      hoverColor: "hover:shadow-gray-500/50",
      bgColor: "bg-gray-500/10",
      borderColor: "border-gray-500/30"
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      href: "www.linkedin.com/in/bambang-lang-prihambodo-b4b697313",
      color: "from-blue-600 to-blue-700",
      hoverColor: "hover:shadow-blue-500/50",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30"
    },
    {
      name: "Email",
      icon: Mail,
      href: "mailto:bambang.career@gmail.com",
      color: "from-red-500 to-red-600",
      hoverColor: "hover:shadow-red-500/50",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/30"
    }
  ];

  const handleSubmitReview = async () => {
    if (name.trim() && comment.trim() && rating > 0) {
      try {
        await addDoc(collection(db, "reviews"), {
          name: name.trim(),
          rating,
          comment: comment.trim(),
          approved: false,
          createdAt: serverTimestamp()
        });
        
        setName("");
        setComment("");
        setRating(0);
        alert("Review submitted! Waiting for approval.");
        
        if (isAdminMode) {
          fetchReviews();
        }
      } catch (error) {
        console.error("Error submitting review:", error);
        alert("Failed to submit review. Please try again.");
      }
    }
  };

  const handleAdminLogin = async () => {
    if (adminPassword === ADMIN_PASSWORD) {
      setIsAdminMode(true);
      setShowAdminLogin(false);
      setAdminPassword("");
      setTimeout(() => {
        fetchReviews();
      }, 100);
    } else {
      alert("Wrong password!");
      setAdminPassword("");
    }
  };

  const approveReview = async (reviewData: Review) => {
    try {
      const reviewRef = doc(db, "reviews", reviewData.id);
      await updateDoc(reviewRef, { approved: true });
      fetchReviews();
    } catch (error) {
      console.error("Error approving review:", error);
      alert("Failed to approve review.");
    }
  };

  const deleteReview = async (reviewId: string) => {
    try {
      await deleteDoc(doc(db, "reviews", reviewId));
      fetchReviews();
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("Failed to delete review.");
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 relative overflow-hidden">
      {/* Simple Static Background - Clean & Fast */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800" />
        
        {/* Static floating orbs - No animation */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-pink-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 px-4 py-12 md:py-16 max-w-6xl mx-auto">
        {/* Admin Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowAdminLogin(!showAdminLogin)}
          className="fixed top-4 right-4 bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-full p-3 hover:bg-gray-700/80 transition-all z-50"
        >
          <Lock className="w-5 h-5 text-gray-300" />
        </motion.button>

        {/* Admin Login Modal */}
        {showAdminLogin && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed top-20 right-4 bg-gray-900/95 backdrop-blur-sm border-2 border-gray-700 rounded-2xl p-6 shadow-2xl z-50 w-72"
          >
            <h3 className="text-white font-bold mb-4">Admin Login</h3>
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
              placeholder="Enter password"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white mb-3 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleAdminLogin}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Login
            </button>
          </motion.div>
        )}

        {/* Header - Reduced animations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Get In Touch
          </h1>
          <div className="h-1 w-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400 text-base md:text-lg max-w-2xl mx-auto">
            Let's connect! Feel free to reach out through any of these platforms or leave a review below.
          </p>
        </motion.div>

        {/* Contact Buttons - Reduced animations */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
          {contacts.map((contact, index) => {
            const Icon = contact.icon;
            return (
              <motion.a
                key={contact.name}
                href={contact.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`group relative overflow-hidden ${contact.bgColor} border-2 ${contact.borderColor} rounded-xl p-4 md:p-6 transition-all duration-200 hover:scale-105 backdrop-blur-sm`}
              >
                <div className="relative z-10 flex flex-col items-center gap-2 md:gap-3">
                  <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br ${contact.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className="w-6 h-6 md:w-7 md:h-7 text-white" />
                  </div>
                  <span className="text-white font-bold text-xs md:text-sm">{contact.name}</span>
                </div>
              </motion.a>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Rating & Comment Section */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-gray-900/80 backdrop-blur-sm rounded-xl md:rounded-2xl p-6 md:p-8 border-2 border-gray-800/50 shadow-xl"
          >
            <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6 flex items-center gap-2 md:gap-3">
              <Star className="w-5 h-5 md:w-6 md:h-6 text-yellow-400" />
              Leave a Review
            </h2>
            
            <div className="space-y-4 md:space-y-5">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-800/50 border-2 border-gray-700/50 rounded-lg md:rounded-xl px-3 md:px-4 py-2 md:py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-colors text-sm md:text-base"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="transition-transform active:scale-125 focus:outline-none"
                    >
                      <Star
                        className={`w-7 h-7 md:w-8 md:h-8 ${
                          star <= (hoverRating || rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-600"
                        } transition-colors`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Your Review</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  className="w-full bg-gray-800/50 border-2 border-gray-700/50 rounded-lg md:rounded-xl px-3 md:px-4 py-2 md:py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-colors resize-none text-sm md:text-base"
                  placeholder="Share your thoughts..."
                />
              </div>

              <button
                onClick={handleSubmitReview}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 rounded-lg md:rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-lg active:scale-95 text-sm md:text-base"
              >
                <Send className="w-4 h-4 md:w-5 md:h-5" />
                Submit Review
              </button>
            </div>
          </motion.div>

          {/* Reviews List */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="bg-gray-900/80 backdrop-blur-sm rounded-xl md:rounded-2xl p-6 md:p-8 border-2 border-gray-800/50 shadow-xl"
          >
            <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6">
              {isAdminMode ? "Manage Reviews" : "Recent Reviews"}
            </h2>

            {isAdminMode && (
              <div className="mb-4 md:mb-6">
                <button
                  onClick={() => {
                    setIsAdminMode(false);
                    setPendingReviews([]);
                  }}
                  className="text-xs md:text-sm bg-red-600 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Exit Admin Mode
                </button>
              </div>
            )}

            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p className="text-gray-400 mt-4 text-sm">Loading reviews...</p>
              </div>
            ) : (
              <>
                {/* Pending Reviews (Admin Only) */}
                {isAdminMode && pendingReviews.length > 0 && (
                  <div className="mb-4 md:mb-6">
                    <h3 className="text-yellow-400 font-bold mb-3 text-xs md:text-sm">Pending Approval ({pendingReviews.length})</h3>
                    <div className="space-y-2 md:space-y-3 max-h-[150px] md:max-h-[200px] overflow-y-auto custom-scrollbar">
                      {pendingReviews.map((review) => (
                        <div
                          key={review.id}
                          className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg md:rounded-xl p-3 md:p-4"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-white font-bold text-xs md:text-sm">{review.name}</h3>
                            <div className="flex gap-1 md:gap-2">
                              <button
                                onClick={() => approveReview(review)}
                                className="bg-green-600 p-1 md:p-1.5 rounded-md md:rounded-lg hover:bg-green-700 transition-colors"
                              >
                                <Check className="w-3 h-3 md:w-4 md:h-4 text-white" />
                              </button>
                              <button
                                onClick={() => deleteReview(review.id)}
                                className="bg-red-600 p-1 md:p-1.5 rounded-md md:rounded-lg hover:bg-red-700 transition-colors"
                              >
                                <X className="w-3 h-3 md:w-4 md:h-4 text-white" />
                              </button>
                            </div>
                          </div>
                          <div className="flex gap-0.5 md:gap-1 mb-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3 h-3 ${
                                  star <= review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-600"
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-gray-300 text-xs">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Approved Reviews */}
                <div className="space-y-3 md:space-y-4 max-h-[400px] md:max-h-[500px] overflow-y-auto pr-1 md:pr-2 custom-scrollbar">
                  {reviews.length === 0 ? (
                    <p className="text-gray-500 text-center py-8 text-sm">No reviews yet. Be the first!</p>
                  ) : (
                    reviews.map((review) => (
                      <div
                        key={review.id}
                        className="bg-gray-800/50 rounded-lg md:rounded-xl p-4 md:p-5 border border-gray-700/50"
                      >
                        <div className="flex items-center justify-between mb-2 md:mb-3">
                          <h3 className="text-white font-bold text-sm md:text-base">{review.name}</h3>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 text-xs">{getRelativeTime(review.createdAt)}</span>
                            {isAdminMode && (
                              <button
                                onClick={() => deleteReview(review.id)}
                                className="text-red-400 hover:text-red-300 transition-colors"
                              >
                                <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-0.5 md:gap-1 mb-2 md:mb-3">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3 h-3 md:w-4 md:h-4 ${
                                star <= review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-600"
                              }`}
                            />
                          ))}
                        </div>
                        
                        <p className="text-gray-400 text-xs md:text-sm leading-relaxed">{review.comment}</p>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.4);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.6);
        }
      `}</style>
    </main>
  );
}