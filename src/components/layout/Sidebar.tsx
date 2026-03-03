"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  FileUp,
  Scale,
  Calculator,
  FolderTree,
  X,
} from "lucide-react";
import { UserButton, useUser } from "@clerk/nextjs";
import { useSidebar } from "@/components/dashboard/SidebarContext";
import { tools } from "@/lib/tools-config";

const iconMap = {
  FileUp,
  Scale,
  Calculator,
  FolderTree,
} as const;

export default function Sidebar() {
  const pathname = usePathname();
  const { isOpen, close } = useSidebar();
  const { user } = useUser();

  const navContent = (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-6">
        <Link href="/dashboard" className="block" onClick={close}>
          <h1 className="text-2xl font-bold text-white">payaptic</h1>
        </Link>
        <button
          onClick={close}
          className="text-white/70 hover:text-white md:hidden"
          aria-label="Close sidebar"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Divider */}
      <div className="mx-6 border-t border-white/10" />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6">
        <Link
          href="/dashboard"
          onClick={close}
          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
            pathname === "/dashboard"
              ? "border-l-2 border-payaptic-emerald bg-white/10 text-white"
              : "text-white/70 hover:bg-white/5 hover:text-white"
          }`}
        >
          <Home className="h-4 w-4" />
          Dashboard
        </Link>

        {/* Tools section */}
        <div className="mb-2 mt-8 px-3 text-[11px] font-semibold uppercase tracking-widest text-white/50">
          Tools
        </div>

        {tools.map((tool) => {
          const Icon = iconMap[tool.icon];
          const isActive = pathname === tool.route;
          const isComingSoon = tool.status === "coming-soon";

          return (
            <Link
              key={tool.slug}
              href={isComingSoon ? "#" : tool.route}
              onClick={(e) => {
                if (isComingSoon) {
                  e.preventDefault();
                } else {
                  close();
                }
              }}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                isActive
                  ? "border-l-2 border-payaptic-emerald bg-white/10 font-medium text-white"
                  : isComingSoon
                    ? "cursor-not-allowed text-white/30"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="flex-1">{tool.name}</span>
              {isComingSoon && (
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white/50">
                  Soon
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User section at bottom */}
      <div className="border-t border-white/10 px-4 py-4">
        <div className="flex items-center gap-3 px-2">
          <UserButton
            afterSignOutUrl="/sign-in"
            appearance={{
              elements: {
                avatarBox: "h-8 w-8",
              },
            }}
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">
              {user?.firstName} {user?.lastName}
            </p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-[260px] flex-shrink-0 flex-col bg-payaptic-navy md:flex">
        {navContent}
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={close} />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col bg-payaptic-navy">
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
}
