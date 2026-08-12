'use server';

import { createAdminClient } from '@/supabase/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function approveApplication(appId) {
    try {
        const supabase = createAdminClient();

        // 1. Fetch the application details
        const { data: app, error: fetchError } = await supabase
            .from('client_programs')
            .select(`
                *,
                programs (
                    title,
                    has_online_consultations,
                    has_physical_sessions,
                    booking_url,
                    location_details
                ),
                profiles (
                    full_name,
                    email
                )
            `)
            .eq('id', appId)
            .single();

        if (fetchError || !app) {
            console.error('Error fetching application:', fetchError);
            return { success: false, error: 'Application not found.' };
        }

        // 2. Update status to 'approved'
        const { error: updateError } = await supabase
            .from('client_programs')
            .update({ review_status: 'approved' })
            .eq('id', appId);

        if (updateError) {
            console.error('Error updating application status:', updateError);
            return { success: false, error: 'Failed to update database.' };
        }

        // 3. Send Email Notification
        const clientName = app.profiles.full_name?.split(' ')[0] || 'there';
        let emailHtml = `
            <h2>Good news, ${clientName}!</h2>
            <p>Your application for the <strong>${app.programs.title}</strong> has been approved!</p>
            <p>You can now access your program dashboard to view your materials.</p>
        `;

        // Fetch global consultation settings for booking URL fallback
        const { data: globalSettings } = await supabase
            .from('consultation_settings')
            .select('booking_url')
            .eq('id', 'default')
            .maybeSingle();

        const bookingUrl = app.programs.booking_url || globalSettings?.booking_url;
        const isOnlineConsultation = app.programs.has_online_one_on_one || app.programs.has_online_group || app.programs.has_online_consultations;
        if (isOnlineConsultation && bookingUrl) {
            emailHtml += `
                <div style="margin-top: 20px; padding: 15px; border-left: 4px solid #000; background: #f9f9f9;">
                    <h3>Book Your Consultation</h3>
                    <p>Please use the link below to schedule your online consultation at your earliest convenience:</p>
                    <a href="${bookingUrl}" style="display: inline-block; padding: 10px 20px; background: #000; color: #fff; text-decoration: none; border-radius: 5px;">Book Consultation</a>
                </div>
            `;
        }

        if (app.programs.has_physical_sessions && app.programs.location_details) {
            emailHtml += `
                <div style="margin-top: 20px; padding: 15px; border-left: 4px solid #000; background: #f9f9f9;">
                    <h3>Physical Session Location</h3>
                    <p>Your physical sessions will be held at:</p>
                    <p><strong>${app.programs.location_details}</strong></p>
                </div>
            `;
        }

        emailHtml += `<p style="margin-top: 30px;">Let's get to work!<br>- The MyFit Team</p>`;

        // Attempt to send email, but don't fail the approval if email fails
        if (process.env.RESEND_API_KEY) {
            try {
                await resend.emails.send({
                    from: 'MyFit <info@myfitraining.com>', // Update with a verified domain in production
                    to: app.profiles.email,
                    subject: `Application Approved: ${app.programs.title}`,
                    html: emailHtml,
                });
            } catch (emailError) {
                console.error('Failed to send email via Resend:', emailError);
                // We still return success because the DB updated correctly.
            }
        } else {
            console.warn('RESEND_API_KEY not found. Skipping email notification.');
        }

        return { success: true };
    } catch (error) {
        console.error('Unexpected error in approveApplication:', error);
        return { success: false, error: 'An unexpected error occurred.' };
    }
}
