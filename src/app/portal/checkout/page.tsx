
import { Header } from "@/components/header";
import { CheckoutForm } from '@/components/checkout/checkout-form';
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

function CheckoutSkeleton() {
  return (
    <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-2">
      <div className="flex flex-col gap-8">
        <Skeleton className="h-64 w-full" />
      </div>
      <div className="flex flex-col gap-8">
        <Skeleton className="h-96 w-full" />
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="container flex-1 py-12 md:py-24">
        <Suspense fallback={<CheckoutSkeleton />}>
          <CheckoutForm />
        </Suspense>
      </main>
    </div>
  );
}
