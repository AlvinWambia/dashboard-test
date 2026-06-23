"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveProgram } from '@/app/actions/programActions';
import { createClient } from '@/supabase/client';
import { toast } from 'sonner';
import { 
  ArrowLeft, Save, Plus, Trash2, Image as ImageIcon, 
  Settings, HelpCircle, FileText, LayoutDashboard, Video, MapPin, UploadCloud
} from 'lucide-react';
import Link from 'next/link';

export default function BuilderForm({ initialData, programId }) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [program, setProgram] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
    image_url: initialData.image_url || '',
    paystack_plan_code: initialData.paystack_plan_code || '',
    price: initialData.price || 0,
    is_active: initialData.is_active !== false,
    has_digital_downloads: initialData.has_digital_downloads || false,
    has_dashboard_access: initialData.has_dashboard_access || false,
    has_online_consultations: initialData.has_online_consultations || false,
    has_physical_sessions: initialData.has_physical_sessions || false,
    booking_url: initialData.booking_url || '',
    location_details: initialData.location_details || '',
  });

  const [faqs, setFaqs] = useState(initialData.faqs || []);
  const [assets, setAssets] = useState(initialData.assets || []);

  const handleAssetUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const supabase = createClient();
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('program-documents')
        .upload(fileName, file);

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from('program-documents')
        .getPublicUrl(fileName);

      setAssets(prev => [...prev, {
        file_name: file.name,
        file_url: publicUrlData.publicUrl,
        file_type: file.type
      }]);
      toast.success("Document uploaded successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload document");
    } finally {
      setIsUploading(false);
    }
  };

  const removeAsset = (index) => {
    const newAssets = [...assets];
    newAssets.splice(index, 1);
    setAssets(newAssets);
  };


  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const supabase = createClient();
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('program-images')
        .upload(fileName, file);

      if (error) throw error;

      const { data: publicUrlData } = supabase.storage
        .from('program-images')
        .getPublicUrl(fileName);

      setProgram(prev => ({ ...prev, image_url: publicUrlData.publicUrl }));
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!program.title) {
      toast.error("Program title is required");
      return;
    }

    setIsSaving(true);
    const dataToSave = {
      ...program,
      faqs,
      assets
    };

    const result = await saveProgram(programId, dataToSave);
    
    if (result.success) {
      toast.success("Program saved successfully!");
      if (!programId) {
        router.push(`/admin/programs/builder?id=${result.id}`);
      } else {
        router.refresh();
      }
    } else {
      toast.error(result.error || "Failed to save program");
    }
    setIsSaving(false);
  };

  // FAQs Management
  const addFaq = () => {
    setFaqs([...faqs, { question: '', answer: '' }]);
  };

  const removeFaq = (index) => {
    const newFaqs = [...faqs];
    newFaqs.splice(index, 1);
    setFaqs(newFaqs);
  };

  const updateFaq = (index, field, value) => {
    const newFaqs = [...faqs];
    newFaqs[index][field] = value;
    setFaqs(newFaqs);
  };

  return (
    <div className="space-y-8">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-100 sticky top-4 z-10">
        <Link href="/admin/programs" className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black transition-colors px-2">
          <ArrowLeft size={16} /> Back to Programs
        </Link>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
            <input 
              type="checkbox" 
              checked={program.is_active}
              onChange={(e) => setProgram({...program, is_active: e.target.checked})}
              className="rounded border-gray-300 text-black focus:ring-black"
            />
            Active (Visible)
          </label>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-xl font-medium flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : <><Save size={18} /> Save Program</>}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: General Info */}
        <div className="space-y-6">
          {/* Basic Details */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-5">
            <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
              <Settings size={20} className="text-gray-400" />
              <h2 className="text-lg font-bold">General Settings</h2>
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Program Title *</label>
              <input 
                type="text" 
                value={program.title}
                onChange={e => setProgram({...program, title: e.target.value})}
                placeholder="e.g. 12-Week Transformation"
                className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Description</label>
              <textarea 
                value={program.description}
                onChange={e => setProgram({...program, description: e.target.value})}
                placeholder="Brief summary of the program..."
                rows={3}
                className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Paystack Plan Code</label>
              <input 
                type="text" 
                value={program.paystack_plan_code}
                onChange={e => setProgram({...program, paystack_plan_code: e.target.value})}
                placeholder="PLN_xxxxxxxxxxxx"
                className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black font-mono"
              />
              <p className="text-xs text-gray-400 mt-1">Leave blank if this program does not require a subscription.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Price (e.g. KES)</label>
              <input 
                type="number" 
                value={program.price}
                onChange={e => setProgram({...program, price: e.target.value})}
                placeholder="0.00"
                className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black"
              />
            </div>
          </div>

          {/* Media Upload */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
             <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
              <ImageIcon size={20} className="text-gray-400" />
              <h2 className="text-lg font-bold">Program Image</h2>
            </div>

            {program.image_url ? (
              <div className="relative group rounded-xl overflow-hidden border border-gray-200 aspect-video">
                <img src={program.image_url} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                   <label className="cursor-pointer bg-white text-black px-4 py-2 rounded-lg text-sm font-medium">
                      Change Image
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                   </label>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full aspect-video border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <ImageIcon className="w-10 h-10 mb-3 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500 font-semibold">{isUploading ? 'Uploading...' : 'Click to upload'}</p>
                  <p className="text-xs text-gray-400">SVG, PNG, JPG</p>
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
              </label>
            )}
          </div>

          {/* FAQs Builder */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
             <div className="flex items-center justify-between border-b border-gray-50 pb-3">
               <div className="flex items-center gap-2">
                 <HelpCircle size={20} className="text-gray-400" />
                 <h2 className="text-lg font-bold">FAQs</h2>
               </div>
               <button 
                 onClick={addFaq}
                 className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded hover:bg-blue-100 transition-colors flex items-center gap-1"
               >
                 <Plus size={14} /> Add FAQ
               </button>
            </div>

            {faqs.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No FAQs added yet.</p>
            ) : (
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-xl border border-gray-200 relative group">
                    <button 
                      onClick={() => removeFaq(index)} 
                      className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 rounded bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14} />
                    </button>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Question</label>
                        <input 
                          type="text" 
                          value={faq.question}
                          onChange={(e) => updateFaq(index, 'question', e.target.value)}
                          placeholder="What is this program about?"
                          className="w-full p-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-black bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Answer</label>
                        <textarea 
                          value={faq.answer}
                          onChange={(e) => updateFaq(index, 'answer', e.target.value)}
                          placeholder="Provide the answer here..."
                          rows={2}
                          className="w-full p-2 border border-gray-200 rounded text-sm focus:outline-none focus:border-black resize-none bg-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Deliverables & Features */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-5">
            <div className="flex items-center gap-2 border-b border-gray-50 pb-3">
              <Settings size={20} className="text-gray-400" />
              <h2 className="text-lg font-bold">Deliverables & Features</h2>
            </div>
            
            <p className="text-sm text-gray-500">Configure what clients receive when they purchase this program.</p>
            
            {/* Dashboard Access */}
            <label className="flex items-start gap-3 p-3 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
              <input 
                type="checkbox" 
                checked={program.has_dashboard_access}
                onChange={(e) => setProgram({...program, has_dashboard_access: e.target.checked})}
                className="mt-1 rounded border-gray-300 text-black focus:ring-black"
              />
              <div>
                <div className="flex items-center gap-2">
                  <LayoutDashboard size={16} className="text-gray-600" />
                  <span className="font-semibold text-sm">Client Dashboard Access</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Clients get access to the private portal.</p>
              </div>
            </label>

            {/* Digital Downloads */}
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                <input 
                  type="checkbox" 
                  checked={program.has_digital_downloads}
                  onChange={(e) => setProgram({...program, has_digital_downloads: e.target.checked})}
                  className="mt-1 rounded border-gray-300 text-black focus:ring-black"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-gray-600" />
                    <span className="font-semibold text-sm">Digital Downloads</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Provide PDFs, guides, or meal plans.</p>
                </div>
              </label>

              {program.has_digital_downloads && (
                <div className="pl-9 pr-3 space-y-3">
                  {assets.length > 0 && (
                    <div className="space-y-2">
                      {assets.map((asset, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded border border-gray-200">
                          <span className="text-sm truncate mr-2">{asset.file_name}</span>
                          <button onClick={() => removeAsset(index)} className="text-red-500 hover:text-red-700">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <label className="block border-2 border-dashed border-gray-200 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                    <UploadCloud size={24} className="mx-auto text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500 font-medium">{isUploading ? 'Uploading...' : 'Click to upload PDFs/Files'}</span>
                    <input type="file" className="hidden" onChange={handleAssetUpload} disabled={isUploading} />
                  </label>
                </div>
              )}
            </div>

            {/* Online Consultations */}
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                <input 
                  type="checkbox" 
                  checked={program.has_online_consultations}
                  onChange={(e) => setProgram({...program, has_online_consultations: e.target.checked})}
                  className="mt-1 rounded border-gray-300 text-black focus:ring-black"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <Video size={16} className="text-gray-600" />
                    <span className="font-semibold text-sm">Online Consultations</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Clients can book 1-on-1 video calls.</p>
                </div>
              </label>

              {program.has_online_consultations && (
                <div className="pl-9 pr-3 space-y-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Booking URL</label>
                  <input 
                    type="url" 
                    value={program.booking_url}
                    onChange={e => setProgram({...program, booking_url: e.target.value})}
                    placeholder="https://calendly.com/your-link"
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black"
                  />
                  <p className="text-[10px] text-gray-400">Enter your Calendly or Acuity scheduling link.</p>
                </div>
              )}
            </div>

            {/* Physical Sessions */}
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                <input 
                  type="checkbox" 
                  checked={program.has_physical_sessions}
                  onChange={(e) => setProgram({...program, has_physical_sessions: e.target.checked})}
                  className="mt-1 rounded border-gray-300 text-black focus:ring-black"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-gray-600" />
                    <span className="font-semibold text-sm">Physical Sessions</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">In-person training or meetups.</p>
                </div>
              </label>

              {program.has_physical_sessions && (
                <div className="pl-9 pr-3 space-y-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Select Location</label>
                  <select 
                    value={program.location_details}
                    onChange={e => setProgram({...program, location_details: e.target.value})}
                    className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black bg-white"
                  >
                    <option value="" disabled>-- Choose a location --</option>
                    <option value="Main Gym - 123 Fitness St">Main Gym - 123 Fitness St</option>
                    <option value="Downtown Studio - 456 Core Ave">Downtown Studio - 456 Core Ave</option>
                    <option value="Westside Field - 789 Park Blvd">Westside Field - 789 Park Blvd</option>
                  </select>
                  <p className="text-[10px] text-gray-400">Select from the approved locations.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
