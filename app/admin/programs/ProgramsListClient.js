"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Plus, BookOpen, Users, Edit, Trash2, AlertTriangle, X } from 'lucide-react';
import { deleteProgram } from '@/app/actions/programActions';
import { toast } from 'sonner';

export default function ProgramsListClient({ initialPrograms }) {
  const [programs, setPrograms] = useState(initialPrograms || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteModalProgram, setDeleteModalProgram] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setPrograms(initialPrograms || []);
  }, [initialPrograms]);

  const filteredPrograms = programs.filter(program => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (program.title && program.title.toLowerCase().includes(q)) ||
      (program.description && program.description.toLowerCase().includes(q)) ||
      (program.paystack_plan_code && program.paystack_plan_code.toLowerCase().includes(q))
    );
  });

  const handleDeleteConfirm = async () => {
    if (!deleteModalProgram) return;
    setIsDeleting(true);
    
    const result = await deleteProgram(deleteModalProgram.id);
    if (result.success) {
      toast.success(`Program "${deleteModalProgram.title}" deleted successfully`);
      setPrograms(prev => prev.filter(p => p.id !== deleteModalProgram.id));
      setDeleteModalProgram(null);
    } else {
      toast.error(result.error || "Failed to delete program");
    }
    
    setIsDeleting(false);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto w-full animate-in fade-in-0 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Programs</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your subscription programs and forms.</p>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2 flex-1 sm:w-64">
            <Search size={20} className="text-gray-400 ml-2" />
            <input 
              type="text" 
              placeholder="Search programs..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-none focus:ring-0 text-sm outline-none w-full bg-transparent"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="p-1 text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            )}
          </div>
          <Link href="/admin/programs/builder">
            <button className="bg-black hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-sm active:scale-95 whitespace-nowrap">
              <Plus size={18} />
              Create Program
            </button>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="p-4 pl-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Program Details</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Plan Code</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Subs</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="p-4 pr-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredPrograms.map((program) => (
                <tr key={program.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {program.image_url ? (
                          <img src={program.image_url} alt={program.title} className="w-full h-full object-cover" />
                        ) : (
                          <BookOpen size={20} className="text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{program.title}</p>
                        <p className="text-xs text-gray-500 truncate max-w-xs">{program.description || 'No description'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-gray-600 font-mono">
                      {program.paystack_plan_code || <span className="text-gray-400 italic">Not set</span>}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Users size={16} className="text-gray-400" />
                      <span className="font-medium">{program.activeSubscribers}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    {program.is_active ? (
                       <span className="px-2.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
                         Active
                       </span>
                    ) : (
                      <span className="px-2.5 py-1 text-xs font-medium bg-gray-50 text-gray-700 rounded-full border border-gray-200">
                         Draft
                       </span>
                    )}
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/programs/builder?id=${program.id}`}>
                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit Program">
                          <Edit size={18} />
                        </button>
                      </Link>
                      <button 
                        onClick={() => setDeleteModalProgram(program)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                        title="Delete Program"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {filteredPrograms.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-gray-500">
                    <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-lg font-medium text-gray-900">
                      {searchQuery ? `No programs matching "${searchQuery}"` : 'No programs found'}
                    </p>
                    <p className="text-sm mt-1 mb-4">
                      {searchQuery ? 'Try adjusting your search terms.' : 'Get started by creating your first program.'}
                    </p>
                    {!searchQuery && (
                      <Link href="/admin/programs/builder">
                        <button className="text-sm font-medium text-black bg-white border border-gray-200 shadow-sm hover:bg-gray-50 px-4 py-2 rounded-lg transition-all mx-auto">
                          Create Program
                        </button>
                      </Link>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalProgram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in-0 duration-200">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-100 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 text-red-600 rounded-full">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Delete Program</h3>
                <p className="text-xs text-gray-500">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-sm text-gray-600">
              Are you sure you want to delete <strong className="text-gray-900">{deleteModalProgram.title}</strong>? All associated steps, questions, and uploaded assets will also be removed.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalProgram(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting ? 'Deleting...' : 'Delete Program'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
