"use client";

import React, { useState, useRef } from "react";
import { Plus, Trash2, Edit, Save, X, Image as ImageIcon, UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/supabase/client";
import { uploadImageAction } from "./actions";

// ─── Reusable Image Upload Picker ────────────────────────────────────────────
function ImageUploadPicker({
  value,
  onChange,
  bucket = "wellness-images",
}: {
  value: string;
  onChange: (url: string) => void;
  bucket?: string;
}) {
  // const supabase = createClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${ext}`;

      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", bucket);
      formData.append("fileName", fileName);

      const publicUrl = await uploadImageAction(formData);

      onChange(publicUrl);
    } catch (err: any) {
      console.error("Image upload error:", err);
      const errorMessage = err.message || "Upload failed. Please try again.";
      setError(errorMessage);
      alert(`Upload Failed: ${errorMessage}`);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail Image</label>

      {value ? (
        /* ── Preview with hover overlay ── */
        <div className="relative group w-full h-40 rounded-xl overflow-hidden border border-gray-200 bg-gray-100">
          <img src={value} alt="Thumbnail preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <label className="cursor-pointer bg-white text-gray-900 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              Change
              <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={uploading} />
            </label>
            <button
              type="button"
              onClick={() => onChange("")}
              className="bg-red-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-red-600 transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        /* ── Upload drop zone ── */
        <label className={`flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
          uploading ? "border-purple-300 bg-purple-50" : "border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-300"
        }`}>
          <div className="flex flex-col items-center gap-2 text-center px-4">
            {uploading ? (
              <>
                <div className="w-6 h-6 border-2 border-[#9c6fbd] border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-medium text-[#9c6fbd]">Uploading...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-7 h-7 text-gray-400" />
                <span className="text-xs font-semibold text-gray-600">Click to choose image</span>
                <span className="text-[10px] text-gray-400">JPG, PNG, WEBP</span>
              </>
            )}
          </div>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={uploading} />
        </label>
      )}

      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
interface AdminWellnessClientProps {
  initialAffirmation: string;
  initialPosts: any[];
}

export default function AdminWellnessClient({ initialAffirmation, initialPosts }: AdminWellnessClientProps) {
  const router = useRouter();
  const supabase = createClient();

  const [posts, setPosts] = useState(initialPosts);
  const [affirmation, setAffirmation] = useState(initialAffirmation);
  const [isSavingAffirmation, setIsSavingAffirmation] = useState(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    image_url: "",
    category: "Mental Health"
  });

  const [isSaving, setIsSaving] = useState(false);

  const categories = ["Mental Health", "Fitness", "Motivation"];

  const handleSaveAffirmation = async () => {
    setIsSavingAffirmation(true);
    const { error } = await supabase
      .from("wellness_settings")
      .upsert({ id: 1, affirmation_quote: affirmation });
      
    setIsSavingAffirmation(false);
    if (error) {
      alert("Failed to save affirmation quote");
    } else {
      router.refresh();
    }
  };

  const handleOpenModal = (post: any = null) => {
    if (post) {
      setEditingPost(post);
      setFormData({
        title: post.title,
        content: post.content,
        image_url: post.image_url || "",
        category: post.category
      });
    } else {
      setEditingPost(null);
      setFormData({
        title: "",
        content: "",
        image_url: "",
        category: "Mental Health"
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPost(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    if (editingPost) {
      const { data, error } = await supabase
        .from("wellness_posts")
        .update({
          title: formData.title,
          content: formData.content,
          image_url: formData.image_url,
          category: formData.category
        })
        .eq("id", editingPost.id)
        .select();

      if (!error && data) {
        setPosts(posts.map(p => p.id === editingPost.id ? data[0] : p));
        handleCloseModal();
      } else {
        alert("Error updating post");
      }
    } else {
      const { data, error } = await supabase
        .from("wellness_posts")
        .insert([{
          title: formData.title,
          content: formData.content,
          image_url: formData.image_url,
          category: formData.category
        }])
        .select();

      if (!error && data) {
        setPosts([data[0], ...posts]);
        handleCloseModal();
      } else {
        alert("Error creating post");
      }
    }
    setIsSaving(false);
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    
    const { error } = await supabase
      .from("wellness_posts")
      .delete()
      .eq("id", id);
      
    if (!error) {
      setPosts(posts.filter(p => p.id !== id));
      router.refresh();
    } else {
      alert("Error deleting post");
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto font-sans">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Wellness Page</h1>
          <p className="text-gray-500 mt-1">Update the affirmation quote and manage essays.</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="bg-[#9c6fbd] hover:bg-[#7A4B86] text-white">
          <Plus className="w-4 h-4 mr-2" />
          New Post
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Settings Column */}
        <div className="lg:col-span-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Daily Affirmation</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Affirmation Quote</label>
                <Textarea 
                  value={affirmation}
                  onChange={(e) => setAffirmation(e.target.value)}
                  placeholder="Enter a daily quote..."
                  className="min-h-[100px] border-gray-200 focus:ring-[#E3C5EE]"
                />
              </div>
              <Button 
                onClick={handleSaveAffirmation} 
                disabled={isSavingAffirmation}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white"
              >
                {isSavingAffirmation ? "Saving..." : "Save Affirmation"}
              </Button>
            </div>
          </div>
        </div>

        {/* Posts Column */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Wellness Posts</h2>
            </div>
            
            <div className="divide-y divide-gray-100">
              {posts.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No posts yet. Create one to get started.</div>
              ) : (
                posts.map(post => (
                  <div key={post.id} className="p-6 flex items-start gap-4 hover:bg-gray-50 transition-colors">
                    <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-200">
                      {post.image_url ? (
                        <img src={post.image_url} alt={post.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-grow">
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#9c6fbd] bg-[#E3C5EE]/30 px-2 py-0.5 rounded-full">
                            {post.category}
                          </span>
                          <h3 className="text-lg font-bold text-gray-900 mt-1">{post.title}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleOpenModal(post)} className="p-2 text-gray-400 hover:text-blue-500 transition-colors bg-white border border-gray-200 rounded-full hover:border-blue-200">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(post.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors bg-white border border-gray-200 rounded-full hover:border-red-200">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-gray-500 text-sm mt-2 line-clamp-2">{post.content}</p>
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(post.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Create/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingPost ? "Edit Post" : "Create New Post"}
              </h2>
              <button onClick={handleCloseModal} className="p-2 text-gray-400 hover:text-gray-900 bg-gray-50 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <Input 
                  required 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="E.g., The Power of Morning Meditation"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select 
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full h-10 px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#E3C5EE]"
                >
                  {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              {/* Image Upload Picker replaces URL text input */}
              <ImageUploadPicker
                value={formData.image_url}
                onChange={(url) => setFormData({...formData, image_url: url})}
                bucket="wellness-images"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content (Essay)</label>
                <Textarea 
                  required 
                  value={formData.content}
                  onChange={(e) => setFormData({...formData, content: e.target.value})}
                  placeholder="Write your essay here..."
                  className="min-h-[200px]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <Button type="button" variant="outline" onClick={handleCloseModal}>Cancel</Button>
                <Button type="submit" disabled={isSaving} className="bg-[#9c6fbd] hover:bg-[#7A4B86] text-white">
                  {isSaving ? "Saving..." : editingPost ? "Update Post" : "Publish Post"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
