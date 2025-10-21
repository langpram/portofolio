"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Music,
  Plus,
  Edit,
  Trash2,
  Lock,
  X,
  Check,
  Search,
  Play,
  Pause,
  Volume2,
  VolumeX,
  ExternalLink,
  SkipBack,
  SkipForward,
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

interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  imageUrl: string;
  previewUrl: string;
  spotifyUrl: string;
  youtubeUrl?: string;
  startTime?: number; // Timestamp mulai preview (detik)
  createdAt: Timestamp | null;
}

interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string }[];
  };
  preview_url: string | null;
  external_urls: {
    spotify: string;
  };
}

export default function PlaylistPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [showAdminLogin, setShowAdminLogin] = useState<boolean>(false);
  const [adminPassword, setAdminPassword] = useState<string>("");
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploading, setUploading] = useState<boolean>(false);
  
  // Search states
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([]);
  const [searching, setSearching] = useState<boolean>(false);
  
  // Audio player states
  const [currentPlaying, setCurrentPlaying] = useState<string | null>(null);
  const [audioVolume, setAudioVolume] = useState<number>(0.5);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    artist: "",
    album: "",
    imageUrl: "",
    previewUrl: "",
    spotifyUrl: "",
    youtubeUrl: "",
    startTime: 0,
  });

  const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "default_password";
  const SPOTIFY_CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || "";
  const SPOTIFY_CLIENT_SECRET = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET || "";

  // Get Spotify Access Token
  const getSpotifyToken = useCallback(async () => {
    try {
      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`)}`,
        },
        body: "grant_type=client_credentials",
      });
      const data = await response.json();
      return data.access_token;
    } catch (error) {
      console.error("Error getting Spotify token:", error);
      return null;
    }
  }, [SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET]);

  // Search Spotify
  const searchSpotify = useCallback(async () => {
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    try {
      const token = await getSpotifyToken();
      if (!token) {
        alert("Gagal mendapatkan token Spotify. Cek API credentials!");
        return;
      }

      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=track&limit=20`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      setSearchResults(data.tracks?.items || []);
    } catch (error) {
      console.error("Error searching Spotify:", error);
      alert("Gagal mencari lagu. Coba lagi!");
    } finally {
      setSearching(false);
    }
  }, [searchQuery, getSpotifyToken]);

  // Select song from search
  const selectSong = useCallback((track: SpotifyTrack) => {
    setFormData({
      title: track.name,
      artist: track.artists.map(a => a.name).join(", "),
      album: track.album.name,
      imageUrl: track.album.images[0]?.url || "",
      previewUrl: track.preview_url || "",
      spotifyUrl: track.external_urls.spotify,
      youtubeUrl: "",
      startTime: 0,
    });
    setSearchResults([]);
    setSearchQuery("");
  }, []);

  // Fetch songs
  const fetchSongs = useCallback(async () => {
    try {
      setLoading(true);
      const songsCollection = collection(db, "playlists");
      const q = query(songsCollection, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Song[];
      setSongs(data);
    } catch (error: any) {
      console.error("Gagal mengambil songs:", error);
      alert("Gagal memuat playlist. Cek Firebase config!");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSongs();
  }, [fetchSongs]);

  // Audio player controls
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : audioVolume;
    }
  }, [audioVolume, isMuted]);

  // Update current time
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
    };
  }, []);

  const togglePlay = useCallback((song: Song) => {
    if (!song.previewUrl) {
      alert("Preview tidak tersedia untuk lagu ini");
      return;
    }

    if (currentPlaying === song.id) {
      audioRef.current?.pause();
      setCurrentPlaying(null);
    } else {
      if (audioRef.current) {
        audioRef.current.src = song.previewUrl;
        audioRef.current.currentTime = song.startTime || 0;
        audioRef.current.play();
        setCurrentPlaying(song.id);
      }
    }
  }, [currentPlaying]);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  }, []);

  const skipTime = useCallback((seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds));
    }
  }, [duration]);

  const handleAudioEnd = useCallback(() => {
    setCurrentPlaying(null);
  }, []);

  const handleAdminLogin = useCallback(() => {
    if (adminPassword === ADMIN_PASSWORD) {
      setIsAdminMode(true);
      setShowAdminLogin(false);
      setAdminPassword("");
    } else {
      alert("Password salah!");
      setAdminPassword("");
    }
  }, [adminPassword, ADMIN_PASSWORD]);

  const handleSubmit = useCallback(async () => {
    if (!formData.title || !formData.artist || !formData.spotifyUrl) {
      alert("Isi minimal Title, Artist, dan Spotify URL!");
      return;
    }

    try {
      setUploading(true);
      const songData = {
        title: formData.title,
        artist: formData.artist,
        album: formData.album,
        imageUrl: formData.imageUrl,
        previewUrl: formData.previewUrl,
        spotifyUrl: formData.spotifyUrl,
        youtubeUrl: formData.youtubeUrl || "",
        startTime: formData.startTime || 0,
        createdAt: editingSong?.createdAt || serverTimestamp(),
      };

      if (editingSong) {
        await updateDoc(doc(db, "playlists", editingSong.id), songData);
      } else {
        await addDoc(collection(db, "playlists"), songData);
      }

      resetForm();
      await fetchSongs();
      alert(editingSong ? "Lagu berhasil diupdate!" : "Lagu berhasil ditambah!");
    } catch (error: any) {
      console.error("Error:", error);
      alert(`Gagal: ${error.message}`);
    } finally {
      setUploading(false);
    }
  }, [formData, editingSong, fetchSongs]);

  const handleDelete = useCallback(async (song: Song) => {
    if (!confirm(`Hapus "${song.title}"?`)) return;

    try {
      await deleteDoc(doc(db, "playlists", song.id));
      if (currentPlaying === song.id) {
        audioRef.current?.pause();
        setCurrentPlaying(null);
      }
      fetchSongs();
      alert("Lagu berhasil dihapus!");
    } catch (error: any) {
      console.error("Gagal menghapus lagu:", error);
      alert("Gagal menghapus lagu.");
    }
  }, [currentPlaying, fetchSongs]);

  const handleEdit = useCallback((song: Song) => {
    setEditingSong(song);
    setFormData({
      title: song.title,
      artist: song.artist,
      album: song.album,
      imageUrl: song.imageUrl,
      previewUrl: song.previewUrl,
      spotifyUrl: song.spotifyUrl,
      youtubeUrl: song.youtubeUrl || "",
      startTime: song.startTime || 0,
    });
    setShowAddModal(true);
  }, []);

  const resetForm = useCallback(() => {
    setFormData({
      title: "",
      artist: "",
      album: "",
      imageUrl: "",
      previewUrl: "",
      spotifyUrl: "",
      youtubeUrl: "",
      startTime: 0,
    });
    setEditingSong(null);
    setShowAddModal(false);
    setSearchResults([]);
    setSearchQuery("");
  }, []);

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentSong = songs.find(s => s.id === currentPlaying);

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
  };

  const scaleIn = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  };

  return (
    <main className="min-h-screen bg-gray-950 relative overflow-hidden pb-32">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-purple-950/30" />
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl" />
      </div>

      {/* Audio Element */}
      <audio ref={audioRef} onEnded={handleAudioEnd} />

      {/* Admin Button */}
      {!isAdminMode && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setShowAdminLogin(!showAdminLogin)}
          className="fixed top-4 right-4 bg-gray-800/80 backdrop-blur-xl border border-gray-700 rounded-full p-3 hover:bg-gray-700/80 transition-all z-50 hover:scale-110 active:scale-95"
        >
          <Lock className="w-5 h-5 text-gray-300" />
        </motion.button>
      )}

      {/* Mini Player - Fixed Bottom */}
      <AnimatePresence>
        {currentPlaying && currentSong && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur-xl border-t-2 border-gray-800 z-50 px-4 py-4"
          >
            <div className="max-w-7xl mx-auto">
              {/* Progress Bar */}
              <div className="mb-3">
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1 bg-gray-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-purple-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Song Info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <img
                    src={currentSong.imageUrl}
                    alt={currentSong.title}
                    className="w-12 h-12 rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold truncate text-sm">{currentSong.title}</p>
                    <p className="text-gray-400 text-xs truncate">{currentSong.artist}</p>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => skipTime(-5)}
                    className="text-gray-300 hover:text-white transition-colors p-2"
                  >
                    <SkipBack className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => togglePlay(currentSong)}
                    className="bg-purple-600 text-white p-3 rounded-full hover:bg-purple-700 transition-colors"
                  >
                    <Pause className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => skipTime(5)}
                    className="text-gray-300 hover:text-white transition-colors p-2"
                  >
                    <SkipForward className="w-5 h-5" />
                  </button>
                </div>

                {/* Volume Control */}
                <div className="hidden md:flex items-center gap-2">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={audioVolume}
                    onChange={(e) => setAudioVolume(parseFloat(e.target.value))}
                    className="w-24 h-1 bg-gray-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Login Modal */}
      <AnimatePresence>
        {showAdminLogin && (
          <motion.div
            {...scaleIn}
            transition={{ duration: 0.2 }}
            className="fixed top-20 right-4 bg-gray-900/95 backdrop-blur-xl border-2 border-gray-700 rounded-2xl p-6 shadow-2xl z-50 w-72"
          >
            <h3 className="text-white font-bold mb-4">Admin Login</h3>
            <input
              type="password"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()}
              placeholder="Masukkan password"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white mb-3 focus:outline-none focus:border-purple-500"
            />
            <button
              onClick={handleAdminLogin}
              className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors active:scale-95"
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
              {...scaleIn}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900/95 backdrop-blur-xl border-2 border-gray-700 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {editingSong ? "Edit Lagu" : "Tambah Lagu Baru"}
                </h2>
                <button onClick={resetForm} className="text-gray-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Spotify Search */}
              {!editingSong && (
                <div className="mb-6 p-4 bg-gray-800/50 rounded-2xl border border-gray-700">
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    🎵 Cari Lagu di Spotify
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && searchSpotify()}
                      placeholder="Contoh: Shape of You Ed Sheeran"
                      className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                    />
                    <button
                      onClick={searchSpotify}
                      disabled={searching}
                      className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {searching ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Search className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {/* Search Results */}
                  {searchResults.length > 0 && (
                    <div className="mt-4 max-h-60 overflow-y-auto space-y-2">
                      {searchResults.map((track) => (
                        <button
                          key={track.id}
                          onClick={() => selectSong(track)}
                          className="w-full flex items-center gap-3 p-3 bg-gray-800 hover:bg-gray-750 rounded-xl transition-colors text-left"
                        >
                          <img
                            src={track.album.images[2]?.url}
                            alt={track.name}
                            className="w-12 h-12 rounded-lg"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium truncate">{track.name}</p>
                            <p className="text-gray-400 text-sm truncate">
                              {track.artists.map(a => a.name).join(", ")}
                            </p>
                          </div>
                          <Check className="w-5 h-5 text-green-500" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Manual Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Judul Lagu *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                    placeholder="Contoh: Shape of You"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Artist *
                  </label>
                  <input
                    type="text"
                    value={formData.artist}
                    onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                    placeholder="Contoh: Ed Sheeran"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Album
                  </label>
                  <input
                    type="text"
                    value={formData.album}
                    onChange={(e) => setFormData({ ...formData, album: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                    placeholder="Contoh: ÷ (Divide)"
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    URL Cover Image
                  </label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Preview Audio URL (30 detik)
                  </label>
                  <input
                    type="url"
                    value={formData.previewUrl}
                    onChange={(e) => setFormData({ ...formData, previewUrl: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    ⏰ Mulai Preview Dari (detik) - Atur bagian enak lagu!
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: parseInt(e.target.value) || 0 })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                    placeholder="0"
                  />
                  <p className="text-gray-500 text-xs mt-1">
                    Contoh: Isi 10 untuk mulai dari detik ke-10 (drop/chorus)
                  </p>
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Spotify URL *
                  </label>
                  <input
                    type="url"
                    value={formData.spotifyUrl}
                    onChange={(e) => setFormData({ ...formData, spotifyUrl: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                    placeholder="https://open.spotify.com/track/..."
                  />
                </div>

                <div>
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    YouTube URL (Opsional)
                  </label>
                  <input
                    type="url"
                    value={formData.youtubeUrl}
                    onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSubmit}
                    disabled={uploading}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold py-3 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        {editingSong ? "Update" : "Tambah"} Lagu
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
        <motion.div {...fadeIn} className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-black text-white mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
            My Playlist
          </h1>
          <div className="h-1.5 w-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-6"></div>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            My daily soundtrack — coding, chilling, and everything in between.
          </p>
        </motion.div>

        {/* Admin Controls */}
        {isAdminMode && (
          <motion.div {...fadeIn} className="mb-8 flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2 shadow-lg hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              Tambah Lagu
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

        {/* Songs Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
            <p className="text-gray-400 mt-4">Memuat playlist...</p>
          </div>
        ) : songs.length === 0 ? (
          <div className="text-center py-20">
            <Music className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Belum ada lagu di playlist</p>
            {isAdminMode && (
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 text-purple-400 hover:text-purple-300 transition-colors"
              >
                Tambah lagu pertama
              </button>
            )}
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
            <AnimatePresence mode="popLayout">
              {songs.map((song, index) => (
                <motion.div
                  key={song.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                  whileHover={{ y: -6, scale: 1.02 }}
                  className="group relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10 blur-xl group-hover:blur-2xl transition-all rounded-2xl md:rounded-3xl" />
                  <div className="relative bg-gray-900/80 backdrop-blur-xl rounded-2xl md:rounded-3xl border-2 border-gray-800 hover:border-gray-700 transition-all overflow-hidden">
                    {/* Cover Image */}
                    <div className="relative w-full aspect-square">
                      {song.imageUrl ? (
                        <img
                          src={song.imageUrl}
                          alt={song.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                          <Music className="w-12 md:w-16 h-12 md:h-16 text-gray-600" />
                        </div>
                      )}
                      
                      {/* Play Button Overlay */}
                      {song.previewUrl && (
                        <button
                          onClick={() => togglePlay(song)}
                          className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          {currentPlaying === song.id ? (
                            <Pause className="w-12 md:w-16 h-12 md:h-16 text-white" />
                          ) : (
                            <Play className="w-12 md:w-16 h-12 md:h-16 text-white" />
                          )}
                        </button>
                      )}
                      
                      {/* Now Playing Indicator */}
                      {currentPlaying === song.id && (
                        <div className="absolute top-2 md:top-4 right-2 md:right-4 bg-green-500 text-white px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-bold flex items-center gap-1 md:gap-2">
                          <div className="w-1.5 md:w-2 h-1.5 md:h-2 bg-white rounded-full animate-pulse" />
                          Playing
                        </div>
                      )}
                    </div>

                    {/* Song Info */}
                    <div className="p-3 md:p-6">
                      <h3 className="text-sm md:text-xl font-bold text-white mb-1 line-clamp-1">
                        {song.title}
                      </h3>
                      <p className="text-gray-400 text-xs md:text-sm mb-1 line-clamp-1">{song.artist}</p>
                      {song.album && (
                        <p className="text-gray-500 text-[10px] md:text-xs mb-3 md:mb-4 line-clamp-1">{song.album}</p>
                      )}
                      
                      <div className="flex gap-1.5 md:gap-2 flex-wrap">
                        <a
                          href={song.spotifyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 min-w-[60px] bg-green-600/20 border border-green-500/30 text-green-400 px-2 md:px-4 py-1.5 md:py-2.5 rounded-lg md:rounded-xl hover:bg-green-600/30 transition-all flex items-center justify-center gap-1 md:gap-2 text-[10px] md:text-sm font-medium"
                        >
                          <ExternalLink className="w-3 md:w-4 h-3 md:h-4" />
                          <span className="hidden md:inline">Spotify</span>
                        </a>
                        {song.youtubeUrl && (
                          <a
                            href={song.youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-red-600/20 border border-red-500/30 text-red-400 px-2 md:px-4 py-1.5 md:py-2.5 rounded-lg md:rounded-xl hover:bg-red-600/30 transition-all"
                          >
                            <ExternalLink className="w-3 md:w-4 h-3 md:h-4" />
                          </a>
                        )}
                        {isAdminMode && (
                          <>
                            <button
                              onClick={() => handleEdit(song)}
                              className="bg-yellow-600/20 border border-yellow-500/30 text-yellow-400 px-2 md:px-4 py-1.5 md:py-2.5 rounded-lg md:rounded-xl hover:bg-yellow-600/30 transition-all"
                            >
                              <Edit className="w-3 md:w-4 h-3 md:h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(song)}
                              className="bg-red-600/20 border border-red-500/30 text-red-400 px-2 md:px-4 py-1.5 md:py-2.5 rounded-lg md:rounded-xl hover:bg-red-600/30 transition-all"
                            >
                              <Trash2 className="w-3 md:w-4 h-3 md:h-4" />
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