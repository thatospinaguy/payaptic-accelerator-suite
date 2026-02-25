"use client";

import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500 font-bold text-white text-sm">
        PA
      </div>
      <div className="flex flex-col leading-tight">
        <span className="text-sm font-bold text-white">Payaptic</span>
        <span className="text-xs text-slate-300">Accelerator Suite</span>
      </div>
    </Link>
  );
}
