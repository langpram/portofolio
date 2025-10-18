"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Award,
  Plus,
  Edit,
  Trash2,
  Lock,
  X,
  Check,
  Upload,
  ExternalLink,
} from "lucide-react";
import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";

interface Certificate {
  id: string;
  name: string;
  category: string;
  description: string;
  issuer: string;
  date: string;
  fileUrl: string;
  imageUrl?: string; // Add optional image URL
  fileName?: string; // Make fileName optional
  createdAt: Timestamp | null;
}

// Tambahkan fungsi helper sebelum component
const getGoogleDriveViewerUrl = (url: string) => {
  // Extract file ID dari URL Google Drive
  const fileId = url.match(/[-\w]{25,}/);
  if (fileId) {
    return `https://drive.google.com/file/d/${fileId[0]}/preview`;
  }
  return url;
};

export default function CertificatePage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [showAdminLogin, setShowAdminLogin] = useState<boolean>(false);
  const [adminPassword, setAdminPassword] = useState<string>("");
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingCert, setEditingCert] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    issuer: "",
    date: "",
    fileUrl: "",
    imageUrl: "", // Add image URL field
    fileName: "" as string, // Add explicit type
  });

  const ADMIN_PASSWORD =
    process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "default_password"; // 🟢 Fallback kalau env nggak kebaca

  // Fetch certificates
  const fetchCertificates = async () => {
    try {
      setLoading(true);
      console.log("Mengambil data certificates dari Firestore...");
      const certsCollection = collection(db, "certificates");
      const q = query(certsCollection, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Certificate[];

      console.log("Data certificates:", data);
      setCertificates(data);

      // Extract unique categories
      const uniqueCategories = Array.from(
        new Set(data.map((cert) => cert.category))
      );
      console.log("Kategori unik:", uniqueCategories);
      setCategories(uniqueCategories);
    } catch (error: any) {
      console.error("Gagal mengambil certificates:", error.message, error.code);
      alert("Gagal memuat certificates. Cek koneksi atau Firebase config.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("useEffect: Memulai fetch certificates...");
    fetchCertificates();
  }, []);

  const handleAdminLogin = () => {
    console.log("Mencoba login admin dengan password:", adminPassword);
    if (adminPassword === ADMIN_PASSWORD) {
      setIsAdminMode(true);
      setShowAdminLogin(false);
      setAdminPassword("");
    } else {
      alert("Password salah!");
      setAdminPassword("");
    }
  };

  const handleSubmit = async () => {
    if (
      !formData.name ||
      !formData.category ||
      !formData.issuer ||
      !formData.date ||
      !formData.fileUrl
    ) {
      alert("Isi semua kolom yang wajib termasuk URL file!");
      return;
    }

    try {
      setUploading(true);

      const certData = {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        issuer: formData.issuer,
        date: formData.date,
        fileUrl: formData.fileUrl, // URL dari input
        imageUrl: formData.imageUrl || "",
        fileName: formData.fileName || "Certificate",
        createdAt: editingCert?.createdAt || serverTimestamp(),
      };

      if (editingCert) {
        await updateDoc(doc(db, "certificates", editingCert.id), certData);
        console.log("Certificate updated");
      } else {
        await addDoc(collection(db, "certificates"), certData);
        console.log("Certificate added");
      }

      resetForm();
      await fetchCertificates();
      alert(
        editingCert
          ? "Certificate berhasil diupdate!"
          : "Certificate berhasil ditambah!"
      );
    } catch (error: any) {
      console.error("Error:", error);
      alert(`Gagal: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (cert: Certificate) => {
    if (!confirm(`Hapus "${cert.name}"?`)) return;

    try {
      console.log("Menghapus certificate:", cert.id);
      await deleteDoc(doc(db, "certificates", cert.id));
      console.log("Certificate dihapus dari Firestore");
      fetchCertificates();
      alert("Certificate berhasil dihapus!");
    } catch (error: any) {
      console.error("Gagal menghapus certificate:", error.message, error.code);
      alert("Gagal menghapus certificate.");
    }
  };

  const handleEdit = (cert: Certificate) => {
    console.log("Mengedit certificate:", cert.id);
    setEditingCert(cert);
    setFormData({
      name: cert.name,
      category: cert.category,
      description: cert.description,
      issuer: cert.issuer,
      date: cert.date,
      fileUrl: cert.fileUrl,
      imageUrl: cert.imageUrl || "", // Add this line
      fileName: cert.fileName || "", // Add this line
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    console.log("Reset form...");
    setFormData({
      name: "",
      category: "",
      description: "",
      issuer: "",
      date: "",
      fileUrl: "",
      imageUrl: "",
      fileName: "",
    });
    setEditingCert(null);
    setShowAddModal(false);
  };

  const filteredCertificates =
    selectedCategory === "All"
      ? certificates
      : certificates.filter((cert) => cert.category === selectedCategory);

  const categoryColors: { [key: string]: string } = {
    Programming: "from-blue-500 to-cyan-500",
    Network: "from-purple-500 to-pink-500",
    Cloud: "from-orange-500 to-red-500",
    Security: "from-green-500 to-emerald-500",
    Database: "from-yellow-500 to-orange-500",
    Design: "from-pink-500 to-purple-500",
  };

  const getCategoryColor = (category: string) => {
    return categoryColors[category] || "from-gray-500 to-gray-700";
  };

  return (
    <main className="min-h-screen bg-gray-950 relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-purple-950/30" />
        <motion.div
          className="absolute top-20 left-20 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 0.3, 0.5] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
      </div>

      {/* Admin Button */}
      {!isAdminMode && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowAdminLogin(!showAdminLogin)}
          className="fixed top-4 right-4 bg-gray-800/80 backdrop-blur-xl border border-gray-700 rounded-full p-3 hover:bg-gray-700/80 transition-all z-50 hover:scale-110"
        >
          <Lock className="w-5 h-5 text-gray-300" />
        </motion.button>
      )}

      {/* Admin Login Modal */}
      <AnimatePresence>
        {showAdminLogin && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed top-20 right-4 bg-gray-900/95 backdrop-blur-xl border-2 border-gray-700 rounded-2xl p-6 shadow-2xl z-50 w-72"
          >
            <h3 className="text-white font-bold mb-4">Admin Login</h3>
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()}
              placeholder="Masukkan password"
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
      </AnimatePresence>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={resetForm}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900/95 backdrop-blur-xl border-2 border-gray-700 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {editingCert ? "Edit Certificate" : "Tambah Certificate Baru"}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Nama Certificate *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                    placeholder="Contoh: AWS Certified Solutions Architect"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Kategori *
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                    placeholder="Contoh: Cloud, Programming, Network"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Penerbit *
                  </label>
                  <input
                    type="text"
                    value={formData.issuer}
                    onChange={(e) =>
                      setFormData({ ...formData, issuer: e.target.value })
                    }
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                    placeholder="Contoh: Amazon Web Services, Cisco"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Tanggal *
                  </label>
                  <input
                    type="date" // 🟢 Ganti ke type="date" biar pake date picker
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Deskripsi
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none resize-none"
                    placeholder="Deskripsi singkat tentang certificate ini..."
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    URL File Certificate *
                  </label>
                  <input
                    type="url"
                    value={formData.fileUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, fileUrl: e.target.value })
                    }
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                    placeholder="https://drive.google.com/file/..."
                  />
                  <p className="text-gray-500 text-xs mt-1">
                    Masukkan URL file dari Google Drive atau layanan serupa
                  </p>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    URL Gambar Preview (Opsional)
                  </label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, imageUrl: e.target.value })
                    }
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                    placeholder="https://example.com/preview.jpg"
                  />
                  <p className="text-gray-500 text-xs mt-1">
                    Masukkan URL gambar untuk thumbnail sertifikat
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSubmit}
                    disabled={uploading}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sedang mengupload...
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        {editingCert ? "Update" : "Tambah"} Certificate
                      </>
                    )}
                  </button>
                  <button
                    onClick={resetForm}
                    className="px-6 bg-gray-800 text-white font-bold py-3 rounded-xl hover:bg-gray-700 transition-colors"
                  >
                    Batal
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 px-4 py-16 md:py-24 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-7xl font-black text-white mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Certificates & Awards
          </h1>
          <div className="h-1.5 w-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-6"></div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            This page features my professional certificates and awards that
            reflect my growth and dedication in the tech field. Each one
            represents my commitment to learning, improving, and delivering
            excellence in every project I take on.
          </p>
        </motion.div>

        {/* Admin Controls */}
        {isAdminMode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex flex-wrap gap-3 justify-center"
          >
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all flex items-center gap-2 shadow-lg hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              Tambah Certificate
            </button>
            <button
              onClick={() => setIsAdminMode(false)}
              className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <Lock className="w-5 h-5" />
              Keluar Admin Mode
            </button>
          </motion.div>
        )}

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8 flex flex-wrap gap-3 justify-center"
        >
          <button
            onClick={() => setSelectedCategory("All")}
            className={`px-6 py-2 rounded-xl font-medium transition-all ${
              selectedCategory === "All"
                ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                : "bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white"
            }`}
          >
            Semua ({certificates.length})
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 rounded-xl font-medium transition-all ${
                selectedCategory === category
                  ? `bg-gradient-to-r ${getCategoryColor(
                      category
                    )} text-white shadow-lg`
                  : "bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              {category} (
              {certificates.filter((c) => c.category === category).length})
            </button>
          ))}
        </motion.div>

        {/* Certificates Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <p className="text-gray-400 mt-4">Memuat certificates...</p>
          </div>
        ) : filteredCertificates.length === 0 ? (
          <div className="text-center py-20">
            <Award className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Belum ada certificate</p>
            {isAdminMode && (
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 text-blue-400 hover:text-blue-300 transition-colors"
              >
                Tambah certificate pertama
              </button>
            )}
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence>
              {filteredCertificates.map((cert, index) => (
                <motion.div
                  key={cert.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group relative"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${getCategoryColor(
                      cert.category
                    )} opacity-10 blur-xl group-hover:opacity-20 transition-opacity rounded-3xl`}
                  />
                  <div className="relative bg-gray-900/80 backdrop-blur-xl rounded-3xl border-2 border-gray-800 hover:border-gray-700 transition-all h-full flex flex-col overflow-hidden">
                    {/* Certificate Preview */}
                    <div className="relative w-full h-48 bg-gray-800">
                      {cert.fileUrl ? (
                        <iframe
                          src={getGoogleDriveViewerUrl(cert.fileUrl)}
                          className="w-full h-full"
                          allow="autoplay"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                          <Award className="w-12 h-12 text-gray-600" />
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-gray-900/95 to-transparent" />
                    </div>

                    {/* Certificate Content */}
                    <div className="p-6">
                      <div
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r ${getCategoryColor(
                          cert.category
                        )} text-white text-xs font-bold mb-4 w-fit`}
                      >
                        <Award className="w-3.5 h-3.5" />
                        {cert.category}
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
                        {cert.name}
                      </h3>
                      <p className="text-gray-400 text-sm mb-1">
                        {cert.issuer}
                      </p>
                      <p className="text-gray-500 text-xs mb-4">{cert.date}</p>
                      {cert.description && (
                        <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-3 flex-grow">
                          {cert.description}
                        </p>
                      )}
                      <div className="flex gap-2 mt-auto">
                        <a
                          href={cert.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-blue-600/20 border border-blue-500/30 text-blue-400 px-4 py-2.5 rounded-xl hover:bg-blue-600/30 transition-all flex items-center justify-center gap-2 text-sm font-medium"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Lihat
                        </a>
                        {isAdminMode && (
                          <>
                            <button
                              onClick={() => handleEdit(cert)}
                              className="bg-yellow-600/20 border border-yellow-500/30 text-yellow-400 px-4 py-2.5 rounded-xl hover:bg-yellow-600/30 transition-all"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(cert)}
                              className="bg-red-600/20 border border-red-500/30 text-red-400 px-4 py-2.5 rounded-xl hover:bg-red-600/30 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </main>
  );
}
