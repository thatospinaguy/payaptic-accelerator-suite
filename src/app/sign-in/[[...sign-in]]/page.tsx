import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--payaptic-bg)]">
      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--payaptic-primary)] font-bold text-white">
            PA
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-lg font-bold text-[var(--payaptic-text)]">
              Payaptic
            </span>
            <span className="text-xs text-[var(--payaptic-text-muted)]">
              Oracle Accelerator Suite
            </span>
          </div>
        </div>
        <SignIn />
      </div>
    </div>
  );
}
