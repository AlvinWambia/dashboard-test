import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CreditCard, Truck, Wallet, Plus, Minus, Pencil } from "lucide-react";

export default function CheckoutPage() {
    return (
        <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
            {/* Header Stepper (Simplified) */}
            <div className="flex gap-8 mb-8 text-sm font-medium border-b pb-4">
                <div className="flex items-center gap-2 text-primary border-b-2 border-primary pb-4 -mb-4">
                    <span className="bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px]">✓</span>
                    Customer Information
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Forms */}
                <div className="lg:col-span-2 space-y-8">
                    <section>
                        <h2 className="text-xl font-bold mb-1">Check Out Your Items</h2>
                        <p className="text-sm text-muted-foreground mb-6">For a better experience, check your item and choose your shipping before ordering.</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">First Name</Label>
                                <Input id="firstName" defaultValue="Mohammad" className="bg-white border-2 focus-visible:ring-black" />
                            </div>
                            <div className="space-y-2 text-muted-foreground">
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input id="lastName" defaultValue="Abdullah" className="bg-gray-100 border-none pointer-events-none" />
                            </div>
                        </div>

                    </section>

                    <section>
                        <div className="flex justify-between items-end mb-4">
                            <h3 className="font-bold">Payment Method</h3>
                        </div>

                        {/* Active Payment Method Card */}
                        <div className="relative group">
                            <div className="flex items-center justify-between p-5 border-2 border-black rounded-2xl bg-white shadow-sm transition-all">
                                <div className="flex items-center gap-4">
                                    {/* Payment Icon Container */}
                                    <div className="w-12 h-10 bg-gray-100 rounded-lg flex items-center justify-center border">
                                        <CreditCard className="w-6 h-6 text-blue-600" />
                                    </div>

                                    <div>
                                        <p className="font-bold text-sm">Paystack</p>
                                        <p className="text-xs text-muted-foreground italic">Credit or Debit Card</p>
                                    </div>
                                </div>

                                {/* Checkmark to show it's active */}
                                <div className="bg-black text-white rounded-full p-1">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="16"
                                        height="16"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="3"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                </div>
                            </div>

                            {/* Subtle helper text */}
                            <p className="text-[11px] text-muted-foreground mt-2 px-1">
                                Your transaction is encrypted and secure.
                            </p>
                        </div>
                    </section>
                </div>

                {/* Right Column: Order Summary */}
                <div className="lg:col-span-1">
                    <Card className="sticky top-6">
                        <CardHeader>
                            <CardTitle className="text-lg">Current Order</CardTitle>
                            <p className="text-xs text-muted-foreground">The sum of all total payments for goods there</p>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Product Item */}
                            <div className="space-y-4">
                                <OrderItem name="Black Danakil Eyewear-TP399K" price={215.00} image="/glasses1.png" />
                                <OrderItem name="Silver Zilalem Eyewear TP399Ky" price={230.00} image="/glasses2.png" />
                            </div>

                            <Separator />

                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between font-bold text-lg">
                                    <span>Subtotal</span>
                                    <span>$ 445.00</span>
                                </div>
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Items</span>
                                    <span>2x</span>
                                </div>
                                <div className="flex justify-between text-muted-foreground font-medium">
                                    <span>Code Promo</span>
                                    <span className="text-black">-$ 15.00</span>
                                </div>
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Delivery Service</span>
                                    <span>$ 15.00</span>
                                </div>
                                <div className="flex justify-between text-muted-foreground">
                                    <span>Vat (0%)</span>
                                    <span>$ 0.00</span>
                                </div>
                            </div>

                            <Button className="w-full py-6 text-lg bg-black hover:bg-zinc-800 rounded-2xl">
                                Pay $ 445.00
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function OrderItem({ name, price, image }) {
    return (
        <div className="flex gap-3 items-center border rounded-xl p-3 bg-white">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center p-2">
                {/* Replace with your <Image /> component */}
                <div className="bg-zinc-300 w-full h-full rounded" />
            </div>
            <div className="flex-1">
                <div className="flex justify-between items-start">
                    <h4 className="text-xs font-bold leading-tight max-w-[120px]">{name}</h4>
                    <span className="text-xs font-bold">$ {price.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px] text-muted-foreground">Quantity : 1</span>
                    <div className="flex items-center border rounded-md">
                        <button className="p-1 border-r"><Plus size={12} /></button>
                        <span className="px-2 text-xs">1</span>
                        <button className="p-1 border-l"><Minus size={12} /></button>
                    </div>
                </div>
            </div>
        </div>
    );
}