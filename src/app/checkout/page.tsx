"use client";

import { Header } from "@/components/header";
import { CheckoutForm } from '@/components/checkout/checkout-form';

export default function CheckoutPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="container flex-1 py-12 md:py-24">
        <CheckoutForm />
      </main>
    </div>
  );
}
