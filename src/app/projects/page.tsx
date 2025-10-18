"use client";
import React, { useState, useEffect } from "react";
import {
  Code,
  Plus,
  Edit,
  Trash2,
  Lock,
  X,
  Check,
  ExternalLink,
  Github,
  Globe,
  Calendar,
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

interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  projectUrl: string;
  githubUrl?: string;
  imageUrl?: string;
  date: string;
  status: string;
  createdAt: Timestamp | null;
}

export default function ProjectPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [showAdminLogin, setShowAdminLogin] = useState<boolean>(false);
  const [adminPassword, setAdminPassword] = useState<string>("");
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    technologies: "",
    projectUrl: "",
    githubUrl: "",
    imageUrl: "",
    date: "",
    status: "In Progress",
  });

  const ADMIN_PASSWORD =
    process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "default_password";

  // Fetch projects
  const fetchProjects = async () => {
    try {
      setLoading(true);
      console.log("Mengambil data projects dari Firestore...");
      const projectsCollection = collection(db, "projects");
      const q = query(projectsCollection, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Project[];

      console.log("Data projects:", data);
      setProjects(data);
    } catch (error: any) {
      console.error("Gagal mengambil projects:", error.message, error.code);
      alert("Gagal memuat projects. Cek koneksi atau Firebase config.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("useEffect: Memulai fetch projects...");
    fetchProjects();
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
    if (!formData.name || !formData.description || !formData.projectUrl || !formData.technologies) {
      alert("Isi semua kolom yang wajib!");
      return;
    }

    try {
      setUploading(true);

      const projectData = {
        name: formData.name,
        description: formData.description,
        technologies: formData.technologies.split(",").map(t => t.trim()),
        projectUrl: formData.projectUrl,
        githubUrl: formData.githubUrl || "",
        imageUrl: formData.imageUrl || "",
        date: formData.date,
        status: formData.status,
        createdAt: editingProject?.createdAt || serverTimestamp(),
      };

      if (editingProject) {
        await updateDoc(doc(db, "projects", editingProject.id), projectData);
        console.log("Project updated");
      } else {
        await addDoc(collection(db, "projects"), projectData);
        console.log("Project added");
      }

      resetForm();
      await fetchProjects();
      alert(
        editingProject
          ? "Project berhasil diupdate!"
          : "Project berhasil ditambah!"
      );
    } catch (error: any) {
      console.error("Error:", error);
      alert(`Gagal: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (project: Project) => {
    if (!confirm(`Hapus project "${project.name}"?`)) return;

    try {
      console.log("Menghapus project:", project.id);
      await deleteDoc(doc(db, "projects", project.id));
      console.log("Project dihapus dari Firestore");
      fetchProjects();
      alert("Project berhasil dihapus!");
    } catch (error: any) {
      console.error("Gagal menghapus project:", error.message, error.code);
      alert("Gagal menghapus project.");
    }
  };

  const handleEdit = (project: Project) => {
    console.log("Mengedit project:", project.id);
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description,
      technologies: project.technologies.join(", "),
      projectUrl: project.projectUrl,
      githubUrl: project.githubUrl || "",
      imageUrl: project.imageUrl || "",
      date: project.date,
      status: project.status,
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    console.log("Reset form...");
    setFormData({
      name: "",
      description: "",
      technologies: "",
      projectUrl: "",
      githubUrl: "",
      imageUrl: "",
      date: "",
      status: "In Progress",
    });
    setEditingProject(null);
    setShowAddModal(false);
  };

  const statusColors: { [key: string]: string } = {
    "Completed": "from-green-500 to-emerald-500",
    "In Progress": "from-blue-500 to-cyan-500",
    "Planning": "from-yellow-500 to-orange-500",
    "On Hold": "from-gray-500 to-gray-600",
  };

  return (
    <main className="min-h-screen bg-gray-950 relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-blue-950/30" />
        <div className="absolute top-20 left-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Admin Button */}
      {!isAdminMode && (
        <button
          onClick={() => setShowAdminLogin(!showAdminLogin)}
          className="fixed top-4 right-4 bg-gray-800/80 backdrop-blur-xl border border-gray-700 rounded-full p-3 hover:bg-gray-700/80 transition-all z-50 hover:scale-110"
        >
          <Lock className="w-5 h-5 text-gray-300" />
        </button>
      )}

      {/* Admin Login Modal */}
      {showAdminLogin && (
        <div className="fixed top-20 right-4 bg-gray-900/95 backdrop-blur-xl border-2 border-gray-700 rounded-2xl p-6 shadow-2xl z-50 w-72 animate-in fade-in slide-in-from-top-2 duration-200">
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
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={resetForm}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-gray-900/95 backdrop-blur-xl border-2 border-gray-700 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                {editingProject ? "Edit Project" : "Tambah Project Baru"}
              </h2>
              <button onClick={resetForm} className="text-gray-400 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Nama Project *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                  placeholder="Contoh: E-Commerce Platform"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Deskripsi *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none resize-none"
                  placeholder="Deskripsi lengkap tentang project ini..."
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Technologies (pisahkan dengan koma) *
                </label>
                <input
                  type="text"
                  value={formData.technologies}
                  onChange={(e) => setFormData({ ...formData, technologies: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                  placeholder="React, Node.js, MongoDB, Tailwind"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  URL Project *
                </label>
                <input
                  type="url"
                  value={formData.projectUrl}
                  onChange={(e) => setFormData({ ...formData, projectUrl: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                  placeholder="https://your-project.com"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  GitHub URL (Opsional)
                </label>
                <input
                  type="url"
                  value={formData.githubUrl}
                  onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                  placeholder="https://github.com/username/repo"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  URL Gambar Preview (Opsional)
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                  placeholder="https://example.com/preview.jpg"
                />
                <p className="text-gray-500 text-xs mt-1">
                  Masukkan URL gambar untuk preview project
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Tanggal *
                  </label>
                  <input
                    type="month"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option>Completed</option>
                    <option>In Progress</option>
                    <option>Planning</option>
                    <option>On Hold</option>
                  </select>
                </div>
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
                      Sedang menyimpan...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      {editingProject ? "Update" : "Tambah"} Project
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
          </div>
        </div>
      )}

      <div className="relative z-10 px-4 py-16 md:py-24 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-5xl md:text-7xl font-black text-white mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            My Projects
          </h1>
          <div className="h-1.5 w-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mb-6"></div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              A collection of my personal and professional projects — built to learn, explore new ideas, and solve real problems through modern technology.
          </p>
        </div>

        {/* Admin Controls */}
        {isAdminMode && (
          <div className="mb-8 flex flex-wrap gap-3 justify-center animate-in fade-in slide-in-from-top-4 duration-500">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all flex items-center gap-2 shadow-lg hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              Tambah Project
            </button>
            <button
              onClick={() => setIsAdminMode(false)}
              className="bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-700 transition-colors flex items-center gap-2"
            >
              <Lock className="w-5 h-5" />
              Keluar Admin Mode
            </button>
          </div>
        )}

        {/* Projects Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <p className="text-gray-400 mt-4">Memuat projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20">
            <Code className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Belum ada project</p>
            {isAdminMode && (
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 text-blue-400 hover:text-blue-300 transition-colors"
              >
                Tambah project pertama
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <div
                key={project.id}
                className="group relative animate-in fade-in zoom-in-95 duration-500"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10 blur-xl group-hover:blur-2xl opacity-50 group-hover:opacity-70 transition-all rounded-3xl" />
                <div className="relative bg-gray-900/80 backdrop-blur-xl rounded-3xl border-2 border-gray-800 hover:border-gray-700 transition-all h-full flex flex-col overflow-hidden group-hover:-translate-y-2 duration-300">
                  {/* Project Image */}
                  <div className="relative w-full h-48 bg-gray-800 overflow-hidden">
                    {project.imageUrl ? (
                      <img
                        src={project.imageUrl}
                        alt={project.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                        <Code className="w-12 h-12 text-gray-600" />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-gray-900/95 to-transparent" />
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      <div className={`px-3 py-1.5 rounded-xl bg-gradient-to-r ${statusColors[project.status]} text-white text-xs font-bold backdrop-blur-sm`}>
                        {project.status}
                      </div>
                    </div>
                  </div>

                  {/* Project Content */}
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">
                      {project.name}
                    </h3>
                    
                    <div className="flex items-center gap-2 text-gray-400 text-xs mb-4">
                      <Calendar className="w-3.5 h-3.5" />
                      {project.date}
                    </div>

                    <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-3 flex-grow">
                      {project.description}
                    </p>

                    {/* Technologies */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.technologies.map((tech, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 bg-blue-600/20 border border-blue-500/30 text-blue-300 rounded-lg text-xs font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-auto">
                      <a
                        href={project.projectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-blue-600/20 border border-blue-500/30 text-blue-400 px-4 py-2.5 rounded-xl hover:bg-blue-600/30 transition-all flex items-center justify-center gap-2 text-sm font-medium"
                      >
                        <Globe className="w-4 h-4" />
                        Live Demo
                      </a>
                      {project.githubUrl && (
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-gray-700/50 border border-gray-600/30 text-gray-300 px-4 py-2.5 rounded-xl hover:bg-gray-700/70 transition-all flex items-center justify-center"
                        >
                          <Github className="w-4 h-4" />
                        </a>
                      )}
                      {isAdminMode && (
                        <>
                          <button
                            onClick={() => handleEdit(project)}
                            className="bg-yellow-600/20 border border-yellow-500/30 text-yellow-400 px-4 py-2.5 rounded-xl hover:bg-yellow-600/30 transition-all"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(project)}
                            className="bg-red-600/20 border border-red-500/30 text-red-400 px-4 py-2.5 rounded-xl hover:bg-red-600/30 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}