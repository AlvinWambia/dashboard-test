import React from 'react';
import { createAdminClient } from "@/supabase/server";
import Link from 'next/link';
import { Search, Plus, BookOpen, Users, Edit, Trash2 } from 'lucide-react';

export default async function ProgramsPage() {
  const supabase = createAdminClient();
  
  // Fetch programs
  const { data: programsData, error: programsError } = await supabase
    .from('programs')
    .select('*')
    .order('created_at', { ascending: false });

  if (programsError) {
    console.error("Error fetching programs:", programsError.message || programsError);
  }

  // Fetch active subscriptions to count users per program
  const { data: subscriptionsData, error: subError } = await supabase
    .from('subscriptions')
    .select('plan_code, status')
    .eq('status', 'active');

  if (subError) {
    console.error("Error fetching subscriptions:", subError.message || subError);
  }

  let programs = programsData || [];

  // Calculate active subscribers per program
  if (subscriptionsData && subscriptionsData.length > 0) {
    const subscriberCounts = subscriptionsData.reduce((acc, sub) => {
      if (sub.plan_code) {
        acc[sub.plan_code] = (acc[sub.plan_code] || 0) + 1;
      }
      return acc;
    }, {});

    programs = programs.map(program => ({
      ...program,
      activeSubscribers: program.paystack_plan_code ? (subscriberCounts[program.paystack_plan_code] || 0) : 0
    }));
  } else {
    programs = programs.map(program => ({ ...program, activeSubscribers: 0 }));
  }

  return (
    <div className="p-8 max-w-7xl mx-auto w-full animate-in fade-in-0 duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Programs</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your subscription programs and forms.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2">
            <Search size={20} className="text-gray-400 ml-2" />
            <input 
              type="text" 
              placeholder="Search programs..." 
              className="border-none focus:ring-0 text-sm outline-none w-64 bg-transparent"
            />
          </div>
          <Link href="/admin/programs/builder">
            <button className="bg-black hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-sm active:scale-95">
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
              {programs?.map((program) => (
                <tr key={program.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
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
                      <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete Program">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {(!programs || programs.length === 0) && (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-gray-500">
                    <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-lg font-medium text-gray-900">No programs found</p>
                    <p className="text-sm mt-1 mb-4">Get started by creating your first program.</p>
                    <Link href="/admin/programs/builder">
                      <button className="text-sm font-medium text-black bg-white border border-gray-200 shadow-sm hover:bg-gray-50 px-4 py-2 rounded-lg transition-all mx-auto">
                        Create Program
                      </button>
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
