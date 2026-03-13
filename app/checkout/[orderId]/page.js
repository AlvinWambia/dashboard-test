import { createClient } from "@/supabase/server";
import { notFound } from "next/navigation";
import CheckoutClient from "@/components/CheckoutClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { ArrowUpRight, Heart, Activity, MousePointer2, Plus, AlertCircleIcon, Plane, Tag, MessageSquare, Star, Pencil, CreditCard } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

// This page will be responsible for displaying the order details
// and handling the payment process.
export default async function CheckoutPage({ params }) {
    const { orderId } = await params;
    const supabase = await createClient();

    // Fetch the logged-in user to get their email
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch the order details from the database
    const { data: order, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

    // If the order is not found, or if there was an error, show a 404 page.
    if (error || !order) {
        console.error(`Error fetching order with ID ${orderId}.`);
        notFound();
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-md lg:max-w-6xl grid lg:grid-cols-2 lg:h-[40rem] rounded-3xl shadow-2xl bg-white overflow-hidden">
                <div className="mx-5 my-5">
                    <h1 className="text-2xl font-semibold mb-2  pb-2 mx-5 mt-4">Checkout</h1>
                    <Tabs defaultValue="customerInformation" className="mx-5">
                        <TabsList variant="line">
                            <TabsTrigger value="customerInformation">Customer Information</TabsTrigger>
                            <TabsTrigger value="paymentDetails">Payment Details</TabsTrigger>
                        </TabsList>
                        <TabsContent value="customerInformation">
                            <h2 className="text-xl font-bold mb-1 mt-5">Check Out Your Items</h2>
                            <p className="text-sm text-muted-foreground mb-6">For a better experience, check your item and choose your shipping before ordering.</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="fullName">Full name</Label>
                                    <Input id="fullName" placeholder="Name" defaultValue={user?.user_metadata?.full_name || ""} className="bg-white border-2 focus-visible:ring-slate-300" />
                                </div>
                                <div className="space-y-2 ">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" placeholder="Email" defaultValue={user?.email || ""} className="bg-white border-2 focus-visible:ring-slate-300" />
                                </div>
                            </div>

                            <section className="mt-5">
                                <div className="flex justify-between items-end mb-4">
                                    <h3 className="font-bold">Payment Method</h3>
                                </div>

                                <div className="relative group">
                                    <div className="flex items-center justify-between p-5 border-1 border-slate-500 rounded-2xl bg-white shadow-sm transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-10 bg-gray-100 rounded-lg flex items-center justify-center border">
                                                <CreditCard className="w-6 h-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm">Paystack</p>
                                                <p className="text-xs text-muted-foreground italic">Visa, M-Pesa, and Paypal.</p>
                                            </div>
                                        </div>
                                        <div className="bg-black text-white rounded-full p-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground mt-2 px-1">Your transaction is encrypted and secure.</p>
                                </div>
                            </section>
                        </TabsContent>
                    </Tabs>
                    <p className="text-sm mx-5 my-4">Once you confirm your details are fine, proceed with payment.</p>
                </div>

                <div className="bg-white p-8 rounded-lg  max-w-md mx-auto">
                    <Card className="mx-auto w-100 px-5" >
                        <h2 className="text-2xl font-semibold pb-2">Order Summary</h2>
                        <p className="text-xs text-muted-foreground  mb-2">The sum of all total payments for goods there</p>
                        <div className="space-y-2 mb-6">
                            <p><strong>Product:</strong></p>
                            <p className="text-lg">{order.program_name}</p>
                        </div>
                        <Separator />
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between font-bold text-lg my-1">
                                <span>Total</span>
                                <p className="text-lg font-bold">KES {order.price.toFixed(2)}</p>
                            </div>
                            <div className="flex justify-between text-muted-foreground my-1">
                                <span>Order id</span>
                                <p className="text-xs pl-8 pt-1">{order.id}</p>
                            </div>
                        </div>
                        
                        <div className="mt-5">
                            <CheckoutClient 
                                email={user?.email || "customer@example.com"} 
                                amount={order.price} 
                                orderId={order.id}
                            />
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
