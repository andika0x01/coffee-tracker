import BottomNav from "@/components/BottomNav";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-[100dvh] bg-black text-white selection:bg-accent selection:text-black">
      {/* Desktop Sidebar placeholder - will be visible on large screens */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:w-20 lg:flex lg:flex-col lg:items-center lg:py-8 lg:border-r lg:border-white/10 lg:bg-black/50 lg:backdrop-blur-xl">
        {/* Sidebar content would go here */}
      </div>

      <main className="lg:pl-20 min-h-full">
        <div className="max-w-[1400px] mx-auto px-4 py-8 md:px-8 lg:py-12">{children}</div>
      </main>

      <BottomNav />
    </div>
  );
}
