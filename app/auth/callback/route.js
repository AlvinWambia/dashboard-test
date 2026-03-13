import { createClient } from "@/supabase/server";
import { NextResponse } from "next/server";
import { getURL } from "@/lib/getURL";

export async function GET(request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get("next") ?? "/home2";

    if (code) {
        const supabase = await createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
            // Fetch user to get ID
            const { data: { user } } = await supabase.auth.getUser();
            
            if (user) {
                // Fetch actual role from the database
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single();

                if (profile?.role === 'admin') {
                    return NextResponse.redirect(getURL('/admin/dashboard'));
                }
            }
            
            return NextResponse.redirect(getURL(next));
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(getURL('/auth/auth-code-error'));
}