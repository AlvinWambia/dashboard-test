import React from 'react';
import { createAdminClient } from "@/supabase/server";
import Link from 'next/link';
import { Users, Search, ChevronRight, Clock, BookOpen, Mail, Calendar } from 'lucide-react';
import { formatDistanceToNow, parseISO, format } from 'date-fns';

export default async function ClientsPage() {
  const supabase = createAdminClient();
  
  const { data: clientsData, error } = await supabase
    .from('client_intake_forms')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching clients:", error.message || error);
  }

  let clients = [];
  if (clientsData && clientsData.length > 0) {
    const orderIds = clientsData.map(c => c.order_id).filter(Boolean);
    const clientIds = clientsData.map(c => c.id);
    let ordersMap = {};
    let subscriptionsMap = {};
    
    if (orderIds.length > 0) {
      const { data: orders } = await supabase
        .from('orders')
        .select('id, program_name, created_at')
        .in('id', orderIds);
        
      if (orders) {
        ordersMap = orders.reduce((acc, o) => ({ ...acc, [o.id]: o }), {});
      }
    }

    if (clientIds.length > 0) {
      const { data: subscriptions } = await supabase
        .from('subscriptions')
        .select('*')
        .in('client_id', clientIds);
        
      if (subscriptions) {
        subscriptionsMap = subscriptions.reduce((acc, sub) => ({ ...acc, [sub.client_id]: sub }), {});
      }
    }

    clients = clientsData.map(client => ({
      ...client,
      orders: client.order_id ? ordersMap[client.order_id] : null,
      subscription: subscriptionsMap[client.id] || null
    }));
  }

  return (
    <div className="p-8 max-w-7xl mx-auto w-full animate-in fade-in-0 duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Clients</h1>
          <p className="text-sm text-gray-500 mt-1">Manage all clients who have purchased a program.</p>
        </div>
        <div className="bg-white p-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-2">
          <Search size={20} className="text-gray-400 ml-2" />
          <input 
            type="text" 
            placeholder="Search clients..." 
            className="border-none focus:ring-0 text-sm outline-none w-64 bg-transparent"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="p-4 pl-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Client Name</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Program / Plan</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Sub Status</th>
                <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Next Billing</th>
                <th className="p-4 pr-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {clients?.map((client) => {
                const programName = client.orders?.program_name || 'Unknown Program';
                const purchaseDate = client.orders?.created_at || client.created_at;
                const duration = purchaseDate ? formatDistanceToNow(parseISO(purchaseDate)) : 'N/A';
                
                return (
                  <tr key={client.id} className="hover:bg-gray-50/50 transition-colors group cursor-pointer">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-gray-900 to-gray-700 text-white flex items-center justify-center font-bold shadow-sm">
                          {client.full_name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{client.full_name}</p>
                          <p className="text-xs text-gray-500">{client.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <BookOpen size={14} className="text-gray-400" />
                          <span className="font-medium">{programName}</span>
                        </div>
                        {client.subscription?.plan_code && (
                           <span className="text-xs text-gray-500 font-mono ml-5">{client.subscription.plan_code}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock size={16} className="text-gray-400" />
                        <span>{duration}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      {client.subscription ? (
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${
                          client.subscription.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                          client.subscription.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-100' :
                          'bg-amber-50 text-amber-700 border-amber-100'
                        }`}>
                          {client.subscription.status.charAt(0).toUpperCase() + client.subscription.status.slice(1)}
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 text-xs font-medium bg-gray-50 text-gray-600 rounded-full border border-gray-200">
                          No Sub
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      {client.subscription?.next_billing_date ? (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar size={14} className="text-gray-400" />
                          <span>{format(parseISO(client.subscription.next_billing_date), 'MMM d, yyyy')}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <Link href={`/admin/clients/${client.id}`}>
                        <button className="text-sm font-medium text-gray-600 bg-white border border-gray-200 shadow-sm hover:bg-gray-50 px-4 py-2 rounded-lg transition-all flex items-center justify-end gap-2 ml-auto group-hover:border-gray-300">
                          View Profile
                          <ChevronRight size={16} />
                        </button>
                      </Link>
                    </td>
                  </tr>
                );
              })}
              
              {(!clients || clients.length === 0) && (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-gray-500">
                    <Users size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-lg font-medium text-gray-900">No clients found</p>
                    <p className="text-sm mt-1">When users purchase a program, they will appear here.</p>
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
