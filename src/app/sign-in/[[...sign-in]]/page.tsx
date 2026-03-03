"use client";

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-payaptic-navy">
      <div className="flex flex-col items-center">
        {/* Payaptic branding */}
        <div className="mb-6 flex flex-col items-center">
          <h1 className="text-[32px] font-bold leading-tight text-white">
            payaptic
          </h1>
          <p className="mt-1 text-[16px] font-normal text-white/70">
            Oracle Accelerator Suite
          </p>
        </div>

        {/* Clerk sign-in card */}
        <div className="overflow-hidden rounded-xl shadow-lg">
          <SignIn routing="hash" />
        </div>
      </div>
    </div>
  );
}
