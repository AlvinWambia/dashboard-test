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
    payment_type: initialData.payment_type || 'subscription',
    billing_interval: initialData.billing_interval || 'monthly',
    price: initialData.price || 0,
    is_active: initialData.is_active !== false,
    has_digital_downloads: initialData.has_digital_downloads || false,
    has_dashboard_access: initialData.has_dashboard_access || false,
    has_online_consultations: initialData.has_online_consultations || false,
    has_online_one_on_one: initialData.has_online_one_on_one || (initialData.has_online_consultations && !initialData.has_online_group) || false,
    has_online_group: initialData.has_online_group || false,
    has_physical_sessions: initialData.has_physical_sessions || false,
    location_details: initialData.location_details || '',
    service_type: initialData.service_type || 'downloadable',
    consultation_fee: initialData.consultation_fee || 0,
    followup_fee: initialData.followup_fee || 0,
  });

  // Track if the admin changed the interval on an existing subscription program with an existing plan
  const originalInterval = initialData.billing_interval || 'monthly';
  const originalPaymentType = initialData.payment_type || 'subscription';
  const isSubscription = program.payment_type === 'subscription';
  const intervalChanged = !!programId && !!initialData.paystack_plan_code && isSubscription && originalPaymentType === 'subscription' && program.billing_interval !== originalInterval;

  const [faqs, setFaqs] = useState(initialData.faqs || []);
  const [assets, setAssets] = useState(initialData.assets || []);

  // Dynamic location management
  const defaultLocations = initialData.location_details
    ? [initialData.location_details]
    : [];
  const [locations, setLocations] = useState(defaultLocations);
  const [newLocationInput, setNewLocationInput] = useState('');
  const [showAddLocation, setShowAddLocation] = useState(false);

  const handleAddLocation = () => {
    const trimmed = newLocationInput.trim();
    if (!trimmed) return;
    if (!locations.includes(trimmed)) {
      setLocations(prev => [...prev, trimmed]);
    }
    setProgram(prev => ({ ...prev, location_details: trimmed }));
    setNewLocationInput('');
    setShowAddLocation(false);
  };

  const handleRemoveLocation = (locToRemove) => {
    setLocations(prev => prev.filter(l => l !== locToRemove));
    if (program.location_details === locToRemove) {
      setProgram(prev => ({ ...prev, location_details: '' }));
    }
  };

  const handleAssetUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const supabase = createClient();
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      
      // Convert file to ArrayBuffer to fix Next.js client-side fetch hanging bug with File objects
      const arrayBuffer = await file.arrayBuffer();

      const { data, error } = await supabase.storage
        .from('program-documents')
        .upload(fileName, arrayBuffer, {
          contentType: file.type,
          upsert: false
        });

      if (error) throw error;

      // We no longer use getPublicUrl since the bucket is private.
      // We store the path and generate signed URLs for authenticated users when needed.
      const filePath = data.path;

      setAssets(prev => [...prev, {
        file_name: file.name,
        file_url: filePath, // Storing path instead of public url
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
      
      // Convert file to ArrayBuffer to fix Next.js client-side fetch hanging bug with File objects
      const arrayBuffer = await file.arrayBuffer();

      const { data, error } = await supabase.storage
        .from('program-images')
        .upload(fileName, arrayBuffer, {
          contentType: file.type,
          upsert: false
        });

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
      assets,
      // Pass the original so the server action can detect an interval change
      original_billing_interval: originalInterval,
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

            {/* Service Delivery Mode */}
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Service Delivery Mode</label>
              <div className="flex rounded-xl border border-gray-200 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setProgram({ ...program, service_type: 'downloadable' })}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-all ${
                    program.service_type === 'downloadable' || !program.service_type
                      ? 'bg-black text-white shadow-inner'
                      : 'bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span>📥</span> Downloadable Plan
                </button>
                <button
                  type="button"
                  onClick={() => setProgram({ ...program, service_type: 'session' })}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-all ${
                    program.service_type === 'session'
                      ? 'bg-black text-white shadow-inner'
                      : 'bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span>🤝</span> Consultation / Session
                </button>
              </div>
            </div>

            {/* Consultation Fee (if Session) */}
            {program.service_type === 'session' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Consultation Fee (Kshs)</label>
                  <input 
                    type="number"
                    min="0"
                    value={program.consultation_fee}
                    onChange={e => setProgram({...program, consultation_fee: parseFloat(e.target.value) || 0})}
                    placeholder="e.g. 500"
                    className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black"
                  />
                  <p className="text-xs text-gray-400 mt-1">Amount charged upfront to book the initial consultation call before buying full sessions.</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Follow-Up Consultation Fee (Kshs)</label>
                  <input 
                    type="number"
                    min="0"
                    value={program.followup_fee}
                    onChange={e => setProgram({...program, followup_fee: parseFloat(e.target.value) || 0})}
                    placeholder="e.g. 300"
                    className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black"
                  />
                  <p className="text-xs text-gray-400 mt-1">Set to 0 to make follow-up consultations free. This applies when a user has already paid for a consultation and needs another meeting.</p>
                </div>
              </div>
            )}

            {/* Purchase Type Toggle */}
            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Purchase Type</label>
              <div className="flex rounded-xl border border-gray-200 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setProgram({ ...program, payment_type: 'subscription' })}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-all ${
                    program.payment_type === 'subscription'
                      ? 'bg-black text-white shadow-inner'
                      : 'bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span>🔁</span> Subscription
                </button>
                <button
                  type="button"
                  onClick={() => setProgram({ ...program, payment_type: 'one_time' })}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold transition-all ${
                    program.payment_type === 'one_time'
                      ? 'bg-black text-white shadow-inner'
                      : 'bg-white text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span>💳</span> One-Time
                </button>
              </div>
            </div>

            {/* Billing Interval — only for subscription programs */}
            {isSubscription ? (
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Billing Interval</label>
                <select
                  value={program.billing_interval}
                  onChange={e => setProgram({...program, billing_interval: e.target.value})}
                  className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black bg-white"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly (every 3 months)</option>
                  <option value="biannually">Biannually (every 6 months)</option>
                  <option value="annually">Annually (every year)</option>
                </select>
                <p className="text-xs text-gray-400 mt-1">How often subscribers will be billed. Set price to 0 for a free program.</p>

                {/* Interval-change warning for existing subscription programs */}
                {intervalChanged && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-3">
                    <p className="text-xs font-bold text-amber-700 mb-1">⚠️ Billing Interval Changed</p>
                    <p className="text-xs text-amber-600">
                      Changing the billing interval will create a <strong>new Paystack plan</strong> for future subscribers.
                      Existing subscribers will <strong>remain on the old plan</strong> and billing interval until they cancel and re-subscribe.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
                <span className="text-blue-400 text-lg leading-none mt-0.5">💳</span>
                <div>
                  <p className="text-xs font-bold text-blue-700 mb-0.5">One-Time Purchase</p>
                  <p className="text-xs text-blue-600">
                    Customers pay a single charge and retain access to this program permanently. No recurring billing.
                  </p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">Price (KES)</label>
              <input 
                type="number" 
                value={program.price}
                onChange={e => setProgram({...program, price: parseFloat(e.target.value) || 0})}
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

            {/* Online One-on-One */}
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                <input 
                  type="checkbox" 
                  checked={program.has_online_one_on_one}
                  onChange={(e) => setProgram({...program, has_online_one_on_one: e.target.checked})}
                  className="mt-1 rounded border-gray-300 text-black focus:ring-black"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <Video size={16} className="text-blue-600" />
                    <span className="font-semibold text-sm">Online One-on-One</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Clients get private 1-on-1 virtual sessions.</p>
                </div>
              </label>
            </div>

            {/* Online Group */}
            <div className="space-y-3">
              <label className="flex items-start gap-3 p-3 border border-gray-100 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                <input 
                  type="checkbox" 
                  checked={program.has_online_group}
                  onChange={(e) => setProgram({...program, has_online_group: e.target.checked})}
                  className="mt-1 rounded border-gray-300 text-black focus:ring-black"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <Video size={16} className="text-purple-600" />
                    <span className="font-semibold text-sm">Online Group</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Group coaching, webinars, or live group calls.</p>
                </div>
              </label>
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
                <div className="pl-9 pr-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Location Details</label>
                    <button 
                      type="button"
                      onClick={() => setShowAddLocation(!showAddLocation)}
                      className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded hover:bg-blue-100 transition-colors flex items-center gap-1"
                    >
                      <Plus size={14} /> Add Location
                    </button>
                  </div>

                  {showAddLocation && (
                    <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
                      <input 
                        type="text" 
                        value={newLocationInput}
                        onChange={(e) => setNewLocationInput(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddLocation(); } }}
                        placeholder="Enter location name or address..."
                        className="flex-1 p-2 text-xs border border-gray-200 rounded bg-white focus:outline-none focus:border-black"
                      />
                      <button 
                        type="button"
                        onClick={handleAddLocation}
                        className="bg-black hover:bg-gray-800 text-white text-xs font-medium px-3 py-2 rounded transition-colors"
                      >
                        Save
                      </button>
                    </div>
                  )}

                  {locations.length > 0 ? (
                    <div className="space-y-2">
                      <select 
                        value={program.location_details}
                        onChange={e => setProgram({...program, location_details: e.target.value})}
                        className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black bg-white"
                      >
                        <option value="" disabled>-- Choose a location --</option>
                        {locations.map((loc, idx) => (
                          <option key={idx} value={loc}>{loc}</option>
                        ))}
                      </select>

                      {program.location_details && (
                        <div className="flex items-center justify-between bg-gray-50 p-2 rounded-lg border border-gray-200 text-xs">
                          <span className="font-medium text-gray-700 truncate mr-2">{program.location_details}</span>
                          <button 
                            type="button"
                            onClick={() => handleRemoveLocation(program.location_details)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Remove location"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <input 
                        type="text" 
                        value={program.location_details}
                        onChange={e => setProgram({...program, location_details: e.target.value})}
                        placeholder="Type location or click + Add Location..."
                        className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black"
                      />
                      <p className="text-[10px] text-gray-400">Click &quot;+ Add Location&quot; to manage custom location options.</p>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
