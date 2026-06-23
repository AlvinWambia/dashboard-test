import { createAdminClient } from '@/supabase/server';
import ApplicationsClient from './ApplicationsClient';

export const dynamic = 'force-dynamic';

export default async function ApplicationsPage() {
    const supabase = await createAdminClient();

    // Fetch pending applications from client_programs
    const { data: pendingApps, error } = await supabase
        .from('client_programs')
        .select(`
            *,
            programs (
                id,
                title
            ),
            profiles (
                id,
                full_name,
                email
            )
        `)
        .eq('review_status', 'pending')
        .order('granted_at', { ascending: false });

    // For each pending app, we want to fetch the user's intake form
    const appsWithForms = await Promise.all((pendingApps || []).map(async (app) => {
        const { data: form } = await supabase
            .from('client_intake_forms')
            .select('*')
            .eq('user_id', app.client_id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        return {
            ...app,
            intake_form: form || null
        };
    }));

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Pending Applications</h1>
            <ApplicationsClient initialApplications={appsWithForms} />
        </div>
    );
}
