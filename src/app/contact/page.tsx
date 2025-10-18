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

      // Get pending reviews - always fetch, display only in admin mode
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
      href: "https://wa.me/6281234567890",
      color: "from-green-500 to-green-600",
      hoverColor: "hover:shadow-green-500/50",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/30"
    },
    {
      name: "Instagram",
      icon: Instagram,
      href: "https://instagram.com/yourusername",
      color: "from-pink-500 via-purple-500 to-orange-500",
      hoverColor: "hover:shadow-pink-500/50",
      bgColor: "bg-pink-500/10",
      borderColor: "border-pink-500/30"
    },
    {
      name: "GitHub",
      icon: Github,
      href: "https://github.com/yourusername",
      color: "from-gray-700 to-gray-900",
      hoverColor: "hover:shadow-gray-500/50",
      bgColor: "bg-gray-500/10",
      borderColor: "border-gray-500/30"
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      href: "https://linkedin.com/in/yourusername",
      color: "from-blue-600 to-blue-700",
      hoverColor: "hover:shadow-blue-500/50",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30"
    },
    {
      name: "Email",
      icon: Mail,
      href: "mailto:your.email@example.com",
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
        
        // Refresh reviews if in admin mode
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
      // Force refresh after login to get pending reviews
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
      
      // Refresh reviews
      fetchReviews();
    } catch (error) {
      console.error("Error approving review:", error);
      alert("Failed to approve review.");
    }
  };

  const deleteReview = async (reviewId: string) => {
    try {
      await deleteDoc(doc(db, "reviews", reviewId));
      
      // Refresh reviews
      fetchReviews();
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("Failed to delete review.");
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 relative overflow-hidden">
      {/* Animated Background with GIF */}
      <div className="fixed inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
          style={{
            backgroundImage: "url('https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExMHRia2ZuanByb2s1cjA2MXI5Y2k3a3ptenM3d2l6d2p3N2Y5M2luaCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/XgtJCYMbPvMe4/giphy.gif')"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950/70 via-gray-950/80 to-gray-950/90" />
        
        {/* Floating orbs */}
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 px-4 py-16 md:py-24 max-w-6xl mx-auto">
        {/* Admin Button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowAdminLogin(!showAdminLogin)}
          className="fixed top-4 right-4 bg-gray-800/80 backdrop-blur-xl border border-gray-700 rounded-full p-3 hover:bg-gray-700/80 transition-all z-50"
        >
          <Lock className="w-5 h-5 text-gray-300" />
        </motion.button>

        {/* Admin Login Modal */}
        {showAdminLogin && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed top-20 right-4 bg-gray-900/95 backdrop-blur-xl border-2 border-gray-700 rounded-2xl p-6 shadow-2xl z-50 w-72"
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

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Get In Touch
          </h1>
          <div className="h-1 w-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-6"></div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Let's connect! Feel free to reach out through any of these platforms or leave a review below.
          </p>
        </motion.div>

        {/* Contact Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16"
        >
          {contacts.map((contact, index) => {
            const Icon = contact.icon;
            return (
              <motion.a
                key={contact.name}
                href={contact.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`group relative overflow-hidden ${contact.bgColor} border-2 ${contact.borderColor} rounded-2xl p-6 transition-all duration-300 hover:scale-105 ${contact.hoverColor} hover:shadow-2xl backdrop-blur-xl`}
              >
                <div className="relative z-10 flex flex-col items-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${contact.color} flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <span className="text-white font-bold text-lg">{contact.name}</span>
                </div>
                <div className={`absolute inset-0 bg-gradient-to-br ${contact.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              </motion.a>
            );
          })}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Rating & Comment Section */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl rounded-2xl p-8 border-2 border-gray-800/50 shadow-2xl"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Star className="w-6 h-6 text-yellow-400" />
              Leave a Review
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Your Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-800/50 border-2 border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-3">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="transition-transform hover:scale-125 focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 ${
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
                  className="w-full bg-gray-800/50 border-2 border-gray-700/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:outline-none transition-colors resize-none"
                  placeholder="Share your thoughts..."
                />
              </div>

              <button
                onClick={handleSubmitReview}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-500/50 hover:scale-105"
              >
                <Send className="w-5 h-5" />
                Submit Review
              </button>
            </div>
          </motion.div>

          {/* Reviews List */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl rounded-2xl p-8 border-2 border-gray-800/50 shadow-2xl"
          >
            <h2 className="text-2xl font-bold text-white mb-6">
              {isAdminMode ? "Manage Reviews" : "Recent Reviews"}
            </h2>

            {isAdminMode && (
              <div className="mb-6">
                <button
                  onClick={() => {
                    setIsAdminMode(false);
                    setPendingReviews([]);
                  }}
                  className="text-sm bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Exit Admin Mode
                </button>
              </div>
            )}

            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <p className="text-gray-400 mt-4">Loading reviews...</p>
              </div>
            ) : (
              <>
                {/* Pending Reviews (Admin Only) */}
                {isAdminMode && pendingReviews.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-yellow-400 font-bold mb-3 text-sm">Pending Approval ({pendingReviews.length})</h3>
                    <div className="space-y-3 max-h-[200px] overflow-y-auto custom-scrollbar">
                      {pendingReviews.map((review) => (
                        <div
                          key={review.id}
                          className="bg-yellow-900/20 border border-yellow-600/30 rounded-xl p-4"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-white font-bold text-sm">{review.name}</h3>
                            <div className="flex gap-2">
                              <button
                                onClick={() => approveReview(review)}
                                className="bg-green-600 p-1.5 rounded-lg hover:bg-green-700 transition-colors"
                              >
                                <Check className="w-4 h-4 text-white" />
                              </button>
                              <button
                                onClick={() => deleteReview(review.id)}
                                className="bg-red-600 p-1.5 rounded-lg hover:bg-red-700 transition-colors"
                              >
                                <X className="w-4 h-4 text-white" />
                              </button>
                            </div>
                          </div>
                          <div className="flex gap-1 mb-2">
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
                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {reviews.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No reviews yet. Be the first!</p>
                  ) : (
                    reviews.map((review) => (
                      <motion.div
                        key={review.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-800/50 rounded-xl p-5 border border-gray-700/50 hover:border-gray-600/50 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-white font-bold">{review.name}</h3>
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 text-xs">{getRelativeTime(review.createdAt)}</span>
                            {isAdminMode && (
                              <button
                                onClick={() => deleteReview(review.id)}
                                className="text-red-400 hover:text-red-300 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-1 mb-3">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-600"
                              }`}
                            />
                          ))}
                        </div>
                        
                        <p className="text-gray-400 text-sm leading-relaxed">{review.comment}</p>
                      </motion.div>
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
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.7);
        }
      `}</style>
    </main>
  );
}