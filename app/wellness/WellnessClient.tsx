"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Search, Check, X, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Premium Unsplash placeholders
const DEFAULT_POSTS = [
  {
    id: "w1",
    title: "The Power of Morning Meditation",
    content: "Starting your day with 10 minutes of silence can drastically improve your focus and reduce anxiety. It sets a calm tone for the rest of the day, allowing you to react to challenges rather than impulsively responding. Find a comfortable spot, focus on your breath, and let go of yesterday's worries. This simple practice can transform your life.",
    image_url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800",
    category: "Mental Health",
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "w2",
    title: "Strength Training: Beyond the Physical",
    content: "Lifting weights isn't just about building muscle; it's about building resilience. The mental fortitude required to push through that last rep translates into every aspect of life. You learn that discomfort is temporary and that growth happens precisely when you want to quit. Consistency is key. Show up, even when you don't feel like it.",
    image_url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=800",
    category: "Fitness",
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "w3",
    title: "Finding Your 'Why'",
    content: "Motivation often wanes when the goal isn't anchored to a deeper purpose. Take time to reflect on why you started your journey. Is it for your family? Your long-term health? Or simply to prove to yourself that you can? Write it down and look at it every morning. When the 'why' is strong enough, you can figure out any 'how'.",
    image_url: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&q=80&w=800",
    category: "Motivation",
    created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  }
];

interface WellnessClientProps {
  initialAffirmation: string;
  initialPosts: any[];
  dbConnected: boolean;
}

export default function WellnessClient({ initialAffirmation, initialPosts, dbConnected }: WellnessClientProps) {
  const router = useRouter();

  const [posts] = useState(
    initialPosts || []
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedPost, setSelectedPost] = useState<any | null>(null);

  const filteredPosts = posts.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ["All", "Mental Health", "Fitness", "Motivation"];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-[#E3C5EE] selection:text-black">
      {/* HEADER NAVBAR */}
      <nav className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-gray-100">
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-black transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Home</span>
        </button>

        {!dbConnected && (
          <div className="flex items-center gap-1.5 text-xs bg-amber-50 text-amber-600 px-3 py-1 rounded-full border border-amber-200">
            <span>Offline Fallback Active</span>
          </div>
        )}
      </nav>

      {/* HERO SECTION */}
      <header className="max-w-7xl mx-auto px-6 pt-16 pb-20 overflow-hidden flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
        {/* Left Content */}
        <div className="flex-1 space-y-6 z-10 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center lg:justify-start"
          >
            <span className="bg-[#E3C5EE]/20 border border-[#E3C5EE] text-[#7A4B86] px-4 py-1.5 rounded-full text-xs font-bold tracking-wider flex items-center gap-1.5 w-fit">
              <span>Your Daily Wellness</span>
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl md:text-4xl lg:text-[3rem] font-bold tracking-tight text-slate-900 leading-[1.1]"
          >
            Nourish Your <br />
            <span className="text-4xl md:text-5xl lg:text-[4rem] text-transparent bg-clip-text bg-gradient-to-r from-[#9c6fbd] to-[#E3C5EE]">Mind & Body</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="max-w-xl mx-auto lg:mx-0 mt-6"
          >
            <p className="text-lg md:text-xl text-slate-600 leading-relaxed ">
              "{initialAffirmation}"
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-6"
          >

            <Button variant="outline" className="hover:b-2 hover:border-slate-800 bg-[#9c6fbd] text-[#ffff] hover:bg-transparent hover:text-slate-900  font-medium px-6 py-6 text-base gap-2 w-full sm:w-auto">
              <span></span> Explore articles
            </Button>
          </motion.div>
        </div>

        {/* Right Collage Content - Mobile/Tablet (Visible on < lg) */}
        <div className="block lg:hidden flex-1 w-full mt-12 max-w-md mx-auto">
          <div className="grid grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="col-span-2 relative aspect-video rounded-3xl overflow-hidden shadow-xl"
            >
              <img src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=800" alt="Fitness" className="w-full h-full object-cover mix-blend-multiply bg-[#E3C5EE]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <div className="bg-white/95 backdrop-blur-md p-3 rounded-2xl flex items-center justify-between shadow-lg border border-white/50">
                  <div>
                    <p className="text-[10px] text-gray-500 mb-0.5 font-medium uppercase tracking-wider">Wellness articles</p>
                    <span className="text-xl font-black text-slate-900 leading-none">Find Yourself</span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white shadow-md">
                    <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative aspect-square rounded-3xl overflow-hidden shadow-lg border-4 border-white bg-slate-100"
            >
              <img src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800" alt="Meditation" className="w-full h-full object-cover mix-blend-multiply opacity-90" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-[#7A4B86] rounded-3xl p-5 flex flex-col items-center justify-center text-center shadow-lg relative overflow-hidden border-4 border-white"
            >
              <div className="absolute top-2 right-2 opacity-20">
                <svg viewBox="0 0 120 80" fill="none" className="w-12 h-12">
                  <path d="M10 15 L 110 15 L 50 40 L 110 40 L 30 65 L 100 65" stroke="#E3C5EE" strokeWidth="14" strokeLinejoin="miter" strokeLinecap="square" />
                </svg>
              </div>
              <span className="text-3xl font-black text-white relative z-10 leading-none mb-1">New</span>
              <span className="text-[10px] font-bold text-[#E3C5EE] relative z-10 uppercase tracking-widest">Articles</span>
            </motion.div>
          </div>
        </div>

        {/* Right Collage Content - Desktop (Visible on >= lg) */}
        <div className="hidden lg:block flex-1 relative w-full h-[600px]">
          {/* Main Image 1 (Left) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="absolute left-[5%] top-[10%] w-[45%] aspect-[4/5] z-10 border-4 border-white shadow-xl bg-slate-100"
          >
            <img
              src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800"
              alt="Meditation"
              className="w-full h-full object-cover mix-blend-multiply opacity-90"
            />
          </motion.div>

          {/* Main Image 2 (Right) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="absolute right-[5%] bottom-[15%] w-[55%] aspect-[3/4] z-0 bg-[#E3C5EE]"
          >
            <img
              src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&q=80&w=800"
              alt="Fitness"
              className="w-full h-full object-cover mix-blend-multiply opacity-90"
            />
            {/* Badge */}
            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-[#7A4B86] rounded-full border-4 border-white flex flex-col items-center justify-center text-white text-xs font-bold shadow-lg z-20">
              <span className="text-lg">New</span>
              <span>Articles</span>
              <div className="absolute inset-1 border border-white/30 rounded-full" />
              <div className="absolute -inset-2 border border-[#7A4B86]/40 rounded-full" />
            </div>
          </motion.div>

          {/* Stats Card (Top Right) */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="absolute right-[0%] top-[0%] bg-slate-900 text-white p-5 shadow-2xl z-20 w-56 border-4 border-white"
          >
            <p className="text-sm text-gray-400 mb-1">Wellness Articles</p>
            <div className="flex items-end gap-3 mb-4">
              <span className="text-3xl font-bold">Find Yourself</span>
              <span className="text-[10px] text-gray-500 mb-1 uppercase tracking-wider">View more</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-400">Source</span>
              <span className="font-semibold text-white flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-[#E3C5EE]" />
                myFit
              </span>
            </div>
          </motion.div>

          {/* Audio/Waveform Card (Bottom Left) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="absolute left-[-5%] bottom-[30%] bg-white p-4 shadow-xl z-20 border border-gray-100 flex items-center gap-4 w-64"
          >
            <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white pl-0.5 shadow-md flex-shrink-0">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            </div>
            <div className="flex-1 flex items-center justify-between gap-1 h-6">
              {[40, 70, 40, 100, 60, 30, 80, 50, 90, 40, 70, 30, 60].map((h, i) => (
                <div key={i} className="w-1 bg-[#9c6fbd] rounded-full opacity-80" style={{ height: `${h}%` }} />
              ))}
            </div>
          </motion.div>

          {/* Decorative Zigzag */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.7 }}
            className="absolute left-[15%] bottom-[5%] z-0"
          >
            <svg viewBox="0 0 120 80" fill="none" className="w-[120px] h-[80px]">
              <path d="M10 15 L 110 15 L 50 40 L 110 40 L 30 65 L 100 65" stroke="#E3C5EE" strokeWidth="14" strokeLinejoin="miter" strokeLinecap="square" />
            </svg>
          </motion.div>
        </div>
      </header>

      {/* WELLNESS FEED */}
      <section className="max-w-7xl mx-auto px-6 py-16 border-t border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-12 gap-6">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">Discover Wellness</h2>
            <p className="text-gray-500 text-sm mt-2">Read our latest essays on mental health, fitness, and staying motivated.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="relative w-full sm:w-[240px]">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 text-sm rounded-full placeholder-gray-400 w-full focus:border-[#E3C5EE] focus:ring-1 focus:ring-[#E3C5EE] border-gray-200"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide w-full max-w-full -mx-4 px-4 sm:mx-0 sm:px-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs font-bold py-2 px-4 rounded-full border transition-all whitespace-nowrap ${selectedCategory === cat
                    ? "bg-[#E3C5EE] border-[#E3C5EE] text-black shadow-md shadow-[#E3C5EE]/30"
                    : "bg-white border-gray-200 text-gray-600 hover:text-black hover:border-[#E3C5EE]"
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filteredPosts.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 border border-gray-100 rounded-3xl">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-800">No posts yet</h3>
            <p className="text-gray-500 text-sm mt-2">Try searching for something else or adjusting your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <motion.div
                key={post.id}
                layoutId={`post-card-${post.id}`}
                onClick={() => setSelectedPost(post)}
                className="bg-white rounded-3xl shadow-sm hover:shadow-xl border border-gray-100 hover:border-[#E3C5EE]/50 cursor-pointer group transition-all flex flex-col overflow-hidden"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={post.image_url}
                    alt={post.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm text-black text-[10px] font-bold tracking-wider uppercase px-3 py-1.5 rounded-full shadow-sm">
                    {post.category}
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex-grow">
                    <h3 className="text-xl font-bold text-slate-900 leading-snug group-hover:text-[#9c6fbd] transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-500 text-sm mt-3 line-clamp-3 leading-relaxed">
                      {post.content}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-medium text-gray-400">
                    <span>{formatDate(post.created_at)}</span>
                    <span className="text-[#9c6fbd] group-hover:translate-x-1 transition-transform">Read more →</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* POST DETAIL MODAL */}
      <AnimatePresence>
        {selectedPost && (
          <div className="fixed inset-0 bg-white/95 backdrop-blur-md z-50 overflow-y-auto">
            <div className="min-h-screen px-4 py-12 md:py-20 flex justify-center">
              <motion.div
                layoutId={`post-card-${selectedPost.id}`}
                className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden relative"
              >
                <button
                  onClick={() => setSelectedPost(null)}
                  className="absolute top-4 right-4 md:top-6 md:right-6 bg-black/5 hover:bg-black/10 rounded-full p-2 text-black transition-colors z-30"
                >
                  <X className="w-6 h-6" />
                </button>

                <div className="h-[250px] md:h-[400px] relative w-full">
                  <img
                    src={selectedPost.image_url}
                    alt={selectedPost.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 right-6">
                    <span className="bg-[#E3C5EE] text-black text-xs font-bold tracking-wider uppercase px-3 py-1 rounded-full shadow-sm mb-3 inline-block">
                      {selectedPost.category}
                    </span>
                    <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                      {selectedPost.title}
                    </h1>
                  </div>
                </div>

                <div className="p-6 md:p-12 max-w-3xl mx-auto">
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-8 border-b border-gray-100 pb-8">
                    <span className="font-medium text-black">myFit Editorial</span>
                    <span>•</span>
                    <span>{formatDate(selectedPost.created_at)}</span>
                  </div>

                  <div className="prose prose-lg prose-slate max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap font-serif">
                    {selectedPost.content}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
