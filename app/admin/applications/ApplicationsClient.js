'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { approveApplication } from '@/app/actions/applicationActions';
import { CheckCircle, Clock } from 'lucide-react';

export default function ApplicationsClient({ initialApplications }) {
    const [applications, setApplications] = useState(initialApplications);
    const [processingId, setProcessingId] = useState(null);

    const handleApprove = async (appId) => {
        setProcessingId(appId);
        try {
            const result = await approveApplication(appId);
            if (result.success) {
                toast.success('Application approved! Email sent to the client.');
                setApplications(applications.filter(app => app.id !== appId));
            } else {
                toast.error(result.error || 'Failed to approve application.');
            }
        } catch (error) {
            toast.error('An unexpected error occurred.');
        } finally {
            setProcessingId(null);
        }
    };

    if (applications.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-slate-100 shadow-sm">
                <CheckCircle className="w-16 h-16 text-slate-200 mb-4" />
                <h2 className="text-xl font-bold text-slate-700">All caught up!</h2>
                <p className="text-slate-500">There are no pending applications to review.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {applications.map((app) => (
                <Card key={app.id} className="rounded-3xl border-slate-200 overflow-hidden shadow-sm">
                    <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle className="text-xl flex items-center gap-2">
                                    {app.profiles?.full_name || 'Unknown User'}
                                    <span className="text-xs font-normal px-2 py-1 bg-orange-100 text-orange-700 rounded-full flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> Pending Review
                                    </span>
                                </CardTitle>
                                <CardDescription className="mt-1">
                                    Applied for: <strong>{app.programs?.title}</strong><br />
                                    Email: {app.profiles?.email}
                                </CardDescription>
                            </div>
                            <Button 
                                onClick={() => handleApprove(app.id)}
                                disabled={processingId === app.id}
                                className="bg-green-600 hover:bg-green-700 text-white rounded-full px-6"
                            >
                                {processingId === app.id ? 'Approving...' : 'Approve & Notify'}
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <h4 className="font-bold text-slate-800 mb-4">Intake Form Details</h4>
                        {app.intake_form ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
                                <div>
                                    <p className="text-slate-500 font-semibold mb-1">Body Metrics</p>
                                    <p><strong>Weight:</strong> {app.intake_form.current_weight} kg</p>
                                    <p><strong>Height:</strong> {app.intake_form.height} cm</p>
                                    <p><strong>Activity:</strong> {app.intake_form.activity_level}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500 font-semibold mb-1">Goals</p>
                                    <p><strong>Main Goal:</strong> {app.intake_form.goal}</p>
                                    <p className="text-slate-600 truncate" title={app.intake_form.goal_description}>
                                        {app.intake_form.goal_description || 'No description provided.'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-slate-500 font-semibold mb-1">Medical</p>
                                    <p><strong>Injuries:</strong> {app.intake_form.injuries || 'None'}</p>
                                    <p><strong>Conditions:</strong> {app.intake_form.medical_conditions || 'None'}</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-slate-500 italic">No intake form found for this user.</p>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
